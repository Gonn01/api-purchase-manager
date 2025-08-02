import { FinancialEntityHomeDto } from "./FinancialEntityHomeDto";

export interface HomeDataDto {
  user_id: number;
  user_created_at: string;
  user_name: string;
  user_email: string;
  financial_entities: FinancialEntityHomeDto[];
}
