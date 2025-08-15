import { FinancialEntityRepository } from "../repositories/financial-entity.repository";
import { FinancialEntityDetailsDto } from "../dtos/financial-entity/financial-entity-details.dto";

export class FinancialEntityDetailsService {
    constructor(private repo = new FinancialEntityRepository()) { }

    async getDetails(userId: number, financialEntityId: number): Promise<FinancialEntityDetailsDto> {
        const owns = await this.repo.ensureOwnership(userId, financialEntityId);
        if (!owns) {
            const e: any = new Error("Financial entity no encontrada");
            e.status = 404; e.code = "FE_NOT_FOUND";
            throw e;
        }

        const [purchases, logs] = await Promise.all([
            this.repo.listPurchasesSummary(financialEntityId),
            this.repo.listLogs(financialEntityId),
        ]);

        return { purchases, logs };
    }
}
