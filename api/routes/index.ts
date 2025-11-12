import { Router } from "express";

// Importar routers de cada módulo
import authRouter from "./auth.routes";
import homeRouter from "./home.routes";
import financialEntitiesRouter from "./financial-entities.routes";
import { errorHandler } from "../middlewares/error";

const router = Router();

// Definir prefijos para cada módulo
router.use("/auth", authRouter);
router.use("/financial-entities", financialEntitiesRouter);
router.use("/home", homeRouter);
// router.use("/users", usersRouter);

router.use(errorHandler);
export default router;
