import { executeQuery } from "../../db";
import { createPurchaseLog } from "../../functions/logs";
import { logRed } from "../../functions/logsCustom";
import { Purchase, PurchaseType, PurchaseTypeEnum } from "../../models/Purchase";

/**
 * Marca como pagada una cuota de una compra.
 */
export async function payQuota(purchaseId: number): Promise<Purchase> {
  try {
    // 1. Obtener la compra
    const purchaseQuery = `
      SELECT * FROM purchases WHERE id = $1 AND deleted = false;
    `;
    const purchaseResult = await executeQuery < any > (purchaseQuery, [purchaseId], true);

    if (purchaseResult.length === 0) {
      throw new Error("Purchase not found.");
    }

    const purchase = Purchase.fromJson(purchaseResult[0]);

    // 2. Validar cuotas
    if (!purchase.fixed_expense && purchase.payed_quotas >= purchase.number_of_quotas) {
      throw new Error("All quotas have already been paid.");
    }

    const now = new Date();

    // 3. Calcular nuevas propiedades
    const payed_quotas = purchase.payed_quotas + 1;
    const first_quota_date =
      payed_quotas === 1 || !purchase.first_quota_date
        ? now
        : purchase.first_quota_date;

    const finalization_date =
      payed_quotas === purchase.number_of_quotas ? now : purchase.finalization_date;

    const type =
      payed_quotas === purchase.number_of_quotas
        ? purchase.type === PurchaseTypeEnum.CurrentDebtorPurchase
          ? PurchaseTypeEnum.SettledDebtorPurchase
          : PurchaseTypeEnum.SettledCreditorPurchase
        : purchase.type;

    // 4. Actualizar en DB
    const updateQuery = `
      UPDATE purchases
      SET payed_quotas = $1,
          first_quota_date = $2,
          finalization_date = $3,
          type = $4
      WHERE id = $5
      RETURNING *;
    `;
    const updatedRows = await executeQuery < any > (
      updateQuery,
      [
        payed_quotas,
        first_quota_date,
        finalization_date,
        PurchaseType.getValue(type),
        purchaseId,
      ],
      true
    );

    if (updatedRows.length === 0) {
      throw new Error("Failed to update purchase.");
    }

    const updatedPurchase = Purchase.fromJson(updatedRows[0]);

    // 5. Insertar log automático
    await createPurchaseLog(
      updatedPurchase.id,
      `Pago de cuota ${updatedPurchase.payed_quotas} realizado`
    );

    return updatedPurchase;
  } catch (error: any) {
    logRed(`Error in payQuota: ${error.stack || error.message}`);
    throw error;
  }
}
