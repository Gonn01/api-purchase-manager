import { executeQuery } from "../../db.js";
import { logRed, logYellow } from "../../funciones/logsCustom.js";

export async function createPurchase(ignored, image, amount, amountPerQuota, numberOfQuotas, payedQuotas, currencyType, name, type, financialEntityId, fixedExpense) {
  try {
    const checkQuery = "SELECT name FROM purchases WHERE name = $1 LIMIT 1";
    const checkResult = await executeQuery(checkQuery, [name]);

    if (checkResult.length > 0) {
      throw new Error("Ya existe una compra con ese nombre.");
    }

    const query = `
      INSERT INTO users
      (ignored,image, amount, amount_per_quota, amount_of_quotas, payed_quotas, currency_type, name, type, financial_entity_id, fixed_expense,)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const result = await executeQuery(query, [ignored, image, amount, amountPerQuota, numberOfQuotas, payedQuotas, currencyType, name, type, financialEntityId, fixedExpense]);

    return result[0];
  } catch (error) {
    logRed(`Error en createPurchase: ${error.stack}`);
    throw error;
  }
}
