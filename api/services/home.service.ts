import { HomeRepository, HomeRow } from "../repositories/home.repository";
import { FinancialEntityRepository } from "../repositories/financial-entity.repository";
import { PurchaseRepository } from "../repositories/purchase.repository";
import { FinancialEntityHomeDto } from "../dtos/home/financial-entity-home.dto";
import { PurchaseHomeDto } from "../dtos/home/purchase-home.dto";
import { PurchaseUpdateDTO } from "../dtos/purchase/purchase-update.dto";
import { PurchaseTypeEnum, isPurchaseType, parsePurchaseType } from "../models/purchase-type.enum";
import { FinancialEntityCreateDTO } from "../dtos/financial-entity/financial-entity-create.dto";
import { PurchaseCreateDTO } from "../dtos/purchase/purchase-create.dto";

function toISO(x: string | null): string | null {
    if (!x) return null;
    const d = new Date(x);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
function n(x: string | number | null, def: number): number {
    if (x == null) return def;
    const k = typeof x === "number" ? x : Number(x);
    return Number.isNaN(k) ? def : k;
}
function nOrNull(x: string | number | null): number | null {
    if (x == null) return null;
    const k = typeof x === "number" ? x : Number(x);
    return Number.isNaN(k) ? null : k;
}
function isCurrent(t: number | null): boolean {
    if (!isPurchaseType(t)) return false;
    return t === PurchaseTypeEnum.CurrentDebtorPurchase || t === PurchaseTypeEnum.CurrentCreditorPurchase;
}

export class HomeService {
    constructor(
        private readonly homeRepo = new HomeRepository(),
        private readonly feRepo = new FinancialEntityRepository(),
        private readonly purchaseRepo = new PurchaseRepository(),
    ) { }

    // ---------- LECTURA ----------
    async getHome(userId: number): Promise<FinancialEntityHomeDto[]> {
        const rows = await this.homeRepo.fetchHomeRows(userId);
        const grouped: Record<number, FinancialEntityHomeDto> = {};

        for (const r of rows) {
            const feId = Number(r.financial_entity_id);
            if (!grouped[feId]) {
                grouped[feId] = { id: feId, name: r.fe_name, current_purchases: [], settled_purchases: [] };
            }
            if (r.purchase_id == null) continue;

            const p: PurchaseHomeDto = {
                id: Number(r.purchase_id),
                finalization_date: toISO(r.finalization_date),
                first_quota_date: toISO(r.first_quota_date),
                ignored: !!r.ignored,
                image: r.image ?? null,
                amount: n(r.amount, 0),
                amount_per_quota: nOrNull(r.amount_per_quota),
                number_of_quotas: r.number_of_quotas != null ? Number(r.number_of_quotas) : null,
                payed_quotas: r.payed_quotas != null ? Number(r.payed_quotas) : null,
                currency_type: r.currency_type != null ? Number(r.currency_type) : 0,
                name: r.p_name ?? "",
                type: r.type != null ? Number(r.type) : 0,
                fixed_expense: !!r.fixed_expense,
                financial_entity_id: feId,
            };

            (isCurrent(r.type) ? grouped[feId].current_purchases : grouped[feId].settled_purchases).push(p);
        }

        return Object.values(grouped);
    }

    // ---------- MUTACIONES DESDE HOME ----------
    async createFinancialEntity(userId: number, input: FinancialEntityCreateDTO) {
        const created = await this.feRepo.create(userId, input.name.trim());
        // tarjeta vacía para re-render inmediato
        return { id: created.id, name: created.name, current_purchases: [], settled_purchases: [] };
    }

    async createPurchase(userId: number, dto: PurchaseCreateDTO) {
        // ownership
        const owns = await this.feRepo.ensureOwnership(userId, dto.financial_entity_id);
        if (!owns) { const e: any = new Error("La financial entity no pertenece al usuario"); e.status = 403; e.code = "FE_FORBIDDEN"; throw e; }

        // validar enum
        if (!isPurchaseType(dto.type)) parsePurchaseType(dto.type);

        const created = await this.purchaseRepo.create({
            financial_entity_id: dto.financial_entity_id,
            name: dto.name.trim(),
            amount: dto.amount,
            currency_type: dto.currency_type,
            type: dto.type,
            amount_per_quota: dto.amount_per_quota ?? null,
            number_of_quotas: dto.number_of_quotas ?? null,
            first_quota_date: dto.first_quota_date ?? null,
            fixed_expense: dto.fixed_expense ?? false,
            image: dto.image ?? null,
            ignored: dto.ignored ?? false,
        });

        // devolvemos la FE afectada armada como en el home
        const rows = await this.homeRepo.fetchRowsForEntity(userId, created.financial_entity_id);
        return this._assembleSingleEntity(rows);
    }

    async updatePurchase(userId: number, purchaseId: number, patch: PurchaseUpdateDTO) {
        const row = await this.purchaseRepo.findByIdWithOwner(purchaseId);
        if (!row) { const e: any = new Error("Compra no encontrada"); e.status = 404; e.code = "PURCHASE_NOT_FOUND"; throw e; }
        if (row.user_id !== userId) { const e: any = new Error("Prohibido"); e.status = 403; e.code = "PURCHASE_FORBIDDEN"; throw e; }

        if (patch.type !== undefined) parsePurchaseType(patch.type);
        await this.purchaseRepo.update(purchaseId, {
            name: patch.name?.trim(),
            amount: patch.amount,
            currencyType: patch.currencyType,
            type: patch.type,
            amountPerQuota: patch.amountPerQuota ?? null,
            numberOfQuotas: patch.numberOfQuotas ?? null,
            firstQuotaDate: patch.firstQuotaDate ?? null,
            fixedExpense: patch.fixedExpense,
            image: patch.image ?? null,
            ignored: patch.ignored,
        });

        const rows = await this.homeRepo.fetchRowsForEntity(userId, row.financial_entity_id);
        return this._assembleSingleEntity(rows);
    }

    async deletePurchase(userId: number, purchaseId: number) {
        const row = await this.purchaseRepo.findByIdWithOwner(purchaseId);
        if (!row) { const e: any = new Error("Compra no encontrada"); e.status = 404; e.code = "PURCHASE_NOT_FOUND"; throw e; }
        if (row.user_id !== userId) { const e: any = new Error("Prohibido"); e.status = 403; e.code = "PURCHASE_FORBIDDEN"; throw e; }

        await this.purchaseRepo.softDelete(purchaseId);

        const rows = await this.homeRepo.fetchRowsForEntity(userId, row.financial_entity_id);
        return this._assembleSingleEntity(rows);
    }

    // ---- helper: arma una sola FE desde filas ----
    private _assembleSingleEntity(rows: HomeRow[]): FinancialEntityHomeDto {
        if (!rows.length) {
            // si acabamos de crear FE sin compras, no vamos a entrar acá
            return { id: 0, name: "", current_purchases: [], settled_purchases: [] };
        }
        const feId = Number(rows[0].financial_entity_id);
        const dto: FinancialEntityHomeDto = { id: feId, name: rows[0].fe_name, current_purchases: [], settled_purchases: [] };

        for (const r of rows) {
            if (r.purchase_id == null) continue;
            const p: PurchaseHomeDto = {
                id: Number(r.purchase_id),
                finalization_date: toISO(r.finalization_date),
                first_quota_date: toISO(r.first_quota_date),
                ignored: !!r.ignored,
                image: r.image ?? null,
                amount: n(r.amount, 0),
                amount_per_quota: nOrNull(r.amount_per_quota),
                number_of_quotas: r.number_of_quotas != null ? Number(r.number_of_quotas) : null,
                payed_quotas: r.payed_quotas != null ? Number(r.payed_quotas) : null,
                currency_type: r.currency_type != null ? Number(r.currency_type) : 0,
                name: r.p_name ?? "",
                type: r.type != null ? Number(r.type) : 0,
                fixed_expense: !!r.fixed_expense,
                financial_entity_id: feId,
            };
            (isCurrent(r.type) ? dto.current_purchases : dto.settled_purchases).push(p);
        }
        return dto;
    }// 1) Toggle ignore → solo ids
    async toggleIgnorePurchase(userId: number, purchaseId: number) {
        const row = await this.purchaseRepo.findByIdWithOwner(purchaseId);
        if (!row) { const e: any = new Error("Compra no encontrada"); e.status = 404; e.code = "PURCHASE_NOT_FOUND"; throw e; }
        if (row.user_id !== userId) { const e: any = new Error("Prohibido"); e.status = 403; e.code = "PURCHASE_FORBIDDEN"; throw e; }

        const toggled = await this.purchaseRepo.toggleIgnore(purchaseId);
        return {
            purchaseId: toggled.id,
            financialEntityId: toggled.financial_entity_id,
            ignored: toggled.ignored,
        };
    }

    // 2) Pay quota → devuelve FE afectada armada como Home
    async payQuota(userId: number, purchaseId: number): Promise<FinancialEntityHomeDto> {
        const p = await this.purchaseRepo.getByIdForQuota(purchaseId);
        if (!p) { const e: any = new Error("Purchase not found."); e.status = 404; e.code = "PURCHASE_NOT_FOUND"; throw e; }

        // ownership
        const owns = await this.feRepo.ensureOwnership(userId, p.financial_entity_id);
        if (!owns) { const e: any = new Error("Prohibido"); e.status = 403; e.code = "PURCHASE_FORBIDDEN"; throw e; }

        if (p.fixed_expense) { const e: any = new Error("Cannot pay quota on a fixed-expense purchase."); e.status = 400; e.code = "INVALID_OPERATION"; throw e; }

        const totalQuotas = Number(p.number_of_quotas ?? 0);
        const currentPayed = Number(p.payed_quotas ?? 0);
        if (totalQuotas <= 0) { const e: any = new Error("Purchase has no quotas to pay."); e.status = 400; e.code = "NO_QUOTAS"; throw e; }
        if (currentPayed >= totalQuotas) { const e: any = new Error("All quotas have already been paid."); e.status = 400; e.code = "ALREADY_SETTLED"; throw e; }

        const now = new Date();
        const newPayedQuotas = currentPayed + 1;
        const newFirstQuotaDate = currentPayed === 0 || !p.first_quota_date ? now : p.first_quota_date;
        const isNowSettled = newPayedQuotas >= totalQuotas;

        let newType = p.type;
        if (isNowSettled) {
            if (p.type === PurchaseTypeEnum.CurrentDebtorPurchase) newType = PurchaseTypeEnum.SettledDebtorPurchase;
            else if (p.type === PurchaseTypeEnum.CurrentCreditorPurchase) newType = PurchaseTypeEnum.SettledCreditorPurchase;
        }

        const updated = await this.purchaseRepo.updateQuotaAndType(purchaseId, {
            payedQuotas: newPayedQuotas,
            firstQuotaDate: newFirstQuotaDate,
            finalizationDate: isNowSettled ? now : p.finalization_date,
            type: newType,
        });

        const rows = await this.homeRepo.fetchRowsForEntity(userId, updated.financial_entity_id);
        return this._assembleSingleEntity(rows);
    }

    // 3) Unpay quota → devuelve FE afectada
    async unpayQuota(userId: number, purchaseId: number): Promise<FinancialEntityHomeDto> {
        const p = await this.purchaseRepo.getByIdForQuota(purchaseId);
        if (!p) { const e: any = new Error("Purchase not found."); e.status = 404; e.code = "PURCHASE_NOT_FOUND"; throw e; }

        // ownership
        const owns = await this.feRepo.ensureOwnership(userId, p.financial_entity_id);
        if (!owns) { const e: any = new Error("Prohibido"); e.status = 403; e.code = "PURCHASE_FORBIDDEN"; throw e; }

        if (p.fixed_expense) { const e: any = new Error("Cannot unpay quota on a fixed-expense purchase."); e.status = 400; e.code = "INVALID_OPERATION"; throw e; }

        const totalQuotas = Number(p.number_of_quotas ?? 0);
        const currentPayed = Number(p.payed_quotas ?? 0);
        if (totalQuotas <= 0) { const e: any = new Error("Purchase has no quotas to unpay."); e.status = 400; e.code = "NO_QUOTAS"; throw e; }
        if (currentPayed <= 0) { const e: any = new Error("No quotas have been paid to decrease."); e.status = 400; e.code = "NOTHING_TO_UNPAY"; throw e; }

        const newPayedQuotas = currentPayed - 1;
        const newFirstQuotaDate = newPayedQuotas === 0 ? null : p.first_quota_date;

        const stillSettled = newPayedQuotas >= totalQuotas; // normalmente false
        const newFinalizationDate = stillSettled ? p.finalization_date : null;

        let newType = p.type;
        if (!stillSettled) {
            if (p.type === PurchaseTypeEnum.SettledDebtorPurchase) newType = PurchaseTypeEnum.CurrentDebtorPurchase;
            else if (p.type === PurchaseTypeEnum.SettledCreditorPurchase) newType = PurchaseTypeEnum.CurrentCreditorPurchase;
        }

        const updated = await this.purchaseRepo.updateQuotaAndType(purchaseId, {
            payedQuotas: newPayedQuotas,
            firstQuotaDate: newFirstQuotaDate,
            finalizationDate: newFinalizationDate,
            type: newType,
        });


        const rows = await this.homeRepo.fetchRowsForEntity(userId, updated.financial_entity_id);
        return this._assembleSingleEntity(rows);
    }
    /**
     * Paga 1 cuota SOLO de compras en estado Current (0 o 1).
     * Todas deben pertenecer a la MISMA Financial Entity.
     * Devuelve la FE afectada armada como en Home.
     */
    async payCurrent(userId: number, purchaseIds: number[]) {
        if (!Array.isArray(purchaseIds) || purchaseIds.length === 0) {
            const e: any = new Error("purchaseIds debe ser un array no vacío."); e.status = 400; e.code = "BAD_REQUEST"; throw e;
        }

        // Traer compras necesarias para cálculo
        const rows = await this.purchaseRepo.getManyForPayCurrent(purchaseIds);
        if (!rows.length) { const e: any = new Error("No se encontraron compras."); e.status = 404; e.code = "PURCHASES_NOT_FOUND"; throw e; }

        // Todas a misma FE
        const feSet = new Set(rows.map(r => Number(r.financial_entity_id)));
        if (feSet.size !== 1) { const e: any = new Error("Todas las compras deben pertenecer a una sola financial entity."); e.status = 400; e.code = "MULTIPLE_FE"; throw e; }
        const financialEntityId = [...feSet][0];

        // Ownership
        const owns = await this.feRepo.ensureOwnership(userId, financialEntityId);
        if (!owns) { const e: any = new Error("Prohibido"); e.status = 403; e.code = "FORBIDDEN"; throw e; }

        const now = new Date();
        const updates: Array<{ id: number; payedQuotas: number; firstQuotaDate: Date | string | null; finalizationDate: Date | string | null; type: number }> = [];

        for (const p of rows) {
            if (p.fixed_expense) continue; // nunca cuotas en fixed
            const type = Number(p.type);
            // SOLO current
            if (type !== PurchaseTypeEnum.CurrentDebtorPurchase && type !== PurchaseTypeEnum.CurrentCreditorPurchase) continue;

            const total = Number(p.number_of_quotas ?? 0);
            const paid = Number(p.payed_quotas ?? 0);
            if (total <= 0) continue;            // nada que pagar
            if (paid >= total) continue;         // ya completo

            const newPaid = paid + 1;
            const newFirst = paid === 0 || !p.first_quota_date ? now : p.first_quota_date;
            const isNowSettled = newPaid >= total;

            updates.push({
                id: Number(p.id),
                payedQuotas: newPaid,
                firstQuotaDate: newFirst ? new Date(newFirst) : null,
                finalizationDate: isNowSettled ? now : null,
                type: isNowSettled
                    ? (type === PurchaseTypeEnum.CurrentDebtorPurchase
                        ? PurchaseTypeEnum.SettledDebtorPurchase
                        : PurchaseTypeEnum.SettledCreditorPurchase)
                    : type,
            });
        }

        if (updates.length > 0) {
            await this.purchaseRepo.batchUpdatePayCurrent(updates);
            // opcional: logs en batch
            // await this.purchaseRepo.batchInsertLogs(updates.map(u => ({ purchaseId: u.id, content: `Pago de cuota ${u.payedQuotas}` })));
        }

        const feRows = await this.homeRepo.fetchRowsForEntity(userId, financialEntityId);
        return this._assembleSingleEntity(feRows);
    }
}
