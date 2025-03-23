import { executeQuery } from "../../db.js";
import { logRed } from "../../funciones/logsCustom.js";
import { Purchase } from "./purchase.js"; // Asegúrate de que la ruta sea correcta
import { PurchaseType } from "./purchase_type.js"; // Asegúrate de que la ruta sea correcta

export async function payQuota(purchaseId, purchaseTypeValue) {
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

    // Convert type to number before calling Purchase.fromJson()
    purchaseData.type = parseInt(purchaseData.type);

    const purchase = Purchase.fromJson(purchaseData);

    if (purchase.payedQuotas >= purchase.numberOfQuotas) {
      throw new Error("All quotas have already been paid.");
    }

    // Increment payed_quotas using copyWith
    const updatedPurchase = purchase.copyWith({
      payedQuotas: purchase.payedQuotas + 1,
    });

    // Get the current timestamp
    const now = new Date();

    // Update first_quota_date if it's the first quota
    const firstQuotaDate = updatedPurchase.payedQuotas === 1 ? now : updatedPurchase.firstQuotaDate;

    // Update finalization_date and type if it's the last quota
    const finalizationDate = updatedPurchase.payedQuotas === updatedPurchase.numberOfQuotas ? now : updatedPurchase.finalizationDate;

    // Convert purchaseTypeValue to the enum
    const purchaseType = PurchaseType.type(purchaseTypeValue);

    const type = updatedPurchase.payedQuotas === updatedPurchase.numberOfQuotas
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
      updatedPurchase.payedQuotas,
      firstQuotaDate,
      finalizationDate,
      PurchaseType.getValue(type), // Convert enum back to integer
      purchaseId,
    ]);
  } catch (error) {
    logRed(`Error in payQuota: ${error.stack}`);
    throw error;
  }
}