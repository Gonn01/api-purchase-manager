import { executeQuery } from "../../db.js";
import { logRed, logYellow } from "../../funciones/logsCustom.js";

export async function getPurchasesByFinancialEntityId() {
  try {
    const query = "SELECT * FROM purchases WHERE financial_entity_id = $1";
    const result = await executeQuery(query);

    if (result.length == 0) {
      throw new Error("No se encontraron compras.");
    }

    return result;
  } catch (error) {
    logRed(`Error en getPurchasesByFinancialEntityId: ${error.stack}`);
    throw error;
  }
}
