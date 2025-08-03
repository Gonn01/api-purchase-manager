import { executeQuery } from "../../db";
import { createFinancialEntityLog } from "../../functions/logs";
import { logGreen, logRed } from "../../functions/logsCustom";
import CustomException from "../../models/CustomException";
/**
 * Marca una entidad financiera como eliminada (soft delete).
 * @param financialEntityId ID de la entidad financiera
 */
export async function deleteFinancialEntity(
  financialEntityId: number
): Promise<void> {
  const checkQuery = `
      SELECT id FROM financial_entities 
      WHERE id = $1 AND deleted = false
      LIMIT 1
    `;
  const checkResult = await executeQuery(checkQuery, [financialEntityId]);
  logGreen(JSON.stringify(checkResult));
  if (checkResult.length === 0) {
    throw new CustomException({
      title: "No se encontró la entidad financiera con el ID proporcionado o ya fue eliminada.",
      message: "Entidad financiera no encontrada o ya eliminada.",
    });
  }

  const query = `
      UPDATE financial_entities 
      SET deleted = true 
      WHERE id = $1
      RETURNING id
    `;
  const result = await executeQuery<{ id: number }>(query, [financialEntityId]);

  if (result.length === 0) {
    throw new CustomException({
      title: "Error al eliminar la entidad financiera.",
      message: "No se pudo eliminar la entidad financiera.",
    });
  }

  await createFinancialEntityLog(financialEntityId, "Entidad eliminada");

}
