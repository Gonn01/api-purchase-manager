class Log {
    constructor({ id, content, created_at }) {
        this.id = id;
        this.content = content;
        this.created_at = created_at;
    }
}

export class PurchaseLog extends Log {
    constructor({ id, content, created_at, purchase_id }) {
        super({ id, content, created_at });
        this.purchase_id = purchase_id;
    }

    static fromJson(json) {
        return new PurchaseLog({
            id: json.id,
            content: json.content,
            created_at: new Date(json.createdAt),
            purchase_id: json.purchaseId,
        });
    }
}

export class FinancialEntityLog extends Log {
    constructor({ id, content, created_at, financial_entity_id }) {
        super({ id, content, created_at });
        this.financial_entity_id = financial_entity_id;
    }

    static fromJson(json) {
        return new FinancialEntityLog({
            id: json.id,
            content: json.content,
            created_at: new Date(json.createdAt),
            financial_entity_id: json.financialEntityId,
        });
    }
}