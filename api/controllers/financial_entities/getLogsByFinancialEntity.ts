import { executeQuery } from "../../db";
import { logRed } from "../../functions/logsCustom";
import { PurchaseLogByEntityDto } from "../../dtos/financial_entities/PurchaseLogByEntityDto";

/**
 * Devuelve los logs de las compras de una entidad financiera en los últimos 30 días.
 */
export async function getPurchaseLogsByEntity(
  entityId: number
): Promise<PurchaseLogByEntityDto[]> {
  try {
    const query = `
      SELECT 
        l.id,
        l.created_at,
        l.content,
        p.name
      FROM purchases_logs l
      JOIN purchases p ON p.id = l.purchase_id
      WHERE 
        p.financial_entity_id = $1
        AND l.created_at >= NOW() - INTERVAL '30 days'
      ORDER BY l.created_at DESC;
    `;

    const result = await executeQuery < any > (query, [entityId], true);

    return result.map(
      (log: any): PurchaseLogByEntityDto => ({
        id: Number(log.id),
        created_at: new Date(log.created_at).toISOString(),
        content: log.content,
        name: log.name,
      })
    );
  } catch (error: any) {
    logRed(
      `Error en getPurchaseLogsByEntity: ${error.stack || error.message}`
    );
    throw error;
  }
}
