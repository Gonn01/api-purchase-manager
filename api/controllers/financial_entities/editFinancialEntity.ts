import { executeQuery } from "../../db";
import { createFinancialEntityLog } from "../../functions/logs";
import { logRed, logYellow } from "../../functions/logsCustom";

/**
 * Edita el nombre de una entidad financiera.
 * @param newName Nuevo nombre para la entidad
 * @param financialEntityId ID de la entidad financiera
 */
export async function editFinancialEntity(
  newName: string,
  financialEntityId: number
): Promise<void> {
  try {
    // 1. Verificar si existe
    const checkQuery = `
      SELECT name FROM financial_entities 
      WHERE id = $1 AND deleted = false
      LIMIT 1
    `;
    const checkResult = await executeQuery < { name: string } > (checkQuery, [financialEntityId]);

    if (checkResult.length === 0) {
      logRed(`No se encontró la entidad financiera con ID ${financialEntityId}`);
      throw new Error("No se encontró la entidad financiera con el ID proporcionado.");
    }

    // 2. Verificar que el nombre sea diferente
    if (checkResult[0].name === newName) {
      logRed("El nombre proporcionado es igual al actual.");
      throw new Error("El nombre proporcionado es igual al actual.");
    }

    // 3. Actualizar nombre
    const query = `
      UPDATE financial_entities 
      SET name = $1 
      WHERE id = $2
      RETURNING id, name
    `;
    const result = await executeQuery < { id: number; name: string } > (query, [newName, financialEntityId]);

    if (result.length === 0) {
      logRed("No se pudo actualizar la entidad financiera.");
      throw new Error("No se pudo actualizar la entidad financiera.");
    }

    logYellow(`Entidad financiera editada ID: ${financialEntityId} → Nuevo nombre: ${newName}`);

    // 4. Crear log
    await createFinancialEntityLog(financialEntityId, `Entidad renombrada a "${newName}"`);
  } catch (error: any) {
    logRed(`Error en editFinancialEntity: ${error.stack || error.message}`);
    throw error;
  }
}
