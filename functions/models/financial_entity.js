import { Purchase } from "./purchase.js";
import { FinancialEntityLog } from "./logs.js";

export class FinancialEntity {
    constructor({ id, created_at, name, purchases = [], logs = [] }) {
        this.id = id;
        this.created_at = created_at;
        this.name = name;
        this.purchases = purchases;
        this.logs = logs;
    }

    static fromJson(json) {
        return new FinancialEntity({
            id: parseInt(json.id),
            created_at: new Date(json.created_at),
            name: json.name,
            purchases: json.purchases ? json.purchases.map(e => Purchase.fromJson(e)) : [],
            logs: json.logs ? json.logs.map(e => FinancialEntityLog.fromJson(e)) : [],
        });
    }

    copyWith({ id, created_at, name, purchases, logs }) {
        return new FinancialEntity({
            id: id !== undefined ? id : this.id,
            created_at: created_at !== undefined ? created_at : this.created_at,
            name: name !== undefined ? name : this.name,
            purchases: purchases !== undefined ? purchases : this.purchases,
            logs: logs !== undefined ? logs : this.logs,
        });
    }
}