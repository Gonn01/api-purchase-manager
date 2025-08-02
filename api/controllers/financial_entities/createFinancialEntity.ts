import { executeQuery } from "../../db";
import { logRed } from "../../functions/logsCustom";
import { FinancialEntity } from "../../models/FinancialEntity";
import { FinancialEntityDto } from "../../dtos/financial_entities/FinancialEntityDto";
import { createFinancialEntityLog } from "../../functions/logs";
import { FinancialEntityMapper } from "../../mappers/FinancialEntityMapper";

/**
 * Crea una nueva entidad financiera y agrega un log de creación.
 */
export async function createFinancialEntity(
  name: string,
  userId: number
): Promise<FinancialEntityDto> {
  try {
    // Verificar duplicados
    const checkQuery = `
      SELECT id FROM financial_entities
      WHERE name = $1 AND user_id = $2 AND deleted = false
      LIMIT 1
    `;
    const checkResult = await executeQuery(checkQuery, [name, userId]);

    if (checkResult.length > 0) {
      throw new Error(
        "Ya existe una entidad financiera con ese nombre para este usuario."
      );
    }

    // Insertar nueva entidad
    const query = `
      INSERT INTO financial_entities (name, user_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    const result = await executeQuery(query, [name, userId], true);

    const entity = FinancialEntity.fromJson(result[0]);

    // Crear log
    await createFinancialEntityLog(entity.id, "Entidad creada");

    // Devolver DTO
    return FinancialEntityMapper.toDto(entity);
  } catch (error: any) {
    logRed(`Error en createFinancialEntity: ${error.stack || error.message}`);
    throw error;
  }
}
