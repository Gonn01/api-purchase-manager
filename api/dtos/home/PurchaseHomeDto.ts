export interface PurchaseHomeDto {
  id: number;
  finalization_date: string | null;
  first_quota_date: string | null;
  ignored: boolean;
  image?: string | null;
  amount: number;
  amount_per_quota: number | null;
  number_of_quotas: number | null;
  payed_quotas: number | null;
  currency_type: number;
  name: string;
  type: number;
  fixed_expense: boolean;
  financial_entity_id: number;
}
