import { currency_type, CurrencyType } from "./CurrencyType";
import { PurchaseLog } from "./Logs";

export enum PurchaseTypeEnum {
    CurrentDebtorPurchase = 0,
    CurrentCreditorPurchase = 1,
    SettledDebtorPurchase = 2,
    SettledCreditorPurchase = 3,
}

export const PurchaseType = {
    type(value: number): PurchaseTypeEnum {
        switch (value) {
            case 0: return PurchaseTypeEnum.CurrentDebtorPurchase;
            case 1: return PurchaseTypeEnum.CurrentCreditorPurchase;
            case 2: return PurchaseTypeEnum.SettledDebtorPurchase;
            case 3: return PurchaseTypeEnum.SettledCreditorPurchase;
            default: throw new Error("Invalid purchase type");
        }
    },
    getValue(purchaseType: PurchaseTypeEnum): number {
        return purchaseType;
    },
};

// ------------------ Purchase Model ------------------
export interface IPurchase {
    id: number;
    created_at: Date;
    finalization_date?: Date | null;
    first_quota_date?: Date | null;
    ignored: boolean;
    image?: string;
    amount: number;
    amount_per_quota: number;
    number_of_quotas: number;
    payed_quotas: number;
    currency_type: CurrencyType;
    name: string;
    type: PurchaseTypeEnum;
    fixed_expense: boolean;
    logs?: PurchaseLog[];
}

export class Purchase {
    id: number;
    created_at: Date;
    finalization_date?: Date | null;
    first_quota_date?: Date | null;
    ignored: boolean;
    image?: string;
    amount: number;
    amount_per_quota: number;
    number_of_quotas: number;
    payed_quotas: number;
    currency_type: CurrencyType;
    name: string;
    type: PurchaseTypeEnum;
    fixed_expense: boolean;
    logs: PurchaseLog[];

    constructor({
        id,
        created_at,
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
        fixed_expense,
        logs = [],
    }: IPurchase) {
        this.id = id;
        this.created_at = created_at;
        this.finalization_date = finalization_date ?? null;
        this.first_quota_date = first_quota_date ?? null;
        this.ignored = ignored;
        this.image = image;
        this.amount = amount;
        this.amount_per_quota = amount_per_quota;
        this.number_of_quotas = number_of_quotas;
        this.payed_quotas = payed_quotas;
        this.currency_type = currency_type;
        this.name = name;
        this.type = type;
        this.fixed_expense = fixed_expense;
        this.logs = logs;
    }

    static fromJson(json: any): Purchase {
        return new Purchase({
            id: Number(json.id),
            created_at: new Date(json.created_at),
            finalization_date: json.finalization_date ? new Date(json.finalization_date) : null,
            first_quota_date: json.first_quota_date ? new Date(json.first_quota_date) : null,
            ignored: Boolean(json.ignored),
            image: json.image,
            amount: parseFloat(json.amount),
            amount_per_quota: parseFloat(json.amount_per_quota),
            number_of_quotas: Number(json.number_of_quotas),
            payed_quotas: Number(json.payed_quotas),
            currency_type: currency_type.type(Number(json.currency_type)),
            name: json.name,
            type: PurchaseType.type(Number(json.type)),
            fixed_expense: Boolean(json.fixed_expense),
            logs: json.logs ? json.logs.map((e: any) => PurchaseLog.fromJson(e)) : [],
        });
    }

    copyWith(update: Partial<IPurchase>): Purchase {
        return new Purchase({
            ...this,
            ...update,
        });
    }
}
