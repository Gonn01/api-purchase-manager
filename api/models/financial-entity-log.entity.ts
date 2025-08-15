export interface FinancialEntityLog {
    id: number;
    createdAt: Date;
    financialEntityId: number;
    content: string;
}

export const FinancialEntityLogEntity = {
    table: "financial_entities_logs",

    fromRow(row: any): FinancialEntityLog {
        return {
            id: Number(row.id),
            createdAt: new Date(row.created_at),
            financialEntityId: Number(row.financial_entity_id),
            content: String(row.content),
        };
    },

    toRow(l: Partial<FinancialEntityLog>) {
        return {
            id: l.id,
            created_at: l.createdAt,
            financial_entity_id: l.financialEntityId,
            content: l.content,
        };
    },
};
