import { executeQuery } from "../../db.js";
import { logRed } from "../../funciones/logsCustom.js";
import { Purchase, PurchaseType } from "../../models/purchase.js"; // Asegúrate de que la ruta sea correcta

export async function unpayQuota(purchaseId) {
  try {
    // Fetch the purchase details
    const purchaseQuery = `SELECT * FROM purchases WHERE id = $1;`;
    const purchaseResult = await executeQuery(purchaseQuery, [purchaseId], true);

    if (purchaseResult.length === 0) {
      throw new Error("Purchase not found.");
    }

    // Create a Purchase instance from the database result
    const purchaseData = purchaseResult[0];
    const purchase = Purchase.fromJson(purchaseData);

    if (purchase.payed_quotas === 0) {
      throw new Error("No quotas have been paid to decrease.");
    }

    // Decrement payed_quotas
    const updatedPayedQuotas = purchase.payed_quotas - 1;

    // Reset finalization_date if it's no longer fully paid
    const finalizationDate = updatedPayedQuotas === purchase.number_of_quotas ? purchase.finalization_date : null;

    // Reset first_quota_date if the first payment is undone
    const firstQuotaDate = updatedPayedQuotas === 0 ? null : purchase.first_quota_date;

    // Determine the updated type
    const purchaseType = PurchaseType.type(purchase.type);
    const updatedType = updatedPayedQuotas === purchase.number_of_quotas
      ? purchaseType
      : purchaseType === PurchaseType.settledDebtorPurchase
        ? PurchaseType.currentDebtorPurchase
        : PurchaseType.currentCreditorPurchase;

    // Update the purchase record in the database and return the updated row
    const updateQuery = `
      UPDATE purchases
      SET payed_quotas = $1, first_quota_date = $2, finalization_date = $3, type = $4
      WHERE id = $5
      RETURNING *;
    `;
    const updatedPurchaseResult = await executeQuery(updateQuery, [
      updatedPayedQuotas,
      firstQuotaDate,
      finalizationDate,
      PurchaseType.getValue(updatedType), // Convert enum back to integer
      purchaseId,
    ], true);

    return Purchase.fromJson(updatedPurchaseResult[0]);
  } catch (error) {
    logRed(`Error in decreaseQuota: ${error.stack}`);
    throw error;
  }
}
