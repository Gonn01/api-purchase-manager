import { executeQuery } from "../../db.js";
import { logRed } from "../../funciones/logsCustom.js";
export async function getPurchaseLogsByEntity(entityId, limit = 10) {
    try {
        const query = `
        SELECT 
          l.id AS log_id,
          l.purchase_id,
          l.message,
          l.created_at,
          p.name AS nombre_compra
        FROM purchase_logs l
        JOIN purchases p ON l.purchase_id = p.id
        WHERE p.entity_id = $1
        ORDER BY l.created_at DESC
        LIMIT $2;
      `;

        const logs = await executeQuery(query, [entityId, limit], true);
        return logs;
    } catch (error) {
        logRed(`Error en getPurchaseLogsByEntity: ${error.stack}`);
        throw error;
    }
}