import { Request, Response } from "express";
import { FinancialEntityDetailsService } from "../services/financial-entity-details.service";

const service = new FinancialEntityDetailsService();

export async function getFinancialEntityDetails(req: Request, res: Response) {
    try {
        const userId = res.locals.userId;
        const feId = Number(req.params.financialEntityId);
        if (!Number.isFinite(feId)) {
            return res.status(400).json({ error: { message: "financialEntityId inválido", code: "BAD_REQUEST" } });
        }

        const data = await service.getDetails(userId, feId);
        res.json({ body: data, message: "Detalles obtenidos correctamente." });
    } catch (err: any) {
        res.status(err.status || 500).json({
            error: { message: err.message || "Internal Error", code: err.code || "ERROR", details: err.details || [] }
        });
    }
}
