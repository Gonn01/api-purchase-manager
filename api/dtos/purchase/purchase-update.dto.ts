import { z } from "zod";

export const PurchaseUpdateSchema = z.object({
    name: z.string().trim().min(1).optional(),
    amount: z.number().nonnegative().optional(),
    currencyType: z.number().int().optional(),
    type: z.number().int().optional(),
    amountPerQuota: z.number().nonnegative().nullable().optional(),
    numberOfQuotas: z.number().int().positive().nullable().optional(),
    firstQuotaDate: z.string().datetime().nullable().optional(),
    fixedExpense: z.boolean().optional(),
    image: z.string().url().nullable().optional(),
    ignored: z.boolean().optional(),
});

export type PurchaseUpdateDTO = z.infer<typeof PurchaseUpdateSchema>;
