import { Router } from "express";
import { deleteFinancialEntity, listFinancialEntities } from "../controllers/financial-entity-list.controller";
import { getFinancialEntityDetails } from "../controllers/financial-entity-details.controller";
import { getPurchaseDetails } from "../controllers/purchase-details.controller";
import { verifyToken } from "../middlewares/auth";

const router = Router();

router.use(verifyToken);
router.get("/", listFinancialEntities);
router.delete("/:id", deleteFinancialEntity);
router.get("/:financialEntityId/details", getFinancialEntityDetails);
router.get("/:financialEntityId/purchases/:purchaseId/details", getPurchaseDetails);

export default router;