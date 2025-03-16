import { executeQuery } from "../../db.js";
import { logRed, logYellow } from "../../funciones/logsCustom.js";

export async function createPurchase(image, amount, amount_per_quota, amount_of_quotas, payed_quotas, currency_type, name, type, financial_entity_id, fixed_expense) {
  try {
    const checkQuery = "SELECT name FROM purchases WHERE name = $1 LIMIT 1";
    const checkResult = await executeQuery(checkQuery, [name]);

    if (checkResult.length > 0) {
      throw new Error("Ya existe una compra con ese nombre.");
    }

    const query = `
      INSERT INTO users
      (image, amount, amount_per_quota, amount_of_quotas, payed_quotas, currency_type, name, type, financial_entity_id, fixed_expense,)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const result = await executeQuery(query, [image, amount, amount_per_quota, amount_of_quotas, payed_quotas, currency_type, name, type, financial_entity_id, fixed_expense]);

    return result[0];
  } catch (error) {
    logRed(`Error en createPurchase: ${error.stack}`);
    throw error;
  }
}
