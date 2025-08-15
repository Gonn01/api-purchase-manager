import { executeQuery } from "../db";

// filas crudas
export type HomeRow = {
  financial_entity_id: number;
  fe_name: string;
  purchase_id: number | null;
  finalization_date: string | null;
  first_quota_date: string | null;
  ignored: boolean | null;
  image: string | null;
  amount: string | number | null;
  amount_per_quota: string | number | null;
  number_of_quotas: number | null;
  payed_quotas: number | null;
  currency_type: number | null;
  p_name: string | null;
  type: number | null;
  fixed_expense: boolean | null;
};

export class HomeRepository {
  async fetchHomeRows(userId: number): Promise<HomeRow[]> {
    const sql = `
      SELECT 
        fe.id AS financial_entity_id,
        fe.name AS fe_name,
        p.id AS purchase_id,
        p.finalization_date,
        p.first_quota_date,
        p.ignored,
        p.image,
        p.amount,
        p.amount_per_quota,
        p.number_of_quotas,
        p.payed_quotas,
        p.currency_type,
        p.name AS p_name,
        p.type,
        p.fixed_expense
      FROM financial_entities fe
      LEFT JOIN purchases p
        ON fe.id = p.financial_entity_id
       AND p.deleted = false
      WHERE fe.user_id = $1
        AND fe.deleted = false
      ORDER BY fe.id, p.id;
    `;
    return executeQuery<HomeRow>(sql, [userId], true);
  }

  async fetchRowsForEntity(userId: number, financialEntityId: number): Promise<HomeRow[]> {
    const sql = `
      SELECT 
        fe.id AS financial_entity_id,
        fe.name AS fe_name,
        p.id AS purchase_id,
        p.finalization_date,
        p.first_quota_date,
        p.ignored,
        p.image,
        p.amount,
        p.amount_per_quota,
        p.number_of_quotas,
        p.payed_quotas,
        p.currency_type,
        p.name AS p_name,
        p.type,
        p.fixed_expense
      FROM financial_entities fe
      LEFT JOIN purchases p
        ON fe.id = p.financial_entity_id
       AND p.deleted = false
      WHERE fe.user_id = $1
        AND fe.id = $2
        AND fe.deleted = false
      ORDER BY p.id;
    `;
    return executeQuery<HomeRow>(sql, [userId, financialEntityId], true);
  }
}
