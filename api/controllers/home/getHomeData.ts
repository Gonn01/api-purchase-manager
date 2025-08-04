import { executeQuery } from "../../db";
import { FinancialEntityHomeDto } from "../../dtos/home/FinancialEntityHomeDto";
import { PurchaseHomeDto } from "../../dtos/home/PurchaseHomeDto";
import CustomException from "../../models/CustomException";
import { PurchaseTypeEnum } from "../../models/Purchase";

/**
 * Devuelve las entidades financieras de un usuario
 * con las compras separadas en current y settled.
 */
export async function getHomeData(userId: number): Promise<FinancialEntityHomeDto[]> {
  const query = `
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
    FROM 
      financial_entities fe
    INNER JOIN 
          purchases p ON fe.id = p.financial_entity_id AND p.deleted = false
    WHERE 
      fe.user_id = $1
          AND fe.deleted = false;
  `;

  const result = await executeQuery(query, [userId]);

  const groupedEntities: Record<number, FinancialEntityHomeDto> = {};

  result.forEach((row: any) => {
    const feId = Number(row.financial_entity_id);

    if (!groupedEntities[feId]) {
      groupedEntities[feId] = {
        id: feId,
        name: row.fe_name,
        current_purchases: [],
        settled_purchases: [],
      };
    }

    if (row.purchase_id !== null) {
      const purchase: PurchaseHomeDto = {
        id: Number(row.purchase_id),
        finalization_date: row.finalization_date
          ? new Date(row.finalization_date).toISOString()
          : null,
        first_quota_date: row.first_quota_date
          ? new Date(row.first_quota_date).toISOString()
          : null,
        ignored: Boolean(row.ignored),
        image: row.image,
        amount: parseFloat(row.amount),
        amount_per_quota: parseFloat(row.amount_per_quota),
        number_of_quotas: Number(row.number_of_quotas),
        payed_quotas: Number(row.payed_quotas),
        currency_type: Number(row.currency_type),
        name: row.p_name,
        type: Number(row.type),
        fixed_expense: Boolean(row.fixed_expense),
      };

      if (
        purchase.type === PurchaseTypeEnum.CurrentDebtorPurchase ||
        purchase.type === PurchaseTypeEnum.CurrentCreditorPurchase
      ) {
        groupedEntities[feId].current_purchases.push(purchase);
      } else {
        groupedEntities[feId].settled_purchases.push(purchase);
      }
    }
  });

  return Object.values(groupedEntities);
}
