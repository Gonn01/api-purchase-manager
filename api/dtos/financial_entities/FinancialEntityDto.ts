import { BaseDto } from "../base/BaseDto";

export interface FinancialEntityDto extends BaseDto {
  name: string;
  user_id: number;
}