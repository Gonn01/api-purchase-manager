import { Router, Request, Response } from "express";
import { getPurchasesById } from "../controllers/purchases/get_purchases_by_id";
import { getPurchasesByUserId } from "../controllers/purchases/get_purchases_by_user_id";
import { verificarTodo } from "../functions/verifyParameters";
import { createPurchase } from "../controllers/purchases/create_purchase";
import { createMultiplePurchaseLogs, createPurchaseLog } from "../functions/logs";
import { handleError } from "../functions/errorHandler";
import { logPurple } from "../functions/logsCustom";
import { getPurchasesByFinancialEntityId } from "../controllers/purchases/get_purchases_by_financial_entity_id";
import { payMonth } from "../controllers/purchases/pay_month";
import { payQuota } from "../controllers/purchases/pay_quota";
import { unpayQuota } from "../controllers/purchases/unpay_quota";
import { alternateIgnorePurchase } from "../controllers/purchases/alternate_ignore_purchase";
import { editPurchase } from "../controllers/purchases/edit_purchase";
import { deletePurchase } from "../controllers/purchases/delete_purchase";

const router = Router();

// POST /api/purchases
router.post("/", async (req: Request, res: Response) => {
  const startTime = performance.now();
  try {
    // Validación de campos obligatorios
    if (
      !verificarTodo(req, res, [], [
        "ignored",
        "amount",
        "amountPerQuota",
        "numberOfQuotas",
        "payedQuotas",
        "currencyType",
        "name",
        "purchaseType",
        "financialEntityId",
        "fixedExpense",
      ])
    )
      return;

    const {
      image,
      ignored,
      amount,
      amountPerQuota,
      numberOfQuotas,
      payedQuotas,
      currencyType,
      name,
      purchaseType,
      financialEntityId,
      fixedExpense,
    } = req.body;

    const result = await createPurchase(
      ignored,
      image,
      amount,
      amountPerQuota,
      numberOfQuotas,
      payedQuotas,
      currencyType,
      name,
      purchaseType,
      financialEntityId,
      fixedExpense
    );

    // Registrar log
    await createPurchaseLog(
      result.id,
      `Compra creada: ${name} por ${amount} ${currencyType}`
    );

    res.status(200).json({
      body: result,
      message: "Compra creada correctamente.",
    });
  } catch (err) {
    handleError(req, res, err);
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});
// GET /api/purchases/:purchaseId
router.get("/:purchaseId", async (req: Request, res: Response) => {
  const startTime = performance.now();
  try {
    // Validación con verificarTodo
    if (!verificarTodo(req, res, ["purchaseId"])) return;

    const { purchaseId } = req.params;
    const result = await getPurchasesById(Number(purchaseId));

    res.status(200).json({
      body: result,
      message: "Compra obtenida correctamente.",
    });
  } catch (err) {
    handleError(req, res, err);
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

// GET /api/purchases/user/:userId
router.get("/user/:userId", async (req: Request, res: Response) => {
  const startTime = performance.now();
  try {
    // Validación con verificarTodo
    if (!verificarTodo(req, res, ["userId"])) return;

    const { userId } = req.params;
    const result = await getPurchasesByUserId(Number(userId));

    res.status(200).json({
      body: result,
      message: "Lista de compras del usuario obtenida correctamente.",
    });
  } catch (err) {
    handleError(req, res, err);
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});
// GET /api/purchases/financial-entity/:financialEntityId
router.get("/financial-entity/:financialEntityId", async (req: Request, res: Response) => {
  const startTime = performance.now();
  try {
    // Validar parámetros
    if (!verificarTodo(req, res, ["financialEntityId"])) return;

    const { financialEntityId } = req.params;
    const result = await getPurchasesByFinancialEntityId(Number(financialEntityId));

    res.status(200).json({
      body: result,
      message: "Lista de compras de la entidad financiera obtenida correctamente.",
    });
  } catch (err) {
    handleError(req, res, err);
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

router.put("/pay-month", async (req: Request, res: Response) => {
  const startTime = performance.now();
  try {
    // Validar body
    if (!verificarTodo(req, res, [], ["purchaseIds"])) return;

    const { purchaseIds } = req.body;

    const result = await payMonth(purchaseIds);
    await createMultiplePurchaseLogs(
      purchaseIds,
      "Cuota pagada, desde el 'pagar mes'"
    );

    res.status(200).json({
      body: result,
      message: "Mes pagado correctamente.",
    });
  } catch (err) {
    handleError(req, res, err);
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});
router.put("/:purchaseId/pay-quota", async (req: Request, res: Response) => {
  const startTime = performance.now();
  try {
    // Validación con verificarTodo
    if (!verificarTodo(req, res, ["purchaseId"])) return;

    const { purchaseId } = req.params;

    const result = await payQuota(Number(purchaseId));

    // Registrar log
    await createPurchaseLog(
      Number(purchaseId),
      "Cuota pagada."
    );

    res.status(200).json({
      body: result,
      message: "Cuota pagada correctamente.",
    });
  } catch (err) {
    handleError(req, res, err);
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});
// PUT /api/purchases/:purchaseId/unpay-quota
router.put("/:purchaseId/unpay-quota", async (req: Request, res: Response) => {
  const startTime = performance.now();
  try {
    // Validación con verificarTodo
    if (!verificarTodo(req, res, ["purchaseId"])) return;

    const { purchaseId } = req.params;

    const result = await unpayQuota(Number(purchaseId));

    // Registrar log
    await createPurchaseLog(
      Number(purchaseId),
      "Reversión de cuota realizada."
    );

    res.status(200).json({
      body: result,
      message: "Cuota revertida correctamente.",
    });
  } catch (err) {
    handleError(req, res, err);
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});
// PUT /api/purchases/:purchaseId/ignore
router.put("/:purchaseId/ignore", async (req: Request, res: Response) => {
  const startTime = performance.now();
  try {
    // Validación con verificarTodo
    if (!verificarTodo(req, res, ["purchaseId"])) return;

    const { purchaseId } = req.params;

    const result = await alternateIgnorePurchase(Number(purchaseId));

    // Registrar log
    await createPurchaseLog(
      Number(purchaseId),
      "Estado de ignorado alternado en la compra."
    );

    res.status(200).json({
      body: result,
      message: "Estado de ignorado actualizado correctamente.",
    });
  } catch (err) {
    handleError(req, res, err);
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});
// PUT /api/purchases/:purchaseId
router.put("/:purchaseId", async (req: Request, res: Response) => {
  const startTime = performance.now();
  try {
    // Validación con verificarTodo
    if (
      !verificarTodo(req, res, ["purchaseId"], [
        "ignored",
        "amount",
        "numberOfQuotas",
        "payedQuotas",
        "currencyType",
        "name",
        "purchaseType",
        "financialEntityId",
        "fixedExpense",
      ])
    )
      return;

    const { purchaseId } = req.params;
    const {
      ignored,
      image,
      amount,
      numberOfQuotas,
      payedQuotas,
      currencyType,
      name,
      purchaseType,
      financialEntityId,
      fixedExpense,
    } = req.body;

    const result = await editPurchase(
      Number(purchaseId),
      ignored,
      image,
      amount,
      numberOfQuotas,
      payedQuotas,
      currencyType,
      name,
      purchaseType,
      financialEntityId,
      fixedExpense
    );

    // Registrar log
    await createPurchaseLog(
      Number(purchaseId),
      `Compra editada: nuevo nombre '${name}', monto ${amount}`
    );

    res.status(200).json({
      body: result,
      message: "Compra actualizada correctamente.",
    });
  } catch (err) {
    handleError(req, res, err);
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

router.delete("/:purchaseId", async (req: Request, res: Response) => {
  const startTime = performance.now();
  try {
    // Validación de parámetros
    if (!verificarTodo(req, res, ["purchaseId"])) return;

    const { purchaseId } = req.params;

    const result = await deletePurchase(Number(purchaseId));

    // Registrar log
    await createPurchaseLog(
      Number(purchaseId),
      "Compra eliminada."
    );

    res.status(200).json({
      body: result,
      message: "Compra eliminada correctamente.",
    });
  } catch (err) {
    handleError(req, res, err);
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});


export default router;
