import { FinancialEntity } from "../../models/FinancialEntity";
import { executeQuery } from "../../db";
import { logRed } from "../../functions/logsCustom";
import { FinancialEntityDto } from "../../dtos/financial_entities/FinancialEntityDto";
import { FinancialEntityMapper } from "../../mappers/FinancialEntityMapper";

/**
 * Obtiene todas las entidades financieras de un usuario.
 * @param userId ID del usuario
 * @returns Lista de DTOs de entidades financieras
 */
export async function getFinancialEntities(
  userId: number
): Promise<FinancialEntityDto[]> {
  try {
    const query = `
      SELECT id, created_at, name, user_id
      FROM financial_entities
      WHERE user_id = $1 AND deleted = false
    `;
    const result = await executeQuery < any > (query, [userId], true);

    if (!result || result.length === 0) {
      return [];
    }

    const entities = result.map((row: any) =>
      FinancialEntity.fromJson(row)
    );

    return entities.map(FinancialEntityMapper.toDto);
  } catch (error: any) {
    logRed(`Error en getFinancialEntities: ${error.stack || error.message}`);
    throw error;
  }
}
