import { executeQuery } from "../../db.js";
import { logRed, logYellow } from "../../funciones/logsCustom.js";
import { FinancialEntity } from "../../models/financial_entity.js";

export async function createFinancialEntity(name, userId) {
  try {
    const checkQuery =
      "SELECT id FROM financial_entities WHERE name = $1 AND user_id = $2 AND deleted = false LIMIT 1";
    const checkResult = await executeQuery(checkQuery, [name, userId]);

    if (checkResult.length > 0) {
      throw new Error(
        "Ya existe una entidad financiera con ese nombre para este usuario."
      );
    }

    const query =
      "INSERT INTO financial_entities (name, user_id) VALUES ($1, $2) RETURNING *";
    const result = await executeQuery(query, [name, userId], true);

    return FinancialEntity.fromJson(result[0]);
  } catch (error) {
    logRed(`Error en createFinancialEntity: ${error.stack}`);
    throw error;
  }
}
