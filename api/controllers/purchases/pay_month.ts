import { executeQuery } from "../../db";
import { PurchaseHomeDto } from "../../dtos/home/PurchaseHomeDto";
import CustomException from "../../models/CustomException";
import { PurchaseTypeEnum } from "../../models/PurchaseType";

/**
 * Marca como pagada la cuota de este mes para varias compras y
 * devuelve el estado final COMPLETO de la entidad financiera afectada.
 */
export async function payMonth(purchaseIds: number[]): Promise<PurchaseHomeDto[]> {
    if (!Array.isArray(purchaseIds) || purchaseIds.length === 0) {
        throw new CustomException({
            title: "Parámetros inválidos",
            message: "purchaseIds debe ser un array no vacío.",
        });
    }

    const now = new Date();

    // 1) Traer purchases objetivo
    const selectQuery = `
    SELECT
      id, name, amount, amount_per_quota, number_of_quotas, payed_quotas,
      currency_type, type, fixed_expense, first_quota_date, finalization_date,
      image, ignored, financial_entity_id, deleted
    FROM purchases
    WHERE id = ANY($1) AND deleted = false
  `;
    const rows = await executeQuery<any>(selectQuery, [purchaseIds], true);

    if (rows.length === 0) {
        throw new CustomException({
            title: "No encontrado",
            message: "No se encontraron compras con los IDs provistos.",
        });
    }

    // 2) Validar una sola FE
    const feIds = new Set<number>(rows.map((r: any) => Number(r.financial_entity_id)));
    if (feIds.size !== 1) {
        throw new CustomException({
            title: "Compras de múltiples entidades",
            message: "payMonth debe recibir compras de una única entidad financiera.",
        });
    }
    const [financialEntityId] = Array.from(feIds);

    type UpdateItem = {
        id: number;
        payed_quotas: number;
        first_quota_date: Date | null;
        finalization_date: Date | null;
        type: number;
    };

    const updates: UpdateItem[] = [];

    for (const p of rows) {
        const fixed = Boolean(p.fixed_expense);
        const totalQuotas = Number(p.number_of_quotas ?? 0);
        const currentPayed = Number(p.payed_quotas ?? 0);
        const curType = Number(p.type);

        // Caso A: gasto fijo -> no se procesa
        if (fixed) continue;

        // Caso B: sin cuotas (totalQuotas === 0) -> debe estar Settled
        if (totalQuotas === 0) {
            const shouldBeSettled =
                curType === PurchaseTypeEnum.CurrentDebtorPurchase ||
                curType === PurchaseTypeEnum.CurrentCreditorPurchase;

            if (shouldBeSettled) {
                updates.push({
                    id: Number(p.id),
                    payed_quotas: currentPayed,              // no cambia
                    first_quota_date: p.first_quota_date ? new Date(p.first_quota_date) : null,
                    finalization_date: p.finalization_date ? new Date(p.finalization_date) : now,
                    type:
                        curType === PurchaseTypeEnum.CurrentDebtorPurchase
                            ? PurchaseTypeEnum.SettledDebtorPurchase
                            : PurchaseTypeEnum.SettledCreditorPurchase,
                });
            }
            continue;
        }

        // Caso C: ya alcanzó o superó cuotas -> normalizar a Settled si no lo está
        if (currentPayed >= totalQuotas) {
            const shouldBeSettled =
                curType === PurchaseTypeEnum.CurrentDebtorPurchase ||
                curType === PurchaseTypeEnum.CurrentCreditorPurchase;

            if (shouldBeSettled) {
                updates.push({
                    id: Number(p.id),
                    payed_quotas: currentPayed,              // no cambia
                    first_quota_date: p.first_quota_date ? new Date(p.first_quota_date) : null,
                    finalization_date: p.finalization_date ? new Date(p.finalization_date) : now,
                    type:
                        curType === PurchaseTypeEnum.CurrentDebtorPurchase
                            ? PurchaseTypeEnum.SettledDebtorPurchase
                            : PurchaseTypeEnum.SettledCreditorPurchase,
                });
            }
            continue;
        }

        // Caso D: todavía no está saldada -> pagar 1 cuota
        const newPayed = currentPayed + 1;
        const newFirstQuotaDate =
            currentPayed === 0 || !p.first_quota_date ? now : p.first_quota_date;
        const isNowSettled = newPayed >= totalQuotas;

        updates.push({
            id: Number(p.id),
            payed_quotas: newPayed,
            first_quota_date: newFirstQuotaDate ? new Date(newFirstQuotaDate) : null,
            finalization_date: isNowSettled ? now : null,
            type: isNowSettled
                ? (curType === PurchaseTypeEnum.CurrentDebtorPurchase
                    ? PurchaseTypeEnum.SettledDebtorPurchase
                    : PurchaseTypeEnum.SettledCreditorPurchase)
                : curType,
        });
    }

    // 4) Ejecutar batch UPDATE (si hay algo para actualizar)
    if (updates.length > 0) {
        const values: any[] = [];
        const tuples = updates.map((u, i) => {
            const o = i * 5;
            values.push(u.id, u.payed_quotas, u.first_quota_date, u.finalization_date, u.type);
            return `($${o + 1}::BIGINT, $${o + 2}::INT, $${o + 3}::TIMESTAMP, $${o + 4}::TIMESTAMP, $${o + 5}::INT)`;
        });

        const updateQuery = `
      UPDATE purchases AS p
         SET payed_quotas     = u.payed_quotas,
             first_quota_date = u.first_quota_date,
             finalization_date= u.finalization_date,
             type             = u.type
        FROM (VALUES ${tuples.join(", ")})
             AS u(id, payed_quotas, first_quota_date, finalization_date, type)
       WHERE p.id = u.id
         AND p.deleted = false
      RETURNING p.id
    `;
        await executeQuery<any>(updateQuery, values, false);
    }

    // 5) Devolver estado final completo de la FE
    const allAfterQuery = `
    SELECT
      id, name, amount, amount_per_quota, number_of_quotas, payed_quotas,
      currency_type, type, fixed_expense, first_quota_date, finalization_date,
      image, ignored, financial_entity_id
    FROM purchases
    WHERE financial_entity_id = $1
      AND deleted = false
    ORDER BY type, id
  `;
    const allAfterRows = await executeQuery<any>(allAfterQuery, [financialEntityId], true);

    const result: PurchaseHomeDto[] = allAfterRows.map((u: any) => ({
        id: Number(u.id),
        name: u.name,
        amount: Number(u.amount),
        amount_per_quota: u.amount_per_quota != null ? Number(u.amount_per_quota) : null,
        number_of_quotas: u.number_of_quotas != null ? Number(u.number_of_quotas) : null,
        payed_quotas: u.payed_quotas != null ? Number(u.payed_quotas) : null,
        currency_type: Number(u.currency_type),
        type: Number(u.type),
        fixed_expense: Boolean(u.fixed_expense),
        first_quota_date: u.first_quota_date ? new Date(u.first_quota_date).toISOString() : null,
        finalization_date: u.finalization_date ? new Date(u.finalization_date).toISOString() : null,
        image: u.image,
        ignored: Boolean(u.ignored),
        financial_entity_id: Number(u.financial_entity_id),
    }));

    return result;
}
