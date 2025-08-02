import { Router, Request, Response } from "express";
import { getHomeData } from "../controllers/home/getHomeData";
import { verificarTodo } from "../functions/verifyParameters";
import { handleError } from "../functions/errorHandler";
import { logPurple } from "../functions/logsCustom";

const router = Router();

// GET /api/home/:userId
router.get("/:userId", async (req: Request, res: Response) => {
  const startTime = performance.now();
  try {
    // Validar parámetros con verificarTodo
    if (!verificarTodo(req, res, ["userId"])) return;

    const { userId } = req.params;
    const result = await getHomeData(Number(userId));

    res.status(200).json({
      body: result,
      message: "Datos de home obtenidos correctamente.",
    });
  } catch (err) {
    handleError(req, res, err);
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

export default router;
