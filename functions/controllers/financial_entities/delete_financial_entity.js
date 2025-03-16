import { executeQuery } from "../../db.js";
import { logRed, logYellow } from "../../funciones/logsCustom.js";

export async function deleteFinancialEntity(financialEntityId) {
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

    const query = "UPDATE financial_entities SET deleted = true WHERE id = $1";
    const result = await executeQuery(query, [financialEntityId]);

    if (result.affectedRows == 0) {
      logRed("No se pudo eliminar la entidad financiera.");
      throw new Error("No se pudo eliminar la entidad financiera.");
    }

    return result;
  } catch (error) {
    logRed(`Error en deleteFinancialEntity: ${error.stack}`);
    throw error;
  }
}
