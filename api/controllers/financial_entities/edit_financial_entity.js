import { executeQuery } from "../../db.js";
import { logRed, logYellow } from "../../funciones/logsCustom.js";

export async function editFinancialEntity(newName, financialEntityId) {
  try {
    const checkQuery = "SELECT name FROM financial_entities WHERE id = $1 AND deleted = false";
    const checkResult = await executeQuery(checkQuery, [financialEntityId]);

    if (checkResult[0].name === newName) {
      logRed("El nombre proporcionado es igual al actual.");
      throw new Error("El nombre proporcionado es igual al actual.");
    }

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

    if (result.affectedRows == 0) {
      logRed("No se pudo actualizar la entidad financiera.");
      throw new Error("No se pudo actualizar la entidad financiera.");
    }
  } catch (error) {
    logRed(`Error en editFinancialEntity: ${error.stack}`);
    throw error;
  }
}
