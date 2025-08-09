import { Router, Request, Response } from "express";
import { verificarTodo } from "../functions/verifyParameters";
import { createPurchase } from "../controllers/purchases/createPurchase";
import { createMultiplePurchaseLogs, createPurchaseLog } from "../functions/logs";
import { handleError } from "../functions/errorHandler";
import { logPurple } from "../functions/logsCustom";
import { verifyToken } from "../functions/verifyToken";
import { payQuota } from "../controllers/purchases/pay_quota";
import { alternateIgnorePurchase } from "../controllers/purchases/alternate_ignore_purchase";
import { deletePurchase } from "../controllers/purchases/delete_purchase";
import { unpayQuota } from "../controllers/purchases/unpay_quota";
import { payMonth } from "../controllers/purchases/pay_month";

const router = Router();

// POST /api/purchases
router.post("/", verifyToken, async (req: Request, res: Response) => {
  const startTime = performance.now();
  try {
    const { userId } = (req as any).user;
    // Validación de campos obligatorios
    if (
      !verificarTodo(req, res, [], [
        "financial_entity_id",
        "type",
        "fixed_expense",
        "ignored",
        "name",
        "amount",
        "currency_type",
        "number_of_quotas",
        "payed_quotas",
        "image",
      ])
    )
      return;

    const {
      image,
      ignored,
      amount,
      number_of_quotas,
      payed_quotas,
      currency_type,
      name,
      type,
      financial_entity_id,
      fixed_expense,
    } = req.body;

    const result = await createPurchase(
      {
        ignored,
        image,
        amount,
        number_of_quotas,
        payed_quotas,
        currency_type,
        name,
        type,
        financial_entity_id,
        fixed_expense
      }, userId
    );

    // Registrar log
    await createPurchaseLog(
      result.id,
      `Compra creada: ${name} por ${amount} ${type}`
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
// // PUT /api/purchases/:purchaseId/ignore
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
// // PUT /api/purchases/:purchaseId
// router.put("/:purchaseId", async (req: Request, res: Response) => {
//   const startTime = performance.now();
//   try {
//     // Validación con verificarTodo
//     if (
//       !verificarTodo(req, res, ["purchaseId"], [
//         "ignored",
//         "amount",
//         "numberOfQuotas",
//         "payedQuotas",
//         "currencyType",
//         "name",
//         "purchaseType",
//         "financialEntityId",
//         "fixedExpense",
//       ])
//     )
//       return;

//     const { purchaseId } = req.params;
//     const {
//       ignored,
//       image,
//       amount,
//       numberOfQuotas,
//       payedQuotas,
//       currencyType,
//       name,
//       purchaseType,
//       financialEntityId,
//       fixedExpense,
//     } = req.body;

//     const result = await editPurchase(
//       Number(purchaseId),
//       ignored,
//       image,
//       amount,
//       numberOfQuotas,
//       payedQuotas,
//       currencyType,
//       name,
//       purchaseType,
//       financialEntityId,
//       fixedExpense
//     );

//     // Registrar log
//     await createPurchaseLog(
//       Number(purchaseId),
//       `Compra editada: nuevo nombre '${name}', monto ${amount}`
//     );

//     res.status(200).json({
//       body: result,
//       message: "Compra actualizada correctamente.",
//     });
//   } catch (err) {
//     handleError(req, res, err);
//   } finally {
//     const endTime = performance.now();
//     logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
//   }
// });

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
