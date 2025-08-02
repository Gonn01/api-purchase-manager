import { executeQuery } from "../../db";
import { logRed } from "../../functions/logsCustom";
import { PurchaseDto } from "../../dtos/purchases/PurchaseHomeDto";
import { PurchaseLogDto } from "../../dtos/purchases/PurchaseLogDto";
import { PurchaseLogMapper } from "../../mappers/PurchaseLogMapper";
import { PurchaseMapper } from "../../mappers/PurchaseMapper";

/**
 * Obtiene una compra por ID junto con sus logs.
 * @param purchaseId ID de la compra
 */
export async function getPurchasesById(
  purchaseId: number
): Promise<PurchaseDto & { logs: PurchaseLogDto[] }> {
  try {
    // 1. Buscar la compra
    const query = `
      SELECT *
      FROM purchases
      WHERE id = $1
        AND deleted = false
      LIMIT 1
    `;
    const result = await executeQuery < any > (query, [purchaseId]);

    if (result.length === 0) {
      throw new Error("No se encontró la compra con el ID proporcionado.");
    }

    // 2. Mapear la compra
    const purchase = PurchaseMapper.toDto(result[0]);

    // 3. Buscar logs de esa compra
    const queryLogs = `
      SELECT *
      FROM purchases_logs
      WHERE purchase_id = $1
      ORDER BY created_at DESC
    `;
    const logs = await executeQuery < any > (queryLogs, [purchaseId]);

    const mappedLogs = logs.map((log: any) => {
      return PurchaseLogMapper.toDto(log);
    });

    // 4. Devolver compra con logs
    return {
      ...purchase,
      logs: mappedLogs,
    };
  } catch (error: any) {
    logRed(`Error en getPurchasesById: ${error.stack || error.message}`);
    throw error;
  }
}
