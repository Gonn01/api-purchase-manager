import { Router } from "express";

// Importar routers de cada módulo
import authRouter from "./auth";
import financialEntitiesRouter from "./financialEntities";
import homeRouter from "./home";
import purchasesRouter from "./purchases";
import usersRouter from "./users";

const router = Router();

// Definir prefijos para cada módulo
router.use("/auth", authRouter);
router.use("/financial-entities", financialEntitiesRouter);
router.use("/home", homeRouter);
router.use("/purchases", purchasesRouter);
// router.use("/users", usersRouter);

export default router;
