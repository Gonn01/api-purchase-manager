import { Request, Response } from "express";
import { FinancialEntityListService } from "../services/financial-entity-list.service";

const service = new FinancialEntityListService();

export async function listFinancialEntities(req: Request, res: Response) {
    try {
        const userId = res.locals.userId;
        const data = await service.list(userId);
        // mantengo shape { body, message } como venías usando
        res.json({ body: data, message: "Financial entities obtenidas correctamente." });
    } catch (err: any) {
        res.status(err.status || 500).json({
            error: { message: err.message || "Internal Error", code: err.code || "ERROR", details: err.details || [] }
        });
    }
}

export async function deleteFinancialEntity(req: Request, res: Response) {
    try {
        const userId = res.locals.userId;
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) return res.status(400).json({ error: { message: "id inválido", code: "BAD_REQUEST" } });

        await service.remove(userId, id);
        res.json({ body: { ok: true }, message: "Financial entity eliminada." });
    } catch (err: any) {
        res.status(err.status || 500).json({
            error: { message: err.message || "Internal Error", code: err.code || "ERROR", details: err.details || [] }
        });
    }
}
