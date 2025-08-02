import { executeQuery } from "../../db.js";
import { logRed, logYellow } from "../../funciones/logsCustom.js";

export async function getPurchasesByUserId(userId) {
  try {
    const query = ` 
      SELECT * 
      FROM purchases
      INNER JOIN financial_entities
      ON purchases.financial_entity_id = financial_entities.id
      WHERE financial_entities.user_id = $1
      AND purchases.deleted = false
      AND financial_entities.deleted = false
    `;
    const result = await executeQuery(query, [userId], true);

    if (result.length == 0) {
      throw new Error("No se encontraron compras.");
    }

    return result;
  } catch (error) {
    logRed(`Error en getPurchasesByUserId: ${error.stack}`);
    throw error;
  }
}
