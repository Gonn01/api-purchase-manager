import { Request, Response } from "express";
import { LoginInputSchema } from "../dtos/auth/login-input.dto";
import { AuthService } from "../services/auth.service";
import { logPurple } from "../lib/logs";

const service = new AuthService();

export async function loginController(req: Request, res: Response) {
    const start = performance.now();
    try {
        const input = LoginInputSchema.parse(req.body);

        const result = await service.login(input);
        res.status(200).json(result);
    } catch (err: any) {
        const status = err.status || (err.name === "ZodError" ? 400 : 500);
        const details = err.name === "ZodError" ? err.issues?.map((i: any) => i.message) : err.details;
        res.status(status).json({
            error: {
                message: err.message || "Internal Error",
                code: err.code || (status === 400 ? "VALIDATION_ERROR" : "INTERNAL_ERROR"),
                details: details || [],
            },
        });
    } finally {
        logPurple(`Tiempo de ejecución: ${performance.now() - start} ms`);
    }
}
