import { FinancialEntity } from "../models/FinancialEntity";
import { FinancialEntityDto } from "../dtos/financial_entities/FinancialEntityDto";
import { FinancialEntitySummaryDto } from "../dtos/financial_entities/FinancialEntitySummaryDto";

export const FinancialEntityMapper = {
  toDto(entity: FinancialEntity): FinancialEntityDto {
    return {
      id: entity.id,
      name: entity.name,
      user_id: (entity as any).user_id, // si tu modelo no tiene user_id explícito
      created_at: entity.created_at.toISOString(),
    };
  },

  toSummary(entity: FinancialEntity): FinancialEntitySummaryDto {
    return {
      id: entity.id,
      name: entity.name,
    };
  },
};
