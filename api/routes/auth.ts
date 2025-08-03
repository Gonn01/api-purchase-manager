import { Router, Request, Response } from "express";
import { verificarTodo } from "../functions/verifyParameters";
import { login } from "../controllers/auth/login";
import { handleError } from "../functions/errorHandler";
import { logPurple } from "../functions/logsCustom";
const router = Router();

// POST /api/users/login
router.post("/login", async (req: Request, res: Response) => {
  const startTime = performance.now();
  try {
    // Validar body obligatorio
    verificarTodo(req, res, [], ["firebaseUserId", "name", "email"])

    const { firebaseUserId, email, name } = req.body;
    const response = await login(firebaseUserId, email, name);

    res.status(200).json(response);
  } catch (err) {
    handleError(req, res, err);
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

export default router;
