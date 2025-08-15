import { executeQuery } from "../db";

export class FinancialEntityRepository {
    async create(userId: number, name: string) {
        const rows = await executeQuery<{ id: number; name: string }>(
            `INSERT INTO financial_entities (user_id, name, deleted)
       VALUES ($1,$2,false)
       RETURNING id, name`,
            [userId, name],
            true
        );
        return rows[0];
    }

    async ensureOwnership(userId: number, financialEntityId: number): Promise<boolean> {
        const rows = await executeQuery(
            `SELECT 1 FROM financial_entities
        WHERE id=$1 AND user_id=$2 AND deleted=false
        LIMIT 1`,
            [financialEntityId, userId],
            true
        );
        return rows.length > 0;
    }

    // LISTA (id, name) para la feature de listado
    async listByUser(userId: number): Promise<Array<{ id: number; name: string }>> {
        const rows = await executeQuery<{ id: number; name: string }>(
            `SELECT id, name
         FROM financial_entities
        WHERE user_id = $1 AND deleted = false
        ORDER BY name ASC`,
            [userId],
            true
        );
        return rows;
    }

    // Saber si tiene compras asociadas (para bloquear delete)
    async hasAnyPurchase(financialEntityId: number): Promise<boolean> {
        const rows = await executeQuery<{ c: string }>(
            `SELECT COUNT(1)::text AS c
         FROM purchases
        WHERE financial_entity_id = $1 AND deleted = false`,
            [financialEntityId],
            true
        );
        return Number(rows[0]?.c ?? "0") > 0;
    }

    // Soft delete de FE
    async softDelete(userId: number, financialEntityId: number): Promise<void> {
        await executeQuery(
            `UPDATE financial_entities
          SET deleted = true, deleted_at = NOW()
        WHERE id = $1 AND user_id = $2 AND deleted = false`,
            [financialEntityId, userId],
            true
        );
    }

    // --- NUEVO: compras (solo id y name) para Detalles de FE ---
    async listPurchasesSummary(financialEntityId: number): Promise<Array<{ id: number; name: string }>> {
        const rows = await executeQuery<{ id: number; name: string }>(
            `SELECT id, name
         FROM purchases
        WHERE financial_entity_id = $1
          AND deleted = false
        ORDER BY id`,
            [financialEntityId],
            true
        );
        return rows.map(r => ({ id: Number(r.id), name: String(r.name) }));
    }

    // --- NUEVO: logs de la FE para Detalles de FE ---
    async listLogs(financialEntityId: number): Promise<Array<{ id: number; content: string; created_at: string }>> {
        const rows = await executeQuery<{ id: number; content: string; created_at: string }>(
            `SELECT id, content, created_at
         FROM financial_entities_logs
        WHERE financial_entity_id = $1
        ORDER BY created_at DESC`,
            [financialEntityId],
            true
        );
        return rows.map(r => ({
            id: Number(r.id),
            content: String(r.content),
            created_at: new Date(r.created_at).toISOString(),
        }));
    }
}
