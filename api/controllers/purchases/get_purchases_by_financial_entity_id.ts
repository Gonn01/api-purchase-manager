import { executeQuery } from "../../db";
import { logRed } from "../../functions/logsCustom";
import { PurchaseDto } from "../../dtos/purchases/PurchaseHomeDto";
import { PurchaseMapper } from "../../mappers/PurchaseMapper";

/**
 * Obtiene todas las compras asociadas a una entidad financiera.
 * @param financialEntityId ID de la entidad financiera
 * @returns Lista de compras en formato DTO
 */
export async function getPurchasesByFinancialEntityId(
  financialEntityId: number
): Promise<PurchaseDto[]> {
  try {
    const query = `
      SELECT * 
      FROM purchases 
      WHERE financial_entity_id = $1 
        AND deleted = false
      ORDER BY created_at DESC
    `;
    const result = await executeQuery < any > (query, [financialEntityId]);

    if (result.length === 0) {
      throw new Error("No se encontraron compras.");
    }

    return result.map((row: any) => PurchaseMapper.toDto(row));
  } catch (error: any) {
    logRed(
      `Error en getPurchasesByFinancialEntityId: ${error.stack || error.message}`
    );
    throw error;
  }
}
