import { executeQuery } from "../../db.js";
import { logRed, logYellow } from "../../funciones/logsCustom.js";

export async function deletePurchase(purchaseId) {
  try {
    const checkQuery = "SELECT id FROM purchases WHERE id = $1";
    const checkResult = await executeQuery(checkQuery, [purchaseId]);

    if (checkResult.length === 0) {
      logRed(
        `No se encontró la compra con ID ${purchaseId}`
      );
      throw new Error(
        "No se encontró la compra con el ID proporcionado."
      );
    }

    const query = "UPDATE purchases SET deleted = true WHERE id = $1";
    const result = await executeQuery(query, [purchaseId]);

    if (result.length == 0) {
      logRed("No se pudo eliminar la compra.");
      throw new Error("No se pudo eliminar la compra.");
    }

    return result;
  } catch (error) {
    logRed(`Error en deletePurchase: ${error.stack}`);
    throw error;
  }
}
