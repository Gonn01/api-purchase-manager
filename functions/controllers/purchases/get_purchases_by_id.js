import { executeQuery } from "../../db.js";
import { logRed, logYellow } from "../../funciones/logsCustom.js";
import { PurchaseLog } from "../../models/logs.js";
import { Purchase } from "../../models/purchase.js";

export async function getPurchasesById(purchaseId) {
  try {
    const query = ` 
      SELECT * 
      FROM purchases
      WHERE id = $1
      AND deleted = false
      LIMIT 1
    `;
    const result = await executeQuery(query, [purchaseId]);

    if (result.length == 0) {
      throw new Error("No se encontraron compras.");
    }

    let purchase = Purchase.fromJson(result[0]);

    const queryLogs = ` 
      SELECT * 
      FROM purchases_logs
      WHERE purchase_id = $1
    `;
    const logs = await executeQuery(queryLogs, [purchaseId]);
    purchase.logs = logs.map((log) => {
      logYellow(`log: ${JSON.stringify(log)}`);
      return PurchaseLog.fromJson(log);

    });
    return purchase;
  } catch (error) {
    logRed(`Error en getPurchasesById: ${error.stack}`);
    throw error;
  }
}
