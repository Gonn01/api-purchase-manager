import { Purchase } from "./purchase";
import { FinancialEntityLog } from "./logs";

export interface IFinancialEntity {
  id: number;
  created_at: Date;
  name: string;
  purchases?: Purchase[];
  logs?: FinancialEntityLog[];
}

export class FinancialEntity {
  id: number;
  created_at: Date;
  name: string;
  purchases: Purchase[];
  logs: FinancialEntityLog[];

  constructor({ id, created_at, name, purchases = [], logs = [] }: IFinancialEntity) {
    this.id = id;
    this.created_at = created_at;
    this.name = name;
    this.purchases = purchases;
    this.logs = logs;
  }

  static fromJson(json: any): FinancialEntity {
    return new FinancialEntity({
      id: parseInt(json.id),
      created_at: new Date(json.created_at),
      name: json.name,
      purchases: json.purchases ? json.purchases.map((e: any) => Purchase.fromJson(e)) : [],
      logs: json.logs ? json.logs.map((e: any) => FinancialEntityLog.fromJson(e)) : [],
    });
  }

  copyWith({ id, created_at, name, purchases, logs }: Partial<IFinancialEntity>): FinancialEntity {
    return new FinancialEntity({
      id: id !== undefined ? id : this.id,
      created_at: created_at !== undefined ? created_at : this.created_at,
      name: name !== undefined ? name : this.name,
      purchases: purchases !== undefined ? purchases : this.purchases,
      logs: logs !== undefined ? logs : this.logs,
    });
  }
}
