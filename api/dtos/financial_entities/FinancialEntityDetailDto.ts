import { FinancialEntityLogDto } from "./FinancialEntityLogDto";
import { FinancialEntityPurchaseDto } from "./FinancialEntityPurchaseDto";

export interface FinancialEntityDetailDto {
  id: number;
  name: string;
  purchases: FinancialEntityPurchaseDto[];
  logs: FinancialEntityLogDto[];
}