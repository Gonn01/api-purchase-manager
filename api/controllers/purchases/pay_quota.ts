import { executeQuery } from "../../db";
import { PurchaseHomeDto } from "../../dtos/home/PurchaseHomeDto";
import { createPurchaseLog } from "../../functions/logs";
import { PurchaseTypeEnum } from "../../models/PurchaseType";

/**
 * Marca como pagada una cuota de una compra.
 */
export async function payQuota(purchaseId: number): Promise<PurchaseHomeDto> {
    // 1) Obtener la compra
    const purchaseQuery = `
      SELECT *
      FROM purchases
      WHERE id = $1 AND deleted = false
      LIMIT 1
    `;
    const purchaseRows = await executeQuery<any>(purchaseQuery, [purchaseId], true);

    if (purchaseRows.length === 0) {
        throw new Error("Purchase not found.");
    }

    const purchase = purchaseRows[0] as {
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

    // 2) Validaciones de negocio
    if (purchase.fixed_expense) {
        throw new Error("Cannot pay quota on a fixed-expense purchase.");
    }

    const totalQuotas = Number(purchase.number_of_quotas ?? 0);
    const currentPayed = Number(purchase.payed_quotas ?? 0);

    if (totalQuotas <= 0) {
        throw new Error("Purchase has no quotas to pay.");
    }
    if (currentPayed >= totalQuotas) {
        throw new Error("All quotas have already been paid.");
    }

    // 3) Calcular nuevas propiedades
    const now = new Date();
    const newPayedQuotas = currentPayed + 1;

    const newFirstQuotaDate =
        currentPayed === 0 || !purchase.first_quota_date ? now : purchase.first_quota_date;

    const isNowSettled = newPayedQuotas >= totalQuotas;

    const newFinalizationDate = isNowSettled
        ? now
        : purchase.finalization_date;

    let newType = purchase.type;
    if (isNowSettled) {
        if (purchase.type === PurchaseTypeEnum.CurrentDebtorPurchase) {
            newType = PurchaseTypeEnum.SettledDebtorPurchase;
        } else if (purchase.type === PurchaseTypeEnum.CurrentCreditorPurchase) {
            newType = PurchaseTypeEnum.SettledCreditorPurchase;
        }
    }

    // 4) Actualizar en DB
    const updateQuery = `
      UPDATE purchases
      SET
        payed_quotas = $1,
        first_quota_date = $2,
        finalization_date = $3,
        type = $4
      WHERE id = $5 AND deleted = false
      RETURNING
        id, name, amount, amount_per_quota, number_of_quotas, payed_quotas,
        currency_type, type, fixed_expense, first_quota_date, finalization_date,
        image, ignored, financial_entity_id
    `;
    const updateParams = [
        newPayedQuotas,              // $1
        newFirstQuotaDate,           // $2
        newFinalizationDate,         // $3
        newType,                     // $4
        purchaseId,                  // $5
    ];

    // Para writes en tu helper usabas `false`; ajustá si tu executeQuery lo requiere
    const updatedRows = await executeQuery<any>(updateQuery, updateParams, false);

    if (updatedRows.length === 0) {
        throw new Error("Failed to update purchase.");
    }

    const u = updatedRows[0];

    // 5) Log automático
    await createPurchaseLog(
        Number(u.id),
        `Pago de cuota ${Number(u.payed_quotas)} realizado`
    );

    // 6) Mapear al DTO de salida
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
}
