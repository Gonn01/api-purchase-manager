import { executeQuery } from "../../db.js";
import { logRed, logYellow } from "../../funciones/logsCustom.js";
import { Purchase, PurchaseType } from "../../models/purchase.js";

export async function payMonth(purchaseIds) {
  try {
    if (!Array.isArray(purchaseIds) || purchaseIds.length === 0) {
      throw new Error("Invalid purchaseIds: must be a non-empty array.");
    }

    const now = new Date();
    const selectQuery = `SELECT * FROM purchases WHERE id = ANY($1);`;
    const purchaseResults = await executeQuery(selectQuery, [purchaseIds], true);

    if (purchaseResults.length === 0) {
      throw new Error("No purchases found for the provided IDs.");
    }

    const updates = [];
    for (const purchaseData of purchaseResults) {
      const purchase = Purchase.fromJson(purchaseData);

      if (purchase.payed_quotas >= purchase.number_of_quotas) {
        logRed(`All quotas already paid for purchase ID: ${purchase.id}`);
        continue;
      }

      const payed_quotas = purchase.payed_quotas + 1;
      const first_quota_date = (payed_quotas === 1 || !purchase.first_quota_date)
        ? now.toISOString()
        : purchase.first_quota_date.toISOString();

      const finalization_date = payed_quotas === purchase.number_of_quotas
        ? now.toISOString()
        : (purchase.finalization_date ? purchase.finalization_date.toISOString() : null);

      const currentType = PurchaseType.type(purchase.type);
      const type = payed_quotas === purchase.number_of_quotas
        ? currentType === PurchaseType.currentDebtorPurchase
          ? PurchaseType.settledDebtorPurchase
          : PurchaseType.settledCreditorPurchase
        : currentType;

      updates.push({
        id: purchase.id,
        payed_quotas,
        first_quota_date,
        finalization_date,
        type: PurchaseType.getValue(type)
      });
    }

    if (updates.length === 0) return [];

    // Armar VALUES con castings
    const values = [];
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

    const updatedRows = await executeQuery(updateQuery, values, true);

    const updatedPurchases = updatedRows.map(Purchase.fromJson);

    updatedPurchases.forEach(p => {
      logYellow(`✅ Compra actualizada ID ${p.id}, cuotas pagadas: ${p.payed_quotas}`);
    });

    return updatedPurchases;
  } catch (error) {
    logRed(`Error en payMonth: ${error.stack}`);
    throw error;
  }
}
