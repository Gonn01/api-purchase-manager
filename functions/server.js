import express from "express";
import cors from "cors";
import serverless from "serverless-http";
import { logBlue, logPurple, logRed } from "./funciones/logsCustom.js";
import { performance } from "perf_hooks";
import { verifyParamaters } from "./funciones/verifyParameters.js";
import { createFinancialEntity } from "../functions/controllers/financial_entities/create_financial_entity.js";
import { getFinancialEntities } from "../functions/controllers/financial_entities/get_financial_entities.js";
import { editFinancialEntity } from "../functions/controllers/financial_entities/edit_financial_entity.js";
import { deleteFinancialEntity } from "../functions/controllers/financial_entities/delete_financial_entity.js";
import { createUser } from "./controllers/users/create_user.js";
import { getUsers } from "./controllers/users/get_users.js";
import { editUser } from "./controllers/users/edit_user.js";
import { deleteUser } from "./controllers/users/delete_user.js";
import { createPurchase } from "./controllers/purchases/create_purchase.js";
import { getPurchasesByUserId } from "./controllers/purchases/get_purchases_by_user_id.js";
import { getPurchasesByFinancialEntityId } from "./controllers/purchases/get_purchases_by_financial_entity_id.js";
import { editPurchase } from "./controllers/purchases/edit_purchase.js";
import { deletePurchase } from "./controllers/purchases/delete_purchase.js";


var app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hello World!");
});
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
router.post("/financial-entities/", async (req, res) => {
  const startTime = performance.now();

  const errorMessage = verifyParamaters(req.body, ["name", "userId"]);

  if (errorMessage) {
    return res.status(400).json({ message: errorMessage });
  }

  const { name, userId } = req.body;

  try {
    const result = await createFinancialEntity(name, userId);

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

router.get("/financial-entities/", async (req, res) => {
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

router.put("/financial-entities/:financialEntityId", async (req, res) => {
  const startTime = performance.now();

  const errorMessage = verifyParamaters(req.params, ["financialEntityId"]);
  if (errorMessage) {
    return res.status(400).json({ message: errorMessage });
  }

  const errorMessage2 = verifyParamaters(req.body, ["newName"]);
  if (errorMessage2) {
    return res.status(400).json({ message: errorMessage2 });
  }

  const  {financialEntityId}  = req.params;
  
  const { newName } = req.body;

  try {
    const result = await editFinancialEntity(newName, financialEntityId);

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

router.delete("/:financialEntityId", async (req, res) => {
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
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
router.post("/users/", async (req, res) => {
  const startTime = performance.now();

  const errorMessage = verifyParamaters(req.body, ["name", "email"]);

  if (errorMessage) {
    return res.status(400).json({ message: errorMessage });
  }

  const { name,  email } = req.body;

  try {
    const result = await createUser(name, email);

    res.status(200).json({
      body: result,
      message: "Usuario creado correctamente",
    });
  } catch (error) {
    logRed(`Error en POST usuarios: ${error.stack}`);
    res.status(500).json({ message: error.stack });
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

router.get("/users/", async (req, res) => {
  const startTime = performance.now();

  try {
    const result = await getUsers();

    res.status(200).json({
      body: result,
      message: "Usuarios obtenidos correctamente",
    });
  } catch (error) {
    logRed(`Error en GET users: ${error.stack}`);
    res.status(500).json({ message: error.stack });
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

router.put("/users/:userId", async (req, res) => {
  const startTime = performance.now();
  const errorMessage = verifyParamaters(req.params, ["userId"]);

  if (errorMessage) {
    return res.status(400).json({ message: errorMessage });
  }
  const errorMessage2 = verifyParamaters(req.body, ["newName"]);
  
  if (errorMessage2) {
    return res.status(400).json({ message: errorMessage2 });
  }

  const  {userId} = req.params;

  const { newName } = req.body;

  try {
    const result = await editUser(newName, userId);

    res.status(200).json({
      body: result,
      message: "Usuario editado correctamente",
    });
  } catch (error) {
    logRed(`Error en PUT users: ${error.stack}`);
    res.status(500).json({ message: error.stack });
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

router.delete("/users/:userId", async (req, res) => {
  const startTime = performance.now();

  const errorMessage = verifyParamaters(req.params, ["userId"]);

  if (errorMessage) {
    return res.status(400).json({ message: errorMessage });
  }

  const { userId } = req.params;

  try {
    const result = await deleteUser(userId);

    res.status(200).json({
      body: result,
      message: "Usuario eliminado correctamente",
    });
  } catch (error) {
    logRed(`Error en DELETE users: ${error.stack}`);
    res.status(500).json({ message: error.stack });
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

router.post("/purchases/", async (req, res) => {
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

router.get("/purchases/:userId", async (req, res) => {
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

router.get("/purchases/:financialEntityId", async (req, res) => {
  const startTime = performance.now();

  const errorMessage = verifyParamaters(req.params, ["financialEntityId"]);

  if (errorMessage) {
    return res.status(400).json({ message: errorMessage });
  }

  const errorMessage2 = verifyParamaters(req.params, ["financialEntityId"]);

  if (errorMessage2) {
    return res.status(400).json({ message: errorMessage2 });
  }

  try {
    const result = await getPurchasesByFinancialEntityId(financialEntityId);

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

router.put("/purchases/:purchaseId", async (req, res) => {
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

router.delete("/purchases/:purchaseId", async (req, res) => {
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

if (process.env.NETLIFY !== "true") {
  app.use("/.netlify/functions/server", router);
  app.listen(port, () => {
    logBlue(`Servidor corriendo en http://localhost:${port}`);
  });
} else {
  app.use('/.netlify/functions/server', router);
}

export const handler = serverless(app);
