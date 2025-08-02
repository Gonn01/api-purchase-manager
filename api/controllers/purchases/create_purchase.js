import { executeQuery } from "../../db.js";
import { logRed } from "../../funciones/logsCustom.js";
import { Purchase } from "../../models/purchase.js"; // Asegúrate de que la ruta sea la correcta

export async function createPurchase(
  ignored,
  image,
  amount,
  amount_per_quota,
  number_of_quotas,
  payed_quotas,
  currency_type,
  name,
  type,
  financialEntityId,
  fixedExpense
) {
  try {
    // Verificar que no exista una compra con el mismo nombre
    const checkQuery = "SELECT name FROM purchases WHERE name = $1 AND deleted = false LIMIT 1";
    const checkResult = await executeQuery(checkQuery, [name], true);
    if (checkResult.length > 0) {
      throw new Error("Ya existe una compra con ese nombre.");
    }

    // Preparamos los valores reemplazando undefined por null
    const values = [
      ignored,
      image === undefined ? null : image,
      amount,
      amount_per_quota,
      number_of_quotas,
      payed_quotas,
      currency_type,
      name,
      type,
      financialEntityId,
      fixedExpense,
    ].map(value => value === undefined ? null : value);

    const query = `
      INSERT INTO purchases
      (ignored, image, amount, amount_per_quota, number_of_quotas, payed_quotas, currency_type, name, type, financial_entity_id, fixed_expense)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const result = await executeQuery(query, values, true);

    return Purchase.fromJson(result[0]);
  } catch (error) {
    logRed(`Error en createPurchase: ${error.stack}`);
    throw error;
  }
}
