import { executeQuery } from "../../db";
import { logRed } from "../../functions/logsCustom";
import { PurchaseDto } from "../../dtos/purchases/PurchaseDto";
import { PurchaseMapper } from "../../mappers/PurchaseMapper";

/**
 * Obtiene todas las compras de un usuario (a través de sus entidades financieras).
 * @param userId ID del usuario
 * @returns Lista de compras en formato DTO
 */
export async function getPurchasesByUserId(
  userId: number
): Promise<PurchaseDto[]> {
  try {
    const query = `
      SELECT purchases.*
      FROM purchases
      INNER JOIN financial_entities
        ON purchases.financial_entity_id = financial_entities.id
      WHERE financial_entities.user_id = $1
        AND purchases.deleted = false
        AND financial_entities.deleted = false
      ORDER BY purchases.created_at DESC
    `;
    const result = await executeQuery < any > (query, [userId], true);

    if (result.length === 0) {
      throw new Error("No se encontraron compras.");
    }

    return result.map((row: any) => PurchaseMapper.toDto(row));
  } catch (error: any) {
    logRed(`Error en getPurchasesByUserId: ${error.stack || error.message}`);
    throw error;
  }
}
