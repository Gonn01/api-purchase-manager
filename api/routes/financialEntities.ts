import { Router, Request, Response } from "express";
import { verificarTodo } from "../functions/verifyParameters";
import { createFinancialEntity } from "../controllers/financial_entities/createFinancialEntity";
import { createFinancialEntityLog } from "../functions/logs";
import { logPurple } from "../functions/logsCustom";
import { handleError } from "../functions/errorHandler";
import { deleteFinancialEntity } from "../controllers/financial_entities/deleteFinancialEntity";
import { editFinancialEntity } from "../controllers/financial_entities/editFinancialEntity";
import { getFinancialEntitiesByUser } from "../controllers/financial_entities/getFinancialEntitiesByUser";
import { getFinancialEntityDetail } from "../controllers/financial_entities/getFinancialEntityDetail";
import { verifyToken } from "../functions/verifyToken";
import { FinancialEntityListDto } from "../dtos/financial_entities/FinancialEntityListDto";

const router = Router();

// POST /api/financial-entities
router.post("/", verifyToken, async (req: Request, res: Response) => {
  const startTime = performance.now();
  try {
    verificarTodo(req, res, [], ["name"]);

    const { name } = req.body;
    const { userId } = (req as any).user;

    const result = await createFinancialEntity({ name } as FinancialEntityListDto, userId);

    await createFinancialEntityLog(
      result.id,
      `Entidad financiera creada: ${name} (Usuario: ${userId})`
    );

    res.status(200).json({
      body: result,
      message: "Entidad financiera creada correctamente.",
    });
  } catch (err) {
    handleError(req, res, err);
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

// DELETE /api/financial-entities/:financialEntityId
router.delete("/:financialEntityId", verifyToken, async (req: Request, res: Response) => {
  const startTime = performance.now();
  try {
    // Validación de params
    if (!verificarTodo(req, res, ["financialEntityId"], [])) return;

    const { financialEntityId } = req.params;

    // Eliminar la entidad
    await deleteFinancialEntity(Number(financialEntityId));

    // Crear log de auditoría
    await createFinancialEntityLog(
      Number(financialEntityId),
      "Entidad financiera eliminada."
    );

    res.status(200).json({
      message: "Entidad financiera eliminada correctamente.",
    });
  } catch (err) {
    handleError(req, res, err);
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

// PUT /api/financial-entities/:financialEntityId
router.put("/:financialEntityId", verifyToken, async (req: Request, res: Response) => {
  const startTime = performance.now();
  try {
    // Validar params y body
    if (!verificarTodo(req, res, ["financialEntityId"], ["newName"])) return;

    const { financialEntityId } = req.params;
    const { newName } = req.body;

    // Actualizar entidad
    await editFinancialEntity(newName, Number(financialEntityId));

    // Crear log de auditoría
    await createFinancialEntityLog(
      Number(financialEntityId),
      `Entidad financiera editada: nuevo nombre '${newName}'`
    );

    res.status(200).json({
      message: "Entidad financiera actualizada correctamente.",
    });
  } catch (err) {
    handleError(req, res, err);
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

// GET /api/financial-entities/:userId
router.get("/user/:userId", verifyToken, async (req: Request, res: Response) => {
  const startTime = performance.now();
  try {
    verificarTodo(req, res, ["userId"], []);

    const { userId } = req.params;
    const result = await getFinancialEntitiesByUser(Number(userId));

    res.status(200).json({
      body: result,
      message: "Lista de entidades financieras obtenida correctamente.",
    });
  } catch (err) {
    handleError(req, res, err);
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

// GET /api/financial-entities/:entityId/purchases/logs
router.get("/:entityId/detail", verifyToken, async (req: Request, res: Response) => {
  const startTime = performance.now();
  try {
    // Validación con verificarTodo
    if (!verificarTodo(req, res, ["entityId"])) return;

    const entityId = Number(req.params.entityId);

    const logs = await getFinancialEntityDetail(entityId);

    res.status(200).json({
      message: "Logs obtenidos correctamente.",
      body: logs,
    });
  } catch (err) {
    handleError(req, res, err);
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});
export default router;
