import { PurchaseDto } from "../dtos/purchases/PurchaseDto";

export const PurchaseMapper = {
  toDto(row: any): PurchaseDto {
    return {
      id: Number(row.id),
      ignored: Boolean(row.ignored),
      created_at: new Date(row.created_at).toISOString(),
      name: row.name,
      amount: parseFloat(row.amount),
      number_of_quotas: Number(row.number_of_quotas),
      payed_quotas: Number(row.payed_quotas),
      currency_type: Number(row.currency_type),
      type: Number(row.type),
      fixed_expense: Boolean(row.fixed_expense),
      image: row.image,
    };
  },
};
