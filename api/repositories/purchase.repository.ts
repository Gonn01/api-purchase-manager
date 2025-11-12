import { executeQuery } from "../db";

export class PurchaseRepository {
    async create(data: {
        financial_entity_id: number;
        name: string;
        amount: number;
        currency_type: number;
        type: number;
        amount_per_quota?: number | null;
        number_of_quotas?: number | null;
        first_quota_date?: string | null;
        fixed_expense?: boolean;
        image?: string | null;
        ignored?: boolean;
    }) {
        const rows = await executeQuery<{ id: number; financial_entity_id: number }>(
            `INSERT INTO purchases (
         financial_entity_id, name, amount, currency_type, type,
         amount_per_quota, number_of_quotas, first_quota_date,
         fixed_expense, image, ignored, deleted
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,false)
       RETURNING id, financial_entity_id`,
            [
                data.financial_entity_id, data.name, data.amount, data.currency_type, data.type,
                data.amount_per_quota ?? null, data.number_of_quotas ?? null, data.first_quota_date ?? null,
                !!data.fixed_expense, data.image ?? null, !!data.ignored
            ],
            true
        );
        return rows[0];
    }

    async findByIdWithOwner(purchaseId: number) {
        const rows = await executeQuery<{ id: number; financial_entity_id: number; user_id: number }>(
            `SELECT p.id, p.financial_entity_id, fe.user_id
         FROM purchases p
         JOIN financial_entities fe ON fe.id = p.financial_entity_id
        WHERE p.id=$1 AND p.deleted=false AND fe.deleted=false
        LIMIT 1`,
            [purchaseId],
            true
        );
        return rows[0] ?? null;
    }

    async update(purchaseId: number, patch: Record<string, any>) {
        const map: Record<string, string> = {
            name: "name",
            amount: "amount",
            currencyType: "currency_type",
            type: "type",
            amountPerQuota: "amount_per_quota",
            numberOfQuotas: "number_of_quotas",
            firstQuotaDate: "first_quota_date",
            fixedExpense: "fixed_expense",
            image: "image",
            ignored: "ignored",
        };

        const sets: string[] = [];
        const values: any[] = [];

        for (const [k, v] of Object.entries(patch)) {
            if (!(k in map)) continue;
            sets.push(`${map[k]} = $${sets.length + 1}`);
            values.push(v);
        }
        if (!sets.length) return;

        values.push(purchaseId);
        await executeQuery(
            `UPDATE purchases SET ${sets.join(", ")}, updated_at=NOW()
        WHERE id=$${values.length} AND deleted=false`,
            values,
            true
        );
    }

    async softDelete(purchaseId: number) {
        await executeQuery(
            `UPDATE purchases SET deleted=true, deleted_at=NOW()
        WHERE id=$1 AND deleted=false`,
            [purchaseId],
            true
        );
    }// Toggle ignore y devolver ids + estado actual
    async toggleIgnore(purchaseId: number): Promise<{ id: number; financial_entity_id: number; ignored: boolean }> {
        const rows = await executeQuery<{ id: number; financial_entity_id: number; ignored: boolean }>(
            `UPDATE purchases
         SET ignored = NOT ignored,
             updated_at = NOW()
       WHERE id = $1 AND deleted = false
       RETURNING id, financial_entity_id, ignored`,
            [purchaseId],
            false // write
        );
        if (!rows.length) { const e: any = new Error("Purchase not found."); e.status = 404; e.code = "PURCHASE_NOT_FOUND"; throw e; }
        const r = rows[0];
        return { id: Number(r.id), financial_entity_id: Number(r.financial_entity_id), ignored: !!r.ignored };
    }

    // Obtener compra completa para lógica de cuotas
    async getByIdForQuota(purchaseId: number) {
        const rows = await executeQuery<any>(
            `SELECT id, name, amount, amount_per_quota, number_of_quotas, payed_quotas,
              currency_type, type, fixed_expense, first_quota_date, finalization_date,
              image, ignored, financial_entity_id
         FROM purchases
        WHERE id = $1 AND deleted = false
        LIMIT 1`,
            [purchaseId],
            true
        );
        return rows[0] ?? null as null | {
            id: number;
            name: string;
            amount: string | number;
            amount_per_quota: string | number | null;
            number_of_quotas: number | null;
            payed_quotas: number | null;
            currency_type: number;
            type: number;
            fixed_expense: boolean;
            first_quota_date: string | Date | null;
            finalization_date: string | Date | null;
            image: string | null;
            ignored: boolean;
            financial_entity_id: number;
        };
    }

