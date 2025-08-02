import { PurchaseHomeDto } from "./PurchaseHomeDto";

export interface FinancialEntityHomeDto {
  id: number;
  name: string;
  current_purchases: PurchaseHomeDto[];
  settled_purchases: PurchaseHomeDto[];
}
