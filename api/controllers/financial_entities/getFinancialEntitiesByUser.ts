import { executeQuery } from "../../db";
import { FinancialEntityListDto } from "../../dtos/financial_entities/FinancialEntityListDto";
import CustomException from "../../models/CustomException";

export async function getFinancialEntitiesByUser(
  userId: number
): Promise<FinancialEntityListDto[]> {
    const query = `
      SELECT 
        fe.id,
        fe.name
      FROM financial_entities fe
      WHERE fe.user_id = $1
        AND fe.deleted = false
      ORDER BY fe.id ASC
    `;

    const result = await executeQuery<any>(query, [userId]);

    if (!result || result.length === 0) {
     throw new CustomException({
        title: "No se encontraron entidades financieras",
        message: "No se encontraron entidades financieras para este usuario.",
      });
    }

    return result.map((row: any): FinancialEntityListDto => ({
      id: Number(row.id),
      name: row.name,
    }));
}
