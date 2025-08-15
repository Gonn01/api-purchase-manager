
import { FinancialEntityRepository } from "../repositories/financial-entity.repository";
import { FinancialEntityListItemDTO } from "../dtos/financial-entity/financial-entity-list-item.dto";

export class FinancialEntityListService {
    constructor(private repo = new FinancialEntityRepository()) { }

    async list(userId: number): Promise<FinancialEntityListItemDTO[]> {
        const rows = await this.repo.listByUser(userId);
        return rows.map(r => ({ id: Number(r.id), name: String(r.name) }));
    }

    async remove(userId: number, financialEntityId: number): Promise<void> {
        const owns = await this.repo.ensureOwnership(userId, financialEntityId);
        if (!owns) {
            const e: any = new Error("Financial entity no encontrada");
            e.status = 404; e.code = "FE_NOT_FOUND";
            throw e;
        }
        const hasPurchases = await this.repo.hasAnyPurchase(financialEntityId);
        if (hasPurchases) {
            const e: any = new Error("No se puede eliminar: tiene compras asociadas");
            e.status = 400; e.code = "FE_HAS_PURCHASES";
            throw e;
        }
        await this.repo.softDelete(userId, financialEntityId);
    }
}
