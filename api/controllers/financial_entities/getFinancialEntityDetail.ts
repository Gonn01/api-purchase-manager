import { executeQuery } from "../../db";
import { FinancialEntityDetailDto } from "../../dtos/financial_entities/FinancialEntityDetailDto";
import { FinancialEntityLogDto } from "../../dtos/financial_entities/FinancialEntityLogDto";
import { FinancialEntityPurchaseDto } from "../../dtos/financial_entities/FinancialEntityPurchaseDto";
import CustomException from "../../models/CustomException";

/**
 * Devuelve los detalles de una entidad financiera
 * con sus compras y logs de los últimos 30 días.
 */
export async function getFinancialEntityDetail(
  entityId: number
): Promise<FinancialEntityDetailDto> {
 const query = `
  SELECT 
    fe.id AS financial_entity_id,
    fe.name AS financial_entity_name,
    COALESCE(
      json_agg(
        DISTINCT jsonb_build_object(
          'id', p.id,
          'name', p.name,
          'createdAt', p.created_at,
          'type', p.type
        )
      ) FILTER (WHERE p.id IS NOT NULL),
      '[]'
    ) AS purchases,
    COALESCE(
      json_agg(
        jsonb_build_object(
          'id', l.id,
          'content', l.content,
          'createdAt', l.created_at
        )
      ) FILTER (WHERE l.id IS NOT NULL),
      '[]'
    ) AS logs
  FROM financial_entities fe
  LEFT JOIN purchases p ON p.financial_entity_id = fe.id
  LEFT JOIN purchases_logs l ON l.purchase_id = p.id 
    AND l.created_at >= NOW() - INTERVAL '30 days'
  WHERE fe.id = $1
  GROUP BY fe.id, fe.name
`;


  const result = await executeQuery<any>(query, [entityId], true);

  if (!result || result.length === 0) {
    throw new CustomException({
      title: "Entidad financiera no encontrada",
      message: `No se encontró la entidad financiera con ID ${entityId}`,
    });
  }

  const row = result[0];

  return {
    id: Number(row.financial_entity_id),
    name: row.financial_entity_name,
    purchases: (row.purchases || []).map(
      (purchase: any): FinancialEntityPurchaseDto => ({
        id: Number(purchase.id),
        name: purchase.name,
        createdAt:purchase.createdAt,
        type: purchase.type,
      })
    ),
    logs: (row.logs || []).map(
      (log: any): FinancialEntityLogDto => ({
        id: Number(log.id),
        content: log.content,
        createdAt: log.createdAt,
      })
    ),
  };
}
