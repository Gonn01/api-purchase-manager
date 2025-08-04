import { executeQuery } from "../../db";
import { FinancialEntityCreateRequestDto } from "../../dtos/financial_entities/FinancialEntityCreateRequestDto";
import { FinancialEntityListDto } from "../../dtos/financial_entities/FinancialEntityListDto";
import CustomException from "../../models/CustomException";

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
    throw new CustomException({
      title: "Entidad financiera duplicada",
      message: "Ya existe una entidad financiera con ese nombre para este usuario."
    });
  }

  const query = `
    INSERT INTO financial_entities (name, user_id)
    VALUES ($1, $2)
    RETURNING id, name
  `;

  const result = await executeQuery<any>(query, [data.name, userId], false);

  const row = result[0];
  return {
    id: Number(row.id),
    name: row.name,
  };
}
