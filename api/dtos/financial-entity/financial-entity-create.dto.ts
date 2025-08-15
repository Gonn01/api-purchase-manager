import { z } from "zod";

export const FinancialEntityCreateSchema = z.object({
    name: z.string().trim().min(1, "name requerido"),
});

export type FinancialEntityCreateDTO = z.infer<typeof FinancialEntityCreateSchema>;
