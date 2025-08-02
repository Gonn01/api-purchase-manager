export interface ILog {
    id: number;
    content: string;
    created_at: Date;
}

export class Log {
    id: number;
    content: string;
    created_at: Date;

    constructor({ id, content, created_at }: ILog) {
        this.id = id;
        this.content = content;
        this.created_at = created_at;
    }
}

// ------------------ PurchaseLog ------------------
export interface IPurchaseLog extends ILog {
    purchase_id: number;
}

export class PurchaseLog extends Log {
    purchase_id: number;

    constructor({ id, content, created_at, purchase_id }: IPurchaseLog) {
        super({ id, content, created_at });
        this.purchase_id = purchase_id;
    }

    static fromJson(json: any): PurchaseLog {
        return new PurchaseLog({
            id: Number(json.id),
            content: json.content,
            created_at: new Date(json.created_at),
            purchase_id: Number(json.purchase_id),
        });
    }
}

// ------------------ FinancialEntityLog ------------------
export interface IFinancialEntityLog extends ILog {
    financial_entity_id: number;
}

export class FinancialEntityLog extends Log {
    financial_entity_id: number;

    constructor({ id, content, created_at, financial_entity_id }: IFinancialEntityLog) {
        super({ id, content, created_at });
        this.financial_entity_id = financial_entity_id;
    }

    static fromJson(json: any): FinancialEntityLog {
        return new FinancialEntityLog({
            id: Number(json.id),
            content: json.content,
            created_at: new Date(json.createdAt),
            financial_entity_id: Number(json.financialEntityId),
        });
    }
}
