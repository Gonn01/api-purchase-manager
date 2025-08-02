import { executeQuery } from "../../db";
import { logRed } from "../../functions/logsCustom";
import { PurchaseDto } from "../../dtos/purchases/PurchaseDto";
import { PurchaseMapper } from "../../mappers/PurchaseMapper";

/**
 * Crea una nueva compra asociada a una entidad financiera.
 */
export async function createPurchase(
  ignored: boolean,
  image: string | null,
  amount: number,
  amount_per_quota: number,
  number_of_quotas: number,
  payed_quotas: number,
  currency_type: number,
  name: string,
  type: number,
  financialEntityId: number,
  fixedExpense: boolean
): Promise<PurchaseDto> {
  try {
    // 1. Verificar que no exista una compra con el mismo nombre
    const checkQuery = `
      SELECT name FROM purchases 
      WHERE name = $1 AND deleted = false 
      LIMIT 1
    `;
    const checkResult = await executeQuery(checkQuery, [name], true);

    if (checkResult.length > 0) {
      throw new Error("Ya existe una compra con ese nombre.");
    }

    // 2. Insertar compra
    const values = [
      ignored,
      image ?? null,
      amount,
      amount_per_quota,
      number_of_quotas,
      payed_quotas,
      currency_type,
      name,
      type,
      financialEntityId,
      fixedExpense,
    ];

    const query = `
      INSERT INTO purchases
      (ignored, image, amount, amount_per_quota, number_of_quotas, payed_quotas, currency_type, name, type, financial_entity_id, fixed_expense)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const result = await executeQuery < any > (query, values, true);

    return PurchaseMapper.toDto(result[0]);
  } catch (error: any) {
    logRed(`Error en createPurchase: ${error.stack || error.message}`);
    throw error;
  }
}
