export interface FinancialEntity {
    id: number;
    createdAt: Date;
    name: string;
    userId: number;
    deleted: boolean;
}

export const FinancialEntityEntity = {
    table: "financial_entities",

    fromRow(row: any): FinancialEntity {
        return {
            id: Number(row.id),
            createdAt: new Date(row.created_at),
            name: String(row.name),
            userId: Number(row.user_id),
            deleted: Boolean(row.deleted),
        };
    },

    toRow(e: Partial<FinancialEntity>) {
        return {
            id: e.id,
            created_at: e.createdAt,
            name: e.name,
            user_id: e.userId,
            deleted: e.deleted,
        };
    },
};
