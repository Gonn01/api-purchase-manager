import { executeQuery } from "../../db";
import { FinancialEntityListDto } from "../../dtos/financial_entities/FinancialEntityListDto";

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

    const result = await executeQuery<any>(query, [userId], true);

    if (!result || result.length === 0) {
      return [];
    }

    return result.map((row: any): FinancialEntityListDto => ({
      id: Number(row.id),
      name: row.name,
    }));
}
