import { executeQuery } from "../../db.js";
import { logRed } from "../../funciones/logsCustom.js";
import { Purchase, PurchaseType } from "../../models/purchase.js";

export async function payMonth(purchaseIds) {
  try {
    if (!Array.isArray(purchaseIds) || purchaseIds.length === 0) {
      throw new Error("Invalid purchaseIds: must be a non-empty array.");
    }

    // Obtener todas las compras en una sola consulta
    const purchaseQuery = `SELECT * FROM purchases WHERE id = ANY($1);`;
    const purchaseResults = await executeQuery(purchaseQuery, [purchaseIds], true);

    if (purchaseResults.length === 0) {
      throw new Error("No purchases found for the provided IDs.");
    }

    const now = new Date();
    const updatedPurchases = [];
    const updates = [];

    for (const purchaseData of purchaseResults) {
      const purchase = Purchase.fromJson(purchaseData);

      if (purchase.payed_quotas >= purchase.number_of_quotas) {
        logRed(`All quotas already paid for purchase ID: ${purchase.id}`);
        continue;
      }

      const updatedPurchase = purchase.copyWith({
        payed_quotas: purchase.payed_quotas + 1,
      });

      const first_quota_date = updatedPurchase.payed_quotas === 1 ? now : updatedPurchase.first_quota_date;
      const finalization_date = updatedPurchase.payed_quotas === updatedPurchase.number_of_quotas ? now : updatedPurchase.finalization_date;

      const purchaseType = PurchaseType.type(purchase.type);
      const type = updatedPurchase.payed_quotas === updatedPurchase.number_of_quotas
        ? purchaseType === PurchaseType.currentDebtorPurchase
          ? PurchaseType.settledDebtorPurchase
          : PurchaseType.settledCreditorPurchase
        : updatedPurchase.type;

      updates.push({
        id: purchase.id,
        payed_quotas: updatedPurchase.payed_quotas,
        first_quota_date: first_quota_date.toISOString(), // Asegúrate de que las fechas sean ISOString
        finalization_date: finalization_date ? finalization_date.toISOString() : null, // Ahora lo dejamos como null si no hay fecha
        type: PurchaseType.getValue(type),
      });

      updatedPurchases.push(updatedPurchase);
    }

    if (updates.length > 0) {
      // Realizar un solo UPDATE en lote
      const updateQueries = updates.map(
        (u) => `(${u.id}, ${u.payed_quotas}, '${u.first_quota_date}', ${u.finalization_date ? `'${u.finalization_date}'` : 'NULL'}, ${u.type})`
      ).join(",");

      const updateQuery = `
        UPDATE purchases AS p
        SET 
          payed_quotas = u.payed_quotas,
          first_quota_date = u.first_quota_date::timestamp,  -- Asegúrate de convertir a timestamp
          finalization_date = u.finalization_date::timestamp,  -- Asegúrate de convertir a timestamp
          type = u.type
        FROM (VALUES ${updateQueries}) AS u(id, payed_quotas, first_quota_date, finalization_date, type)
        WHERE p.id = u.id;
      `;

      await executeQuery(updateQuery);
    }

    return updatedPurchases;
  } catch (error) {
    logRed(`Error in payMonth: ${error.stack}`);
    throw error;
  }
}
