import { Router, Request, Response } from "express";
import { verificarTodo } from "../functions/verifyParameters";
import { createUser } from "../controllers/users/createUser";
import { handleError } from "../functions/errorHandler";
import { logPurple } from "../functions/logsCustom";
import { getUsers } from "../controllers/users/getUsers";
import { editUser } from "../controllers/users/editUser";
import { deleteUser } from "../controllers/users/deleteUser";

const router = Router();

// POST /api/users
router.post("/", async (req: Request, res: Response) => {
  const startTime = performance.now();
  try {
    // Validación con verificarTodo
    if (!verificarTodo(req, res, [], ["firebaseUserId", "name", "email"])) return;

    const { firebaseUserId, name, email } = req.body;
    const result = await createUser(firebaseUserId, name, email);

    res.status(200).json({
      body: result,
      message: "Usuario creado correctamente.",
    });
  } catch (err) {
    handleError(req, res, err);
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});
// GET /api/users
router.get("/", async (req: Request, res: Response) => {
  const startTime = performance.now();
  try {
    const result = await getUsers();
    res.status(200).json({
      body: result,
      message: "Usuarios obtenidos correctamente.",
    });
  } catch (err) {
    handleError(req, res, err);
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});
// PUT /api/users/:userId
router.put("/:userId", async (req: Request, res: Response) => {
  const startTime = performance.now();
  try {
    // Validación con verificarTodo
    if (!verificarTodo(req, res, ["userId"], ["newName"])) return;

    const { userId } = req.params;
    const { newName } = req.body;

    const result = await editUser(newName, Number(userId));

    res.status(200).json({
      body: result,
      message: "Usuario editado correctamente.",
    });
  } catch (err) {
    handleError(req, res, err);
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});
// DELETE /api/users/:userId
router.delete("/:userId", async (req: Request, res: Response) => {
  const startTime = performance.now();
  try {
    // Validación con verificarTodo
    if (!verificarTodo(req, res, ["userId"])) return;

    const { userId } = req.params;

    await deleteUser(Number(userId));

    res.status(200).json({
      message: "Usuario eliminado correctamente.",
    });
  } catch (err) {
    handleError(req, res, err);
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});
export default router;
