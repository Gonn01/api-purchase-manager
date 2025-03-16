import { Router } from "express";
import { performance } from "perf_hooks";
import { verifyParamaters } from "../functions/verifyParameters.js";
import { logPurple, logRed } from "../functions/logsCustom.js";
import { createFinancialEntity } from "../controllers/financial_entities/create_financial_entity.js";
import { getFinancialEntities } from "../controllers/financial_entities/get_financial_entities.js";
import { editFinancialEntities } from "../controllers/financial_entities/edit_financial_entity.js";
import { deleteFinancialEntity } from "../controllers/financial_entities/delete_financial_entity.js";

const financialEntitiesRouter = Router();

financialEntitiesRouter.post("/create", async (req, res) => {
  const startTime = performance.now();

  const errorMessage = verifyParamaters(req.body, ["name", "userId"]);

  if (errorMessage) {
    return res.status(400).json({ message: errorMessage });
  }

  const { name, userId } = req.body;

  try {
    const result = await creatpu(name, userId);

    res.status(200).json({
      body: result,
      message: "Entidad financiera creada correctamente.",
    });
  } catch (error) {
    logRed(`Error en POST financial-entities: ${error.stack}`);
    res.status(500).json({ message: error.stack });
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

financialEntitiesRouter.get("/", async (req, res) => {
  const startTime = performance.now();

  const errorMessage = verifyParamaters(req.body, ["userId"]);

  if (errorMessage) {
    return res.status(400).json({ message: errorMessage });
  }

  const { userId } = req.body;

  try {
    const result = await getFinancialEntities(userId);

    res.status(200).json({
      body: result,
      message: "Lista de entidades financieras obtenida correctamente",
    });
  } catch (error) {
    logRed(`Error en GET financial-entities: ${error.stack}`);
    res.status(500).json({ message: error.stack });
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

financialEntitiesRouter.put("/:financialEntityId", async (req, res) => {
  const startTime = performance.now();

  const errorMessage = verifyParamaters(req.params, ["financialEntityId"]);

  if (errorMessage) {
    return res.status(400).json({ message: errorMessage });
  }

  const { financialEntityId } = req.params;

  const { newName } = req.body;

  try {
    const result = await editFinancialEntities(newName, financialEntityId);

    res.status(200).json({
      body: result,
      message: "Entidad financiera actualizada correctamente",
    });
  } catch (error) {
    logRed(`Error en PUT financial-entities: ${error.stack}`);
    res.status(500).json({ message: error.stack });
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

financialEntitiesRouter.delete("/:financialEntityId", async (req, res) => {
  const startTime = performance.now();

  const errorMessage = verifyParamaters(req.params, ["financialEntityId"]);

  if (errorMessage) {
    return res.status(400).json({ message: errorMessage });
  }

  const { financialEntityId } = req.params;

  try {
    const result = await deleteFinancialEntity(financialEntityId);

    res.status(200).json({
      body: result,
      message: "Entidad financiera eliminada correctamente",
    });
  } catch (error) {
    logRed(`Error en DELETE financial-entities: ${error.stack}`);
    res.status(500).json({ message: error.stack });
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

export default financialEntitiesRouter;
