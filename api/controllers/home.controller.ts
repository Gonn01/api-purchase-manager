import { Request, Response } from "express";
import { HomeService } from "../services/home.service";
import { PurchaseUpdateSchema } from "../dtos/purchase/purchase-update.dto";
import { FinancialEntityCreateSchema } from "../dtos/financial-entity/financial-entity-create.dto";
import { PurchaseCreateSchema } from "../dtos/purchase/purchase-create.dto";

const service = new HomeService();

export async function getHome(req: Request, res: Response) {
    const t0 = performance.now();
    try {
        const userId = res.locals.userId;
        const data = await service.getHome(userId);
        res.status(200).json({ body: data, message: "Datos de home obtenidos correctamente." });
    } catch (err: any) {
        const status = err.status || 500;
        res.status(status).json({ error: { message: err.message || "Internal Error", code: err.code || "ERROR", details: err.details || [] } });
    } finally {
        console.log(`GET /home in ${performance.now() - t0}ms`);
    }
}

export async function createFinancialEntity(req: Request, res: Response) {
    try {
        const userId = res.locals.userId;
        const input = FinancialEntityCreateSchema.parse(req.body);
        const fe = await service.createFinancialEntity(userId, input);
        res.status(201).json({ body: fe, message: "Financial entity creada." });
    } catch (err: any) {
        const status = err.status || (err.name === "ZodError" ? 400 : 500);
        res.status(status).json({ error: { message: err.message, code: err.code || "ERROR", details: err.issues || err.details || [] } });
    }
}

export async function createPurchase(req: Request, res: Response) {
    try {
        const userId = res.locals.userId;
        const input = PurchaseCreateSchema.parse(req.body);
        const fe = await service.createPurchase(userId, input);
        res.status(201).json({ body: fe, message: "Purchase creada." });
    } catch (err: any) {
        const status = err.status || (err.name === "ZodError" ? 400 : 500);
        res.status(status).json({ error: { message: err.message, code: err.code || "ERROR", details: err.issues || err.details || [] } });
    }
}

export async function updatePurchase(req: Request, res: Response) {
    try {
        const userId = res.locals.userId;
        const id = Number(req.params.id);
        const patch = PurchaseUpdateSchema.parse(req.body);
        const fe = await service.updatePurchase(userId, id, patch);
        res.json({ body: fe, message: "Purchase actualizada." });
    } catch (err: any) {
        const status = err.status || (err.name === "ZodError" ? 400 : 500);
        res.status(status).json({ error: { message: err.message, code: err.code || "ERROR", details: err.issues || err.details || [] } });
    }
}

export async function deletePurchase(req: Request, res: Response) {
    try {
        const userId = res.locals.userId;
        const id = Number(req.params.id);
        const fe = await service.deletePurchase(userId, id);
        res.json({ body: fe, message: "Purchase eliminada." });
    } catch (err: any) {
        const status = err.status || 500;
        res.status(status).json({ error: { message: err.message, code: err.code || "ERROR", details: err.details || [] } });
    }
}

export async function toggleIgnorePurchase(req: Request, res: Response) {
    try {
        const userId = res.locals.userId;
        const purchaseId = Number(req.params.id);
        const result = await service.toggleIgnorePurchase(userId, purchaseId);
        // solo ids + estado actual
        res.json({ body: result, message: "Purchase ignore alternado." });
    } catch (err: any) {
        res.status(err.status || 500).json({ error: { message: err.message, code: err.code || "ERROR", details: err.details || [] } });
    }
}

export async function payQuotaController(req: Request, res: Response) {
    try {
        const userId = res.locals.userId;
        const purchaseId = Number(req.params.id);
        const fe = await service.payQuota(userId, purchaseId);
        res.json({ body: fe, message: "Cuota pagada." });
    } catch (err: any) {
        res.status(err.status || 500).json({ error: { message: err.message, code: err.code || "ERROR", details: err.details || [] } });
    }
}

export async function unpayQuotaController(req: Request, res: Response) {
    try {
        const userId = res.locals.userId;
        const purchaseId = Number(req.params.id);
        const fe = await service.unpayQuota(userId, purchaseId);
        res.json({ body: fe, message: "Cuota desmarcada." });
    } catch (err: any) {
        res.status(err.status || 500).json({ error: { message: err.message, code: err.code || "ERROR", details: err.details || [] } });
    }
}
export async function payCurrentController(req: Request, res: Response) {
    try {
        const userId = res.locals.userId;
        const purchaseIds = Array.isArray(req.body?.purchaseIds) ? req.body.purchaseIds.map(Number) : [];
        const fe = await service.payCurrent(userId, purchaseIds);
        res.json({ body: fe, message: "Pagada 1 cuota de compras current." });
    } catch (err: any) {
        res.status(err.status || 500).json({
            error: { message: err.message, code: err.code || "ERROR", details: err.details || [] }
        });
    }
}
