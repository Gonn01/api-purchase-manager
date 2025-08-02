import { executeQuery } from "../../db";
import { logRed } from "../../functions/logsCustom";
import { PurchaseDto } from "../../dtos/purchases/PurchaseHomeDto";
import { PurchaseMapper } from "../../mappers/PurchaseMapper";

/**
 * Edita una compra existente.
 */
export async function editPurchase(
  id: number,
  ignored: boolean,
  image: string | null,
  amount: number,
  number_of_quotas: number,
  payed_quotas: number,
  currency_type: number,
  name: string,
  type: number,
  financialEntityId: number,
  fixedExpense: boolean
): Promise<PurchaseDto> {

  try {
    // 1. Verificar que exista la compra
    const checkQuery = `
      SELECT id FROM purchases WHERE id = $1 AND deleted = false
    `;
    const checkResult = await executeQuery < { id: number } > (checkQuery, [id]);

    if (checkResult.length === 0) {
      logRed(`No se encontró la compra con ID ${id}`);
      throw new Error("No se encontró la compra con el ID proporcionado.");
    }

    // 2. Calcular amount_per_quota
    const recalculatedAmountPerQuota =
      parseFloat(String(amount)) / parseInt(String(number_of_quotas));

    // 3. Determinar finalization_date
    const finalizationDate =
      parseInt(String(payed_quotas)) === parseInt(String(number_of_quotas))
        ? new Date().toISOString()
        : null;

    // 4. Actualizar compra
    const query = `
      UPDATE purchases
      SET ignored = $1,
          image = $2,
          amount = $3,
          amount_per_quota = $4,
          number_of_quotas = $5,
          payed_quotas = $6,
          currency_type = $7,
          name = $8,
          type = $9,
          financial_entity_id = $10,
          fixed_expense = $11,
          finalization_date = $12
      WHERE id = $13
      RETURNING *
    `;

    const result = await executeQuery < any > (
      query,
      [
        ignored,
        image ?? null,
        amount,
        recalculatedAmountPerQuota,
        number_of_quotas,
        payed_quotas,
        currency_type,
        name,
        type,
        financialEntityId,
        fixedExpense,
        finalizationDate,
        id,
      ],
      true
    );

    if (result.length === 0) {
      logRed("No se pudo actualizar la compra.");
      throw new Error("No se pudo actualizar la compra.");
    }

    // 5. Retornar como DTO
    return PurchaseMapper.toDto(result[0]);
  } catch (error: any) {
    logRed(`Error en editPurchase: ${error.stack || error.message}`);
    throw error;
  }
}
