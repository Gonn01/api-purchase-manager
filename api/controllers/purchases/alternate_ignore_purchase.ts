import { executeQuery } from "../../db";
import { PurchaseHomeDto } from "../../dtos/home/PurchaseHomeDto";

/**
 * Alterna el estado "ignored" de una compra y devuelve la compra actualizada.
 */
export async function alternateIgnorePurchase(purchaseId: number): Promise<PurchaseHomeDto> {
  const updateQuery = `
      UPDATE purchases
         SET ignored = NOT ignored
       WHERE id = $1
         AND deleted = false
      RETURNING
        id,
        financial_entity_id,
        finalization_date,
        first_quota_date,
        ignored,
        image,
        amount,
        amount_per_quota,
        number_of_quotas,
        payed_quotas,
        currency_type,
        name,
        type,
        fixed_expense
    `;

  // Para writes usás "false" en executeQuery
  const rows = await executeQuery<any>(updateQuery, [purchaseId], false);

  if (rows.length === 0) {
    throw new Error("No se encontró la compra o está eliminada.");
  }

  const r = rows[0];

  const dto: PurchaseHomeDto = {
    id: Number(r.id),
    financial_entity_id: Number(r.financial_entity_id),
    finalization_date: r.finalization_date ? new Date(r.finalization_date).toISOString() : null,
    first_quota_date: r.first_quota_date ? new Date(r.first_quota_date).toISOString() : null,
    ignored: Boolean(r.ignored),
    image: r.image,
    amount: r.amount != null ? Number(r.amount) : 0,
    amount_per_quota: r.amount_per_quota != null ? Number(r.amount_per_quota) : 0,
    number_of_quotas: r.number_of_quotas != null ? Number(r.number_of_quotas) : 0,
    payed_quotas: r.payed_quotas != null ? Number(r.payed_quotas) : 0,
    currency_type: Number(r.currency_type),
    name: r.name,
    type: Number(r.type),
    fixed_expense: Boolean(r.fixed_expense),
  };

  return dto;
}
