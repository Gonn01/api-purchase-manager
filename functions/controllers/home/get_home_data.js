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

    const result = await executeQuery(query, [userId]);

    if (result.length === 0) {
      throw new Error("No se encontró data para este usuario.");
    }

    // Agrupar los resultados por entidad financiera
    const groupedData = {};

    result.forEach((row) => {
      const financialEntityId = row.financial_entity_id;

      if (!groupedData[financialEntityId]) {
        groupedData[financialEntityId] = {
          id: parseInt(financialEntityId),
          created_at: row.fe_created_at,
          name: row.fe_name,
          purchases: [], // Inicializa el array de compras vacío
        };
      }

      // Si hay una compra válida, agregarla al array de compras
      if (row.purchase_id !== null) {
        groupedData[financialEntityId].purchases.push({
          id: parseInt(row.purchase_id),
          created_at: row.p_created_at,
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
    return Object.values(groupedData);
  } catch (error) {
    logRed(`Error en getHomeData: ${error.stack}`);
    throw error;
  }
}
