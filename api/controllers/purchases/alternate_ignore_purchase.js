import { executeQuery } from "../../db.js";
import { logRed } from "../../funciones/logsCustom.js";

export async function alternateIgnorePurchase(purchaseId) {
  try {

    const purchaseQuery = `
      SELECT ignored FROM purchases WHERE id = $1;
    `;

    const purchaseResult = await executeQuery(purchaseQuery, [purchaseId], true);

    // Update the purchase record to set ignored to true
    const updateQuery = `
      UPDATE purchases
      SET ignored = $1
      WHERE id = $2;
    `;
    await executeQuery(updateQuery, [!purchaseResult[0].ignored, purchaseId]);
  } catch (error) {
    logRed(`Error in ignorePurchase: ${error.stack}`);
    throw error;
  }
}