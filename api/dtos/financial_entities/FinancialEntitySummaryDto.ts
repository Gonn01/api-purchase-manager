import { FinancialEntityDto } from "./FinancialEntityDto";

// Solo lo básico para listados rápidos
export type FinancialEntitySummaryDto = Pick<FinancialEntityDto, "id" | "name">;
