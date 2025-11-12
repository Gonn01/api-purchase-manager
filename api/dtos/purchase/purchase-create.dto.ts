import { z } from "zod";

export const PurchaseCreateSchema = z.object({
    financial_entity_id: z.number().int().positive(),
    name: z.string().trim().min(1),
    amount: z.number().nonnegative(),
    currency_type: z.number().int(),
    type: z.number().int(),
    amount_per_quota: z.number().nonnegative().nullable().optional(),
    number_of_quotas: z.number().int().positive().nullable().optional(),
    first_quota_date: z.string().datetime().nullable().optional(),
    fixed_expense: z.boolean().optional().default(false),
    image: z.string().url().nullable().optional(),
    ignored: z.boolean().optional().default(false),
});

export type PurchaseCreateDTO = z.infer<typeof PurchaseCreateSchema>;
