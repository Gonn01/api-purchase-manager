import { PurchaseLogDto } from "../dtos/purchases/PurchaseLogDto";

export const PurchaseLogMapper = {
  toDto(row: any): PurchaseLogDto {
    return {
      id: Number(row.id),
      content: row.content,
      created_at: new Date(row.created_at).toISOString(),
    };
  },
};
