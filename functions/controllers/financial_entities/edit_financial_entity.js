import { executeQuery } from "../../db.js";
import { logRed, logYellow } from "../../funciones/logsCustom.js";

export async function editFinancialEntity(newName, financialEntityId) {
  try {
    const checkQuery = "SELECT id FROM financial_entities WHERE id = $1";
    const checkResult = await executeQuery(checkQuery, [financialEntityId]);

    if (checkResult.length === 0) {
      logRed(
        `No se encontró la entidad financiera con ID ${financialEntityId}`
      );
      throw new Error(
        "No se encontró la entidad financiera con el ID proporcionado."
      );
    }
    const query = "UPDATE financial_entities SET name = $1 WHERE id = $2";
    const result = await executeQuery(query, [newName, financialEntityId]);

    if (result.length == 0) {
      logRed("No se pudo actualizar la entidad financiera.");
      throw new Error("No se pudo actualizar la entidad financiera.");
    }

    return result;
  } catch (error) {
    logRed(`Error en editFinancialEntity: ${error.stack}`);
    throw error;
  }
}
