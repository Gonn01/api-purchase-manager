import { executeQuery } from "../../db";
import { logRed, logYellow } from "../../functions/logsCustom";
import { Purchase, PurchaseType, PurchaseTypeEnum } from "../../models/Purchase";

/**
 * Marca como pagada la cuota de este mes para varias compras.
 */
export async function payMonth(purchaseIds: number[]): Promise<Purchase[]> {
  try {
    if (!Array.isArray(purchaseIds) || purchaseIds.length === 0) {
      throw new Error("Invalid purchaseIds: must be a non-empty array.");
    }

    const now = new Date();

    // 1. Obtener las compras
    const selectQuery = `
      SELECT * 
      FROM purchases 
      WHERE id = ANY($1) AND deleted = false
    `;
    const purchaseResults = await executeQuery<any>(selectQuery, [purchaseIds], true);

    if (purchaseResults.length === 0) {
      throw new Error("No purchases found for the provided IDs.");
    }

    const updates: {
      id: number;
      payed_quotas: number;
      first_quota_date: string;
      finalization_date: string | null;
      type: number;
    }[] = [];

    // 2. Procesar cada compra usando Purchase.fromJson
    for (const purchaseData of purchaseResults) {
      const purchase = Purchase.fromJson(purchaseData);

      if (purchase.payed_quotas >= purchase.number_of_quotas) {
        logRed(`Todas las cuotas ya están pagadas para la compra ID: ${purchase.id}`);
        continue;
      }

      const payed_quotas = purchase.payed_quotas + 1;
      const first_quota_date =
        payed_quotas === 1 || !purchase.first_quota_date
          ? now.toISOString()
          : purchase.first_quota_date.toISOString();

      const finalization_date =
        payed_quotas === purchase.number_of_quotas
          ? now.toISOString()
          : purchase.finalization_date
          ? purchase.finalization_date.toISOString()
          : null;

      const currentType = purchase.type;
      const type =
        payed_quotas === purchase.number_of_quotas
          ? currentType === PurchaseTypeEnum.CurrentDebtorPurchase
            ? PurchaseTypeEnum.SettledDebtorPurchase
            : PurchaseTypeEnum.SettledCreditorPurchase
          : currentType;

      updates.push({
        id: purchase.id,
        payed_quotas,
        first_quota_date,
        finalization_date,
        type: PurchaseType.getValue(type),
      });
    }

    if (updates.length === 0) return [];

    // 3. Armar batch update con VALUES
    const values: any[] = [];
    const valueTuples = updates.map((u, i) => {
      const offset = i * 5;
      values.push(u.id, u.payed_quotas, u.first_quota_date, u.finalization_date, u.type);
      return `($${offset + 1}::BIGINT, $${offset + 2}::INT, $${offset + 3}::TIMESTAMP, $${offset + 4}::TIMESTAMP, $${offset + 5}::INT)`;
    });

    const updateQuery = `
      UPDATE purchases AS p
      SET 
        payed_quotas = u.payed_quotas,
        first_quota_date = u.first_quota_date,
        finalization_date = u.finalization_date,
        type = u.type
      FROM (
        VALUES ${valueTuples.join(", ")}
      ) AS u(id, payed_quotas, first_quota_date, finalization_date, type)
      WHERE p.id = u.id
      RETURNING p.*;
    `;

    const updatedRows = await executeQuery<any>(updateQuery, values, true);

    // 4. Devolver instancias de Purchase
    const updatedPurchases = updatedRows.map((row: any) => Purchase.fromJson(row));

    updatedPurchases.forEach((p) => {
      logYellow(`✅ Compra actualizada ID ${p.id}, cuotas pagadas: ${p.payed_quotas}`);
    });

    return updatedPurchases;
  } catch (error: any) {
    logRed(`Error en payMonth: ${error.stack || error.message}`);
    throw error;
  }
}
