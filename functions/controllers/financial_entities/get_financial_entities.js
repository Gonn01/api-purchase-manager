import { executeQuery } from "../../db.js";
import { logRed, logYellow } from "../../funciones/logsCustom.js";

export async function getFinancialEntities(userId) {
  try {
    const query =
      "SELECT * FROM financial_entities WHERE user_id = $1 AND deleted = false";
    const result = await executeQuery(query, [userId]);

    if (result.length == 0) {
      throw new Error(
        "No se encontraron entidades financieras para este usuario."
      );
    }

    return result;
  } catch (error) {
    logRed(`Error en getFinancialEntities: ${error.stack}`);
    throw error;
  }
}
