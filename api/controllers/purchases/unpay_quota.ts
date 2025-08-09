import { executeQuery } from "../../db";
import { PurchaseHomeDto } from "../../dtos/home/PurchaseHomeDto";
import { createPurchaseLog } from "../../functions/logs";
import { logRed } from "../../functions/logsCustom";
import { PurchaseTypeEnum } from "../../models/PurchaseType";

/**
 * Desmarca una cuota pagada de una compra (retrocede un mes).
 */
export async function unpayQuota(purchaseId: number): Promise<PurchaseHomeDto> {
  try {
    // 1) Buscar la compra
    const purchaseQuery = `
      SELECT *
      FROM purchases
      WHERE id = $1 AND deleted = false
      LIMIT 1
    `;
    const rows = await executeQuery<any>(purchaseQuery, [purchaseId], true);

    if (rows.length === 0) {
      throw new Error("Purchase not found.");
    }

    const purchase = rows[0] as {
      id: number;
      name: string;
      amount: string | number;
      amount_per_quota: string | number | null;
      number_of_quotas: number | null;
      payed_quotas: number | null;
      currency_type: number;
      type: number;
      fixed_expense: boolean;
      first_quota_date: string | Date | null;
      finalization_date: string | Date | null;
      image: string | null;
      ignored: boolean;
      financial_entity_id: number;
    };

    // 2) Validaciones
    if (purchase.fixed_expense) {
      throw new Error("Cannot unpay quota on a fixed-expense purchase.");
    }

    const totalQuotas = Number(purchase.number_of_quotas ?? 0);
    const currentPayed = Number(purchase.payed_quotas ?? 0);

    if (totalQuotas <= 0) {
      throw new Error("Purchase has no quotas to unpay.");
    }
    if (currentPayed <= 0) {
      throw new Error("No quotas have been paid to decrease.");
    }

    // 3) Calcular nuevos valores
    const newPayedQuotas = currentPayed - 1;

    // Si queda en 0, quitamos first_quota_date; si no, la dejamos como estaba
    const newFirstQuotaDate =
      newPayedQuotas === 0 ? null : purchase.first_quota_date;

    // Si deja de estar saldada, finalization_date debe ser null
    const wasSettled = purchase.finalization_date != null;
    const stillSettled = newPayedQuotas >= totalQuotas; // debería ser false si bajamos
    const newFinalizationDate = stillSettled ? purchase.finalization_date : null;

    // Revertir el type si estaba Settled*
    let newType = purchase.type;
    if (!stillSettled) {
      if (purchase.type === PurchaseTypeEnum.SettledDebtorPurchase) {
        newType = PurchaseTypeEnum.CurrentDebtorPurchase;
      } else if (purchase.type === PurchaseTypeEnum.SettledCreditorPurchase) {
        newType = PurchaseTypeEnum.CurrentCreditorPurchase;
      }
    }

    // 4) Actualizar en DB
    const updateQuery = `
      UPDATE purchases
         SET payed_quotas = $1,
             first_quota_date = $2,
             finalization_date = $3,
             type = $4
       WHERE id = $5
         AND deleted = false
      RETURNING
        id, name, amount, amount_per_quota, number_of_quotas, payed_quotas,
        currency_type, type, fixed_expense, first_quota_date, finalization_date,
        image, ignored, financial_entity_id
    `;
    const params = [
      newPayedQuotas,         // $1
      newFirstQuotaDate,      // $2
      newFinalizationDate,    // $3
      newType,                // $4
      purchaseId,             // $5
    ];

    // Para writes venías usando "false"
    const updatedRows = await executeQuery<any>(updateQuery, params, false);

    if (updatedRows.length === 0) {
      throw new Error("Failed to update purchase.");
    }

    const u = updatedRows[0];

    // 5) Log automático (la cuota que “se desmarca” es la que estaba paga: currentPayed)
    await createPurchaseLog(
      Number(u.id),
      `Cuota ${currentPayed} desmarcada`
    );

    // 6) DTO de salida
    const dto: PurchaseHomeDto = {
      id: Number(u.id),
      name: u.name,
      amount: Number(u.amount),
      amount_per_quota: u.amount_per_quota != null ? Number(u.amount_per_quota) : null,
      number_of_quotas: u.number_of_quotas != null ? Number(u.number_of_quotas) : null,
      payed_quotas: u.payed_quotas != null ? Number(u.payed_quotas) : null,
      currency_type: Number(u.currency_type),
      type: Number(u.type),
      fixed_expense: Boolean(u.fixed_expense),
      first_quota_date: u.first_quota_date ? new Date(u.first_quota_date).toISOString() : null,
      finalization_date: u.finalization_date ? new Date(u.finalization_date).toISOString() : null,
      image: u.image,
      ignored: Boolean(u.ignored),
      financial_entity_id: Number(u.financial_entity_id),
    };

    return dto;
  } catch (error: any) {
    logRed(`Error in unpayQuota: ${error.stack || error.message}`);
    throw error;
  }
}
