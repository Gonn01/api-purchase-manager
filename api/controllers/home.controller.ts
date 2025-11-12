import { NextFunction, Request, Response } from "express";
import { HomeService } from "../services/home.service";
import { PurchaseUpdateSchema } from "../dtos/purchase/purchase-update.dto";
import { FinancialEntityCreateSchema } from "../dtos/financial-entity/financial-entity-create.dto";
import { PurchaseCreateSchema } from "../dtos/purchase/purchase-create.dto";
import { zodToCustomException } from "../middlewares/error";
import { Status } from "../models/Status";
import { logBlue, logGreen, logRed } from "../lib/logs";

const service = new HomeService();

export async function getHome(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = res.locals.userId;
        const data = await service.getHome(userId);
        res.status(200).json({ body: data, message: "Datos de home obtenidos correctamente." });
    } catch (err: any) {
        next(err);
    }
}

export async function createFinancialEntity(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = res.locals.userId;
        const input = FinancialEntityCreateSchema.parse(req.body);
        const fe = await service.createFinancialEntity(userId, input);
        res.status(201).json({ body: fe, message: "Financial entity creada." });
    } catch (err: any) {
        next(err);
    }
}

export async function createPurchase(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = res.locals.userId;
        logBlue(JSON.stringify(req.body));
        // Usar safeParse para no tirar excepción directa de Zod
        const parsed = PurchaseCreateSchema.safeParse(req.body);
        if (!parsed.success) {
            throw zodToCustomException(parsed.error, {
                title: "Datos inválidos",
                status: Status.badRequest,
            });
        }

        const fe = await service.createPurchase(userId, parsed.data);
        logGreen(`[HomeController] Purchase creada: ${JSON.stringify(fe)}`);
        res.status(201).json({ body: fe, message: "Purchase creada." });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        logRed(`[HomeController] Error creando purchase: ${errorMessage}`);
        next(err);
    }
}

export async function updatePurchase(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = res.locals.userId;
        const id = Number(req.params.id);
        const patch = PurchaseUpdateSchema.parse(req.body);
        const fe = await service.updatePurchase(userId, id, patch);
        res.json({ body: fe, message: "Purchase actualizada." });
    } catch (err: any) {
        next(err);
    }
}

export async function deletePurchase(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = res.locals.userId;
        const id = Number(req.params.id);
        const fe = await service.deletePurchase(userId, id);
        res.json({ body: fe, message: "Purchase eliminada." });
    } catch (err: any) {
        next(err);
    }
}

export async function toggleIgnorePurchase(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = res.locals.userId;
        const purchaseId = Number(req.params.id);
        const result = await service.toggleIgnorePurchase(userId, purchaseId);
        // solo ids + estado actual
        res.json({ body: result, message: "Purchase ignore alternado." });
    } catch (err: any) {
        next(err);
    }
}

export async function payQuotaController(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = res.locals.userId;
        const purchaseId = Number(req.params.id);
        const fe = await service.payQuota(userId, purchaseId);
        res.json({ body: fe, message: "Cuota pagada." });
    } catch (err: any) {
        next(err);
    }
}

export async function unpayQuotaController(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = res.locals.userId;
        const purchaseId = Number(req.params.id);
        const fe = await service.unpayQuota(userId, purchaseId);
        res.json({ body: fe, message: "Cuota desmarcada." });
    } catch (err: any) {
        next(err);
    }
}
export async function payCurrentController(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = res.locals.userId;
        const purchaseIds = Array.isArray(req.body?.purchaseIds) ? req.body.purchaseIds.map(Number) : [];
        const fe = await service.payCurrent(userId, purchaseIds);
        res.json({ body: fe, message: "Pagada 1 cuota de compras current." });
    } catch (err: any) {
        next(err);
    }
}
