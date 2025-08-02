import { FinancialEntity } from "../../models/financial_entity.js";
import { executeQuery } from "../../db.js";
import { logRed } from "../../funciones/logsCustom.js";

export async function getFinancialEntities(userId) {
  try {
    const query = `
      SELECT id, created_at, name
      FROM financial_entities
      WHERE user_id = $1 AND deleted = false
    `;
    const result = await executeQuery(query, [userId], true);

    if (!result || result.length === 0) {
      return [];
    }

    const entities = result.map(FinancialEntity.fromJson);
    return entities;
  } catch (error) {
    logRed(`Error en getFinancialEntities: ${error.stack}`);
    throw error;
  }
}
