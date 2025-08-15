import { z } from "zod";

export const LoginInputSchema = z.object({
    firebaseUserId: z.string().min(1),
    email: z.string().email(),
    name: z.string().min(1),
});

export type LoginInputDTO = z.infer<typeof LoginInputSchema>;
