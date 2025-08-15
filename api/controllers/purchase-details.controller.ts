import { Request, Response } from "express";
import { PurchaseDetailsService } from "../services/purchase-details.service";

const service = new PurchaseDetailsService();

export async function getPurchaseDetails(req: Request, res: Response) {
    try {
        const userId = res.locals.userId;
        const financialEntityId = Number(req.params.financialEntityId);
        const purchaseId = Number(req.params.purchaseId);
        if (!Number.isFinite(financialEntityId) || !Number.isFinite(purchaseId)) {
            return res.status(400).json({ error: { message: "Parámetros inválidos", code: "BAD_REQUEST" } });
        }

        const data = await service.getDetails(userId, financialEntityId, purchaseId);
        res.json({ body: data, message: "Purchase details obtenidos correctamente." });
    } catch (err: any) {
        res.status(err.status || 500).json({
            error: { message: err.message || "Internal Error", code: err.code || "ERROR", details: err.details || [] }
        });
    }
}
