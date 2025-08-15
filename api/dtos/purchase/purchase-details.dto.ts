export type PurchaseLogDto = {
    id: number;
    content: string;
    created_at: string; // ISO
};

export type PurchaseDetailsDto = {
    id: number;
    financial_entity_id: number;
    name: string;
    amount: number;
    amount_per_quota: number | null;
    number_of_quotas: number | null;
    payed_quotas: number | null;
    currency_type: number;
    type: number;
    fixed_expense: boolean;
    first_quota_date: string | null;    // ISO
    finalization_date: string | null;   // ISO
    image: string | null;
    ignored: boolean;
    logs: PurchaseLogDto[];
};
