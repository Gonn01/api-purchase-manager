import { executeQuery } from "../../db";
import { logRed, logYellow } from "../../functions/logsCustom";
import { PurchaseDto } from "../../dtos/purchases/PurchaseDto";
import { PurchaseMapper } from "../../mappers/PurchaseMapper";

/**
 * Alterna el estado "ignored" de una compra.
 * @param purchaseId ID de la compra
 * @returns Compra actualizada en formato DTO
 */
export async function alternateIgnorePurchase(
  purchaseId: number
): Promise<PurchaseDto> {
  try {
    // 1. Obtener estado actual
    const purchaseQuery = `
      SELECT id, ignored, created_at, name, amount, number_of_quotas, payed_quotas, 
             currency_type, type, fixed_expense, image
      FROM purchases 
      WHERE id = $1 AND deleted = false
    `;
    const purchaseResult = await executeQuery < any > (purchaseQuery, [purchaseId], true);

    if (purchaseResult.length === 0) {
      throw new Error("No se encontró la compra con el ID proporcionado.");
    }

    const currentIgnored = Boolean(purchaseResult[0].ignored);

    // 2. Alternar estado y devolver la compra
    const updateQuery = `
      UPDATE purchases
      SET ignored = $1
      WHERE id = $2
      RETURNING *
    `;
    const updated = await executeQuery < any > (updateQuery, [!currentIgnored, purchaseId]);

    logYellow(
      `Compra con ID ${purchaseId} ahora está ignored = ${!currentIgnored}`
    );

    return PurchaseMapper.toDto(updated[0]);
  } catch (error: any) {
    logRed(`Error en alternateIgnorePurchase: ${error.stack || error.message}`);
    throw error;
  }
}
