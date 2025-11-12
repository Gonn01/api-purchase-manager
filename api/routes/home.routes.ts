import { Router } from "express";
import {
    createFinancialEntity, createPurchase, deletePurchase, getHome, payQuotaController, toggleIgnorePurchase, unpayQuotaController, updatePurchase, payCurrentController
} from "../controllers/home.controller";
import { verifyToken } from "../middlewares/auth";

const router = Router();

router.use(verifyToken);
router.get("/", getHome);

router.post("/financial-entities", createFinancialEntity);

router.post("/purchases", createPurchase);
router.patch("/purchases/:id", updatePurchase);
router.delete("/purchases/:id", deletePurchase);

router.post("/purchases/:id/toggle-ignore", toggleIgnorePurchase);
router.post("/purchases/:id/pay-quota", payQuotaController);
router.post("/purchases/:id/unpay-quota", unpayQuotaController);
router.post("/purchases/pay-month", payCurrentController);

export default router;
