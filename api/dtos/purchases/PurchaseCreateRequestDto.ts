import { PurchaseTypeEnum } from "../../models/PurchaseType";

// Ajustá imports si ya tenés estos DTOs en otro lado
export interface PurchaseCreateRequestDto {
    financial_entity_id: number;
    type: PurchaseTypeEnum; // 0: Debtor, 1: Creditor (ajustar a tu enum real)
    fixed_expense: boolean;
    ignored?: boolean | null;
    name: string;
    amount: number;
    currency_type: number; // ej: CurrencyType enum en tu front
    number_of_quotas?: number | null;
    payed_quotas?: number | null;
    image?: string | null;            // base64 o URL
}
