import { executeQuery } from "../../db";
import { createFinancialEntityLog } from "../../functions/logs";
import { logRed, logYellow } from "../../functions/logsCustom";

/**
 * Marca una entidad financiera como eliminada (soft delete).
 * @param financialEntityId ID de la entidad financiera
 */
export async function deleteFinancialEntity(
  financialEntityId: number
): Promise<void> {
  try {
    // 1. Verificar si existe y no está eliminada
    const checkQuery = `
      SELECT id FROM financial_entities 
      WHERE id = $1 AND deleted = false
      LIMIT 1
    `;
    const checkResult = await executeQuery(checkQuery, [financialEntityId]);

    if (checkResult.length === 0) {
      logRed(`No se encontró la entidad financiera con ID ${financialEntityId}`);
      throw new Error(
        "No se encontró la entidad financiera con el ID proporcionado o ya fue eliminada."
      );
    }

    // 2. Soft delete con RETURNING para confirmar
    const query = `
      UPDATE financial_entities 
      SET deleted = true 
      WHERE id = $1
      RETURNING id
    `;
    const result = await executeQuery < { id: number } > (query, [financialEntityId]);

    if (result.length === 0) {
      logRed("No se pudo eliminar la entidad financiera.");
      throw new Error("No se pudo eliminar la entidad financiera.");
    }

    logYellow(`Entidad financiera eliminada ID: ${financialEntityId}`);

    // 3. Agregar log
    await createFinancialEntityLog(financialEntityId, "Entidad eliminada");
  } catch (error: any) {
    logRed(`Error en deleteFinancialEntity: ${error.stack || error.message}`);
    throw error;
  }
}
