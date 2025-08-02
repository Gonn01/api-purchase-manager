import { executeQuery } from "../../db";
import { FinancialEntityCreateRequestDto } from "../../dtos/financial_entities/FinancialEntityCreateRequestDto";
import {  FinancialEntityListDto } from "../../dtos/financial_entities/FinancialEntityListDto";
import { createFinancialEntityLog } from "../../functions/logs";

/**
 * Crea una nueva entidad financiera y agrega un log de creación.
 */
export async function createFinancialEntity(
  data: FinancialEntityCreateRequestDto,
  userId: number
): Promise<FinancialEntityListDto> {
    const checkQuery = `
      SELECT id FROM financial_entities
      WHERE name = $1 AND user_id = $2 AND deleted = false
      LIMIT 1
    `;
    const checkResult = await executeQuery(checkQuery, [data.name, userId]);

    if (checkResult.length > 0) {
      throw new Error(
        "Ya existe una entidad financiera con ese nombre para este usuario."
      );
    }

   const query = `
    INSERT INTO financial_entities (name, user_id, created_at, deleted)
    VALUES ($1, $2, NOW(), false)
    RETURNING id, name, created_at, user_id, deleted
  `;

  const result = await executeQuery<any>(query, [data.name, userId], false);

  const row = result[0];
  return {
    id: row.id,
    name: row.name,
  };
}
