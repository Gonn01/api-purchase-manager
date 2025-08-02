import { PurchaseHomeDto } from "./PurchaseHomeDto";

export interface FinancialEntityHomeDto {
  id: number;
  created_at: string;
  name: string;
  purchases: PurchaseHomeDto[];
}
