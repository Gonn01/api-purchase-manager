import { executeQuery } from "../../db.js";
import { logRed, logYellow } from "../../funciones/logsCustom.js";

export async function getPurchasesByUserId() {
  try {
    const query = ` 
      SELECT * 
      FROM purchases
      WHERE userId = $1
      AND deleted = false
      LIMIT 1
    `;
    const result = await executeQuery(query);

    if (result.length == 0) {
      throw new Error("No se encontraron compras.");
    }

    return result;
  } catch (error) {
    logRed(`Error en getPurchasesByUserId: ${error.stack}`);
    throw error;
  }
}
