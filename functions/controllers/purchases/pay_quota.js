import { executeQuery } from "../../db.js";
import { logRed } from "../../funciones/logsCustom.js";

export async function payQuota(purchaseId, purchaseType) {
  try {
    // Fetch the purchase details
    const purchaseQuery = `
      SELECT * FROM purchases WHERE id = $1;
    `;
    const purchaseResult = await executeQuery(purchaseQuery, [purchaseId]);

    if (purchaseResult.length === 0) {
      throw new Error("Purchase not found.");
    }

    const purchase = purchaseResult[0];

    // Verifica que no se paguen cuotas de más
    if (purchase.payed_quotas >= purchase.number_of_quotas) {
      throw new Error("All quotas have already been paid.");
    }

    // Increment payed_quotas
    purchase.payed_quotas += 1;

    // Get the current timestamp
    const now = new Date();

    // Update first_quota_date if it's the first quota
    if (purchase.payed_quotas === 1) {
      purchase.first_quota_date = now;
    }

    // Update finalization_date and type if it's the last quota
    if (purchase.payed_quotas === purchase.number_of_quotas) {
      purchase.finalization_date = now;
      purchase.type =
        purchaseType === "currentDebtorPurchase"
          ? "settledDebtorPurchase"
          : "settledCreditorPurchase";
    }

    // Update the purchase record in the database
    const updateQuery = `
      UPDATE purchases
      SET payed_quotas = $1, first_quota_date = $2, finalization_date = $3, type = $4
      WHERE id = $5;
    `;
    await executeQuery(updateQuery, [
      purchase.payed_quotas,
      purchase.first_quota_date,
      purchase.finalization_date,
      purchase.type,
      purchaseId,
    ]);

    return {
      message: "Quota paid successfully.",
    };
  } catch (error) {
    logRed(`Error in payQuota: ${error.stack}`);
    throw error;
  }
}