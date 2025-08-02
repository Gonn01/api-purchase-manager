export interface PurchaseDto {
  id: number;
  ignored: boolean;
  name: string;
  amount: number;
  number_of_quotas: number;
  payed_quotas: number;
  currency_type: number;
  type: number;
  fixed_expense: boolean;
  image: string | null;
}
