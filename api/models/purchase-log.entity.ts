export interface PurchaseLog {
    id: number;
    createdAt: Date;
    purchaseId: number;
    content: string;
}

export const PurchaseLogEntity = {
    table: "purchases_logs",

    fromRow(row: any): PurchaseLog {
        return {
            id: Number(row.id),
            createdAt: new Date(row.created_at),
            purchaseId: Number(row.purchase_id),
            content: String(row.content),
        };
    },

    toRow(l: Partial<PurchaseLog>) {
        return {
            id: l.id,
            created_at: l.createdAt,
            purchase_id: l.purchaseId,
            content: l.content,
        };
    },
};
