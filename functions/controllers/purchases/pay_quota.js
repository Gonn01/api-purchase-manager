import { executeQuery } from "../../db.js";
import { logRed } from "../../funciones/logsCustom.js";
import { Purchase, PurchaseType } from "../../models/purchase.js"; // Asegúrate de que la ruta sea correcta

export async function payQuota(purchaseId) {
  try {
    // Fetch the purchase details
    const purchaseQuery = `
      SELECT * FROM purchases WHERE id = $1;
    `;
    const purchaseResult = await executeQuery(purchaseQuery, [purchaseId], true);

    if (purchaseResult.length === 0) {
      throw new Error("Purchase not found.");
    }

    // Create a Purchase instance from the database result
    const purchaseData = purchaseResult[0];

    const purchase = Purchase.fromJson(purchaseData);
    const purchaseTypeValue = purchase.type;
    if (purchase.payed_quotas >= purchase.number_of_quotas) {
      throw new Error("All quotas have already been paid.");
    }

    // Increment payed_quotas using copyWith
    const updatedPurchase = purchase.copyWith({
      payed_quotas: purchase.payed_quotas + 1,
    });

    // Get the current timestamp
    const now = new Date();

    // Update first_quota_date if it's the first quota
    const first_quota_date = updatedPurchase.payed_quotas === 1 ? now : updatedPurchase.first_quota_date;

    // Update finalization_date and type if it's the last quota
    const finalization_date = updatedPurchase.payed_quotas === updatedPurchase.number_of_quotas ? now : updatedPurchase.finalization_date;

    // Convert purchaseTypeValue to the enum
    const purchaseType = PurchaseType.type(purchaseTypeValue);

    const type = updatedPurchase.payed_quotas === updatedPurchase.number_of_quotas
      ? purchaseType === PurchaseType.currentDebtorPurchase
        ? PurchaseType.settledDebtorPurchase
        : PurchaseType.settledCreditorPurchase
      : updatedPurchase.type;

    // Update the purchase record in the database
    const updateQuery = `
      UPDATE purchases
      SET payed_quotas = $1, first_quota_date = $2, finalization_date = $3, type = $4
      WHERE id = $5;
    `;
    await executeQuery(updateQuery, [
      updatedPurchase.payed_quotas,
      first_quota_date,
      finalization_date,
      PurchaseType.getValue(type), // Convert enum back to integer
      purchaseId,
    ]);
    // Fetch the purchase details
    const purchaseQuery2 = `
      SELECT * FROM purchases WHERE id = $1;
    `;
    const purchaseResult2 = await executeQuery(purchaseQuery2, [purchaseId], true);
    return Purchase.fromJson(purchaseResult2[0]);
  } catch (error) {
    logRed(`Error in payQuota: ${error.stack}`);
    throw error;
  }
}