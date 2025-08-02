import { executeQuery } from "../../db";
import { createPurchaseLog } from "../../functions/logs";
import { logRed } from "../../functions/logsCustom";
import { Purchase, PurchaseType, PurchaseTypeEnum } from "../../models/Purchase";

/**
 * Desmarca una cuota pagada de una compra (retrocede un mes).
 */
export async function unpayQuota(purchaseId: number): Promise<Purchase> {
  try {
    // 1. Buscar la compra
    const purchaseQuery = `SELECT * FROM purchases WHERE id = $1 AND deleted = false;`;
    const purchaseResult = await executeQuery < any > (purchaseQuery, [purchaseId], true);

    if (purchaseResult.length === 0) {
      throw new Error("Purchase not found.");
    }

    const purchase = Purchase.fromJson(purchaseResult[0]);

    if (purchase.payed_quotas === 0) {
      throw new Error("No quotas have been paid to decrease.");
    }

    // 2. Calcular nuevos valores
    const updatedPayedQuotas = purchase.payed_quotas - 1;

    const finalizationDate =
      updatedPayedQuotas === purchase.number_of_quotas
        ? purchase.finalization_date
        : null;

    const firstQuotaDate =
      updatedPayedQuotas === 0 ? null : purchase.first_quota_date;

    let updatedType: PurchaseTypeEnum;
    if (updatedPayedQuotas === purchase.number_of_quotas) {
      updatedType = purchase.type;
    } else {
      updatedType =
        purchase.type === PurchaseTypeEnum.SettledDebtorPurchase
          ? PurchaseTypeEnum.CurrentDebtorPurchase
          : PurchaseTypeEnum.CurrentCreditorPurchase;
    }

    // 3. Actualizar en DB
    const updateQuery = `
      UPDATE purchases
      SET payed_quotas = $1,
          first_quota_date = $2,
          finalization_date = $3,
          type = $4
      WHERE id = $5
      RETURNING *;
    `;
    const updatedPurchaseResult = await executeQuery < any > (
      updateQuery,
      [
        updatedPayedQuotas,
        firstQuotaDate,
        finalizationDate,
        PurchaseType.getValue(updatedType),
        purchaseId,
      ],
      true
    );

    if (updatedPurchaseResult.length === 0) {
      throw new Error("Failed to update purchase.");
    }

    const updatedPurchase = Purchase.fromJson(updatedPurchaseResult[0]);

    // 4. Crear log automático
    await createPurchaseLog(
      updatedPurchase.id,
      `Cuota ${updatedPurchase.payed_quotas + 1} desmarcada`
    );

    return updatedPurchase;
  } catch (error: any) {
    logRed(`Error in unpayQuota: ${error.stack || error.message}`);
    throw error;
  }
}
