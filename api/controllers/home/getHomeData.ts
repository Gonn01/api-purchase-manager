import { executeQuery } from "../../db";
import { FinancialEntityHomeDto } from "../../dtos/home/FinancialEntityDto";
import { HomeDataDto } from "../../dtos/home/HomeDataDto";
import { PurchaseHomeDto } from "../../dtos/home/PurchaseHomeDto";
import { logRed } from "../../functions/logsCustom";

/**
 * Devuelve toda la información del home de un usuario.
 */
export async function getHomeData(userId: number): Promise<HomeDataDto> {
  try {
    const query = `
      SELECT 
        u.id AS user_id, 
        u.created_at AS user_created_at, 
        u.name AS user_name, 
        u.email AS user_email,
        fe.id AS financial_entity_id,
        fe.created_at AS fe_created_at,
        fe.name AS fe_name,
        p.id AS purchase_id,
        p.created_at AS p_created_at,
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
        users u
      LEFT JOIN 
        financial_entities fe ON u.id = fe.user_id AND fe.deleted = false
      LEFT JOIN 
        purchases p ON fe.id = p.financial_entity_id AND p.deleted = false
      WHERE 
        u.id = $1
      ORDER BY 
        fe.created_at DESC, p.created_at DESC;
    `;

    const result = await executeQuery < any > (query, [userId]);

    if (result.length === 0) {
      throw new Error("No se encontró data para este usuario.");
    }

    // Datos del usuario (sacamos del primer registro, porque es LEFT JOIN)
    const userData = {
      user_id: Number(result[0].user_id),
      user_created_at: new Date(result[0].user_created_at).toISOString(),
      user_name: result[0].user_name,
      user_email: result[0].user_email,
      financial_entities: [] as FinancialEntityHomeDto[],
    };

    // Agrupar entidades y compras
    const groupedEntities: Record<number, FinancialEntityHomeDto> = {};

    result.forEach((row: any) => {
      if (row.financial_entity_id === null) return;

      const feId = Number(row.financial_entity_id);

      if (!groupedEntities[feId]) {
        groupedEntities[feId] = {
          id: feId,
          created_at: new Date(row.fe_created_at).toISOString(),
          name: row.fe_name,
          purchases: [],
        };
      }

      if (row.purchase_id !== null) {
        const purchase: PurchaseHomeDto = {
          id: Number(row.purchase_id),
          created_at: new Date(row.p_created_at).toISOString(),
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

        groupedEntities[feId].purchases.push(purchase);
      }
    });

    userData.financial_entities = Object.values(groupedEntities);

    return userData;
  } catch (error: any) {
    logRed(`Error en getHomeData: ${error.stack || error.message}`);
    throw error;
  }
}
