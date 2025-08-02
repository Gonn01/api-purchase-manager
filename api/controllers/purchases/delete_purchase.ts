import { executeQuery } from "../../db";
import { createPurchaseLog } from "../../functions/logs";
import { logRed, logYellow } from "../../functions/logsCustom";

/**
 * Elimina (soft delete) una compra marcándola como deleted.
 * @param purchaseId ID de la compra
 */
export async function deletePurchase(purchaseId: number): Promise<{ id: number }> {
  try {
    // 1. Verificar existencia
    const checkQuery = `
      SELECT id FROM purchases WHERE id = $1 AND deleted = false
    `;
    const checkResult = await executeQuery < { id: number } > (checkQuery, [purchaseId]);

    if (checkResult.length === 0) {
      logRed(`No se encontró la compra con ID ${purchaseId}`);
      throw new Error("No se encontró la compra con el ID proporcionado.");
    }

    // 2. Soft delete con RETURNING
    const query = `
      UPDATE purchases 
      SET deleted = true 
      WHERE id = $1
      RETURNING id
    `;
    const result = await executeQuery < { id: number } > (query, [purchaseId]);

    if (result.length === 0) {
      logRed("No se pudo eliminar la compra.");
      throw new Error("No se pudo eliminar la compra.");
    }

    logYellow(`Compra con ID ${purchaseId} marcada como eliminada.`);

    // 3. Crear log de eliminación
    await createPurchaseLog(purchaseId, "Compra eliminada");

    return { id: result[0].id };
  } catch (error: any) {
    logRed(`Error en deletePurchase: ${error.stack || error.message}`);
    throw error;
  }
}
