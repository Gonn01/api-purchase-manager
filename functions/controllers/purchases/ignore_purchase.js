import { executeQuery } from "../../db.js";
import { logRed } from "../../funciones/logsCustom.js";

export async function ignorePurchase(purchaseId) {
  try {

    const purchaseQuery = `
      SELECT ignored FROM purchases WHERE id = $1 AND deleted = true;
    `;

    const purchaseResult = await executeQuery(purchaseQuery, [purchaseId]);

    if (purchaseResult.length === 0) {
      throw new Error("Purchase already ignored.");
    }

    // Update the purchase record to set ignored to true
    const updateQuery = `
      UPDATE purchases
      SET ignored = true
      WHERE id = $1 AND deleted = false;
    `;
    await executeQuery(updateQuery, [purchaseId]);
  } catch (error) {
    logRed(`Error in ignorePurchase: ${error.stack}`);
    throw error;
  }
}