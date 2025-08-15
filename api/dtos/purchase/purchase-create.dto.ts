import { z } from "zod";

export const PurchaseCreateSchema = z.object({
    financialEntityId: z.number().int().positive(),
    name: z.string().trim().min(1),
    amount: z.number().nonnegative(),
    currencyType: z.number().int(),
    type: z.number().int(), // validamos enum en service
    amountPerQuota: z.number().nonnegative().nullable().optional(),
    numberOfQuotas: z.number().int().positive().nullable().optional(),
    firstQuotaDate: z.string().datetime().nullable().optional(),
    fixedExpense: z.boolean().optional().default(false),
    image: z.string().url().nullable().optional(),
    ignored: z.boolean().optional().default(false),
});

export type PurchaseCreateDTO = z.infer<typeof PurchaseCreateSchema>;
