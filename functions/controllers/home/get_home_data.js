import { executeQuery } from "../../db.js";
import { logRed } from "../../funciones/logsCustom.js";

export async function getHomeData(userId) {
  try {
    const query = `
      SELECT 
        u.id AS user_id, 
        u.created_at AS user_created_at, 
        u.name AS user_name, 
        u.email AS user_email,
        fe.*, 
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
        p.financial_entity_id,
        p.fixed_expense
      FROM 
        users u
      LEFT JOIN 
        financial_entities fe ON u.id = fe.user_id 
      LEFT JOIN 
        purchases p ON fe.id = p.financial_entity_id
      WHERE 
        u.id = $1 AND fe.deleted = false AND p.deleted = false
      ORDER BY 
        p.created_at DESC, fe.created_at DESC;
    `;
    const result = await executeQuery(query, [userId]);

    if (result.length === 0) {
      throw new Error("No se encontro data para este usuario.");
    }

    // Agrupar los resultados por entidad financiera
    const groupedData = {};
    result.forEach((row) => {
      const financialEntityId = row.financial_entity_id;

      if (!groupedData[financialEntityId]) {
        groupedData[financialEntityId] = {
          financialEntityId: parseInt(financialEntityId),
          id: parseInt(row.id),
          created_at: row.created_at,
          name: row.name,
          purchases: [],
        };
      }

      if (row.purchase_id) {
        groupedData[financialEntityId].purchases.push({
          id: parseInt(row.purchase_id),
          created_at: row.p_created_at, // Usa p_created_at para la compra
          finalization_date: row.finalization_date,
          first_quota_date: row.first_quota_date,
          ignored: row.ignored,
          image: row.image,
          amount: parseFloat(row.amount),
          amount_per_quota: parseFloat(row.amount_per_quota),
          number_of_quotas: parseInt(row.number_of_quotas),
          payed_quotas: parseInt(row.payed_quotas),
          currency_type: parseInt(row.currency_type),
          name: row.p_name,
          type: parseInt(row.type),
          fixed_expense: row.fixed_expense,
        });
      }
    });

    // Convertir el objeto agrupado en un array
    const finalResult = Object.values(groupedData);

    return finalResult;
  } catch (error) {
    logRed(`Error en getHomeData: ${error.stack}`);
    throw error;
  }
}