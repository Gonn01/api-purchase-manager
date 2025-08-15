import { PurchaseRepository } from "../repositories/purchase.repository";
import { FinancialEntityRepository } from "../repositories/financial-entity.repository";
import { PurchaseDetailsDto } from "../dtos/purchase/purchase-details.dto";

const toISO = (x: string | Date | null) =>
    x ? new Date(x).toISOString() : null;

export class PurchaseDetailsService {
    constructor(
        private purchases = new PurchaseRepository(),
        private feRepo = new FinancialEntityRepository()
    ) { }

    async getDetails(userId: number, financialEntityId: number, purchaseId: number): Promise<PurchaseDetailsDto> {
        // Ownership + que la compra pertenezca a esa FE
        const owner = await this.purchases.findByIdWithOwner(purchaseId);
        if (!owner) { const e: any = new Error("Compra no encontrada"); e.status = 404; e.code = "PURCHASE_NOT_FOUND"; throw e; }
        if (owner.user_id !== userId || owner.financial_entity_id !== financialEntityId) {
            const e: any = new Error("Prohibido"); e.status = 403; e.code = "FORBIDDEN"; throw e;
        }

        const row = await this.purchases.getDetails(purchaseId);
        if (!row) { const e: any = new Error("Compra no encontrada"); e.status = 404; e.code = "PURCHASE_NOT_FOUND"; throw e; }

        const logs = await this.purchases.listLogs(purchaseId);

        return {
            id: Number(row.id),
            financial_entity_id: Number(row.financial_entity_id),
            name: row.name,
            amount: Number(row.amount),
            amount_per_quota: row.amount_per_quota != null ? Number(row.amount_per_quota) : null,
            number_of_quotas: row.number_of_quotas != null ? Number(row.number_of_quotas) : null,
            payed_quotas: row.payed_quotas != null ? Number(row.payed_quotas) : null,
            currency_type: Number(row.currency_type),
            type: Number(row.type),
            fixed_expense: !!row.fixed_expense,
            first_quota_date: toISO(row.first_quota_date),
            finalization_date: toISO(row.finalization_date),
            image: row.image ?? null,
            ignored: !!row.ignored,
            logs,
        };
    }
}
