export type PurchaseSummaryDto = {
    id: number;
    name: string;
};

export type FinancialEntityLogDto = {
    id: number;
    content: string;
    created_at: string; // ISO
};

export type FinancialEntityDetailsDto = {
    purchases: PurchaseSummaryDto[];
    logs: FinancialEntityLogDto[];
};
