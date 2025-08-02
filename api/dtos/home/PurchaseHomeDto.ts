export interface PurchaseHomeDto {
  id: number;
  finalization_date: string | null;
  first_quota_date: string | null;
  ignored: boolean;
  image?: string | null;
  amount: number;
  amount_per_quota: number;
  number_of_quotas: number;
  payed_quotas: number;
  currency_type: number;
  name: string;
  type: number;
  fixed_expense: boolean;
}
