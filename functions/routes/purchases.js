import { Router } from "express";
import { performance } from "perf_hooks";
import { verifyParamaters } from "../funciones/verifyParameters.js";
import { logPurple, logRed } from "../funciones/logsCustom.js";
import { createPurchase } from "../controllers/purchases/create_purchase.js";
import { deletePurchase } from "../controllers/purchases/delete_purchase.js";
import { editPurchase } from "../controllers/purchases/edit_purchase.js";
import {  getPurchasesByUserId } from "../controllers/purchases/get_purchases_by_user_id.js";
import {  getPurchasesByFinancialEntityId } from "../controllers/purchases/get_purchases_by_financial_entity_id.js";

const purchasesRouter = Router();

purchasesRouter.post("/create", async (req, res) => {
  const startTime = performance.now();

  const errorMessage = verifyParamaters(req.body, ["name", "userId"]);

  if (errorMessage) {
    return res.status(400).json({ message: errorMessage });
  }

  const { name, userId } = req.body;

  try {
    const result = await createPurchase(name, userId);

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

purchasesRouter.get("/", async (req, res) => {
  const startTime = performance.now();

  const errorMessage = verifyParamaters(req.body, ["userId"]);

  if (errorMessage) {
    return res.status(400).json({ message: errorMessage });
  }

  const { userId } = req.body;

  try {
    const result = await getPurchasesByUserId(userId);

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

purchasesRouter.put("/:purchaseId", async (req, res) => {
  const startTime = performance.now();

  const errorMessage = verifyParamaters(req.params, ["purchaseId"]);

  if (errorMessage) {
    return res.status(400).json({ message: errorMessage });
  }

  const {  purchaseId } = req.params;

  const { newName } = req.body;

  try {
    const result = await editPurchase(newName, purchaseId);

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

purchasesRouter.delete("/:purchaseId", async (req, res) => {
  const startTime = performance.now();

  const errorMessage = verifyParamaters(req.params, ["purchaseId"]);

  if (errorMessage) {
    return res.status(400).json({ message: errorMessage });
  }

  const { purchaseId } = req.params;

  try {
    const result = await deletePurchase(purchaseId);

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

export default purchasesRouter;
