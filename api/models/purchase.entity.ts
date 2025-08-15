// NOTA: currency_type y type en tu DB son int8. Dejo number.
// Si tenés el mapping, podés reemplazar por enums (PurchaseType, CurrencyType).

export interface Purchase {
    id: number;
    createdAt: Date;
    finalizationDate: Date | null;
    firstQuotaDate: Date | null;

    ignored: boolean;
    image: string | null;

    amount: number;            // numeric -> Number(row.amount)
    amountPerQuota: number | null;
    numberOfQuotas: number | null;
    payedQuotas: number;       // int8

    currencyType: number;      // enum en DB (si aplica)
    name: string;
    type: number;              // enum en DB (si aplica)

    financialEntityId: number; // FK
    fixedExpense: boolean;
    deleted: boolean;
}

export const PurchaseEntity = {
    table: "purchases",

    fromRow(row: any): Purchase {
        return {
            id: Number(row.id),
            createdAt: new Date(row.created_at),
            finalizationDate: row.finalization_date ? new Date(row.finalization_date) : null,
            firstQuotaDate: row.first_quota_date ? new Date(row.first_quota_date) : null,

            ignored: Boolean(row.ignored),
            image: row.image ?? null,

            amount: Number(row.amount),
            amountPerQuota: row.amount_per_quota != null ? Number(row.amount_per_quota) : null,
            numberOfQuotas: row.number_of_quotas != null ? Number(row.number_of_quotas) : null,
            payedQuotas: Number(row.payed_quotas),

            currencyType: Number(row.currency_type),
            name: String(row.name),
            type: Number(row.type),

            financialEntityId: Number(row.financial_entity_id),
            fixedExpense: Boolean(row.fixed_expense),
            deleted: Boolean(row.deleted),
        };
    },

    toRow(p: Partial<Purchase>) {
        return {
            id: p.id,
            created_at: p.createdAt,
            finalization_date: p.finalizationDate,
            first_quota_date: p.firstQuotaDate,

            ignored: p.ignored,
            image: p.image,

            amount: p.amount,
            amount_per_quota: p.amountPerQuota,
            number_of_quotas: p.numberOfQuotas,
            payed_quotas: p.payedQuotas,

            currency_type: p.currencyType,
            name: p.name,
            type: p.type,

            financial_entity_id: p.financialEntityId,
            fixed_expense: p.fixedExpense,
            deleted: p.deleted,
        };
    },
};
