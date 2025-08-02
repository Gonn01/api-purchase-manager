import { executeQuery } from "../../db.js";
import { logRed } from "../../funciones/logsCustom.js";

/**
 * Devuelve los logs de las compras de una entidad financiera en los últimos 30 días.
 * @param {number} entityId - ID de la entidad financiera
 * @returns {Promise<Array>} - Lista plana de logs con nombre de la compra
 */
export async function getPurchaseLogsByEntity(entityId) {
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
        p.financial_entity_id = $1 AND
        l.created_at >= NOW() - INTERVAL '30 days'
      ORDER BY l.created_at DESC;
    `;

    const result = await executeQuery(query, [entityId], true);
    const flatLogs = result.map(log => ({
      id: log.id * 1,
      created_at: log.created_at,
      content: log.content,
      name: log.name
    }));
    return flatLogs;
  } catch (error) {
    logRed(`Error en getPurchaseLogsByEntity: ${error.stack}`);
    throw error;
  }
}