    // Actualizar campos de cuotas y type, devolviendo la fila necesaria
    async updateQuotaAndType(
        purchaseId: number,
        data: { payedQuotas: number; firstQuotaDate: Date | string | null; finalizationDate: Date | string | null; type: number }
    ) {
        const rows = await executeQuery<any>(
            `UPDATE purchases
          SET payed_quotas = $1,
              first_quota_date = $2,
              finalization_date = $3,
              type = $4,
              updated_at = NOW()
        WHERE id = $5 AND deleted = false
      RETURNING id, payed_quotas, financial_entity_id`,
            [data.payedQuotas, data.firstQuotaDate, data.finalizationDate, data.type, purchaseId],
            false
        );
        if (!rows.length) { const e: any = new Error("Failed to update purchase."); e.status = 500; e.code = "UPDATE_FAILED"; throw e; }
        const r = rows[0];
        return { id: Number(r.id), payed_quotas: Number(r.payed_quotas), financial_entity_id: Number(r.financial_entity_id) };
    }
    /** Trae las compras necesarias para pagar 1 cuota solo si están en estado current (filtramos luego en service) */
    async getManyForPayCurrent(purchaseIds: number[]) {
        const rows = await executeQuery<any>(
            `SELECT id, number_of_quotas, payed_quotas, type, fixed_expense,
              first_quota_date, finalization_date, financial_entity_id
         FROM purchases
        WHERE id = ANY($1) AND deleted = false`,
            [purchaseIds],
            true
        );
        return rows as Array<{
            id: number;
            number_of_quotas: number | null;
            payed_quotas: number | null;
            type: number;
            fixed_expense: boolean;
            first_quota_date: string | Date | null;
            finalization_date: string | Date | null;
            financial_entity_id: number;
        }>;
    }

    /** Batch update para pagar 1 cuota (o cerrar si queda saldada) */
    async batchUpdatePayCurrent(updates: Array<{
        id: number;
        payedQuotas: number;
        firstQuotaDate: Date | string | null;
        finalizationDate: Date | string | null;
        type: number;
    }>) {
        if (!updates.length) return;

        const values: any[] = [];
        const tuples = updates.map((u, i) => {
            const o = i * 5;
            values.push(u.id, u.payedQuotas, u.firstQuotaDate, u.finalizationDate, u.type);
            return `($${o + 1}::BIGINT, $${o + 2}::INT, $${o + 3}::TIMESTAMP, $${o + 4}::TIMESTAMP, $${o + 5}::INT)`;
        });

        const sql = `
      UPDATE purchases AS p
         SET payed_quotas     = u.payed_quotas,
             first_quota_date = u.first_quota_date,
             finalization_date= u.finalization_date,
             type             = u.type,
             updated_at       = NOW()
        FROM (VALUES ${tuples.join(", ")})
             AS u(id, payed_quotas, first_quota_date, finalization_date, type)
       WHERE p.id = u.id
         AND p.deleted = false
      RETURNING p.id
    `;
        await executeQuery(sql, values, false);
    } async getDetails(purchaseId: number) {
        const rows = await executeQuery<any>(
            `SELECT id, financial_entity_id, name, amount, amount_per_quota,
              number_of_quotas, payed_quotas, currency_type, type, fixed_expense,
              first_quota_date, finalization_date, image, ignored
         FROM purchases
        WHERE id = $1 AND deleted = false
        LIMIT 1`,
            [purchaseId],
            true
        );
        return rows[0] ?? null as null | {
            id: number; financial_entity_id: number; name: string;
            amount: string | number; amount_per_quota: string | number | null;
            number_of_quotas: number | null; payed_quotas: number | null;
            currency_type: number; type: number; fixed_expense: boolean;
            first_quota_date: string | Date | null; finalization_date: string | Date | null;
            image: string | null; ignored: boolean;
        };
    }

    async listLogs(purchaseId: number) {
        // ajustá el nombre de tabla si tu esquema usa otro (ej: purchase_logs)
        const rows = await executeQuery<{ id: number; content: string; created_at: string }>(
            `SELECT id, content, created_at
         FROM purchases_logs
        WHERE purchase_id = $1
        ORDER BY created_at DESC`,
            [purchaseId],
            true
        );
        return rows.map(r => ({
            id: Number(r.id),
            content: String(r.content),
            created_at: new Date(r.created_at).toISOString(),
        }));
    }
}
