import express from "express";
import cors from "cors";
import serverless from "serverless-http";
import { logBlue, logPurple, logRed, logYellow } from "./funciones/logsCustom.js";
import { performance } from "perf_hooks";
import { verifyAll } from "./funciones/verifyParameters.js";

// ==============================================
// Controladores y funciones de log para Financial Entities
// ==============================================
import { createFinancialEntity } from "../functions/controllers/financial_entities/create_financial_entity.js";
import { getFinancialEntities } from "../functions/controllers/financial_entities/get_financial_entities.js";
import { editFinancialEntity } from "../functions/controllers/financial_entities/edit_financial_entity.js";
import { deleteFinancialEntity } from "../functions/controllers/financial_entities/delete_financial_entity.js";
import { createFinancialEntityLog } from "../functions/funciones/logs.js";

// ==============================================
// Controladores y funciones de log para Usuarios
// ==============================================
import { createUser } from "./controllers/users/create_user.js";
import { getUsers } from "./controllers/users/get_users.js";
import { editUser } from "./controllers/users/edit_user.js";
import { deleteUser } from "./controllers/users/delete_user.js";
import { login } from "./controllers/users/login.js";

// ==============================================
// Controladores y funciones de log para Compras
// ==============================================
import { createPurchase } from "./controllers/purchases/create_purchase.js";
import { getPurchasesByUserId } from "./controllers/purchases/get_purchases_by_user_id.js";
import { getPurchasesByFinancialEntityId } from "./controllers/purchases/get_purchases_by_financial_entity_id.js";
import { editPurchase } from "./controllers/purchases/edit_purchase.js";
import { deletePurchase } from "./controllers/purchases/delete_purchase.js";
import { payQuota } from "./controllers/purchases/pay_quota.js";
import { unpayQuota } from "./controllers/purchases/unpay_quota.js";
import { payMonth } from "./controllers/purchases/pay_month.js";
import { alternateIgnorePurchase } from "./controllers/purchases/alternate_ignore_purchase.js";
import { createPurchaseLog } from "../functions/funciones/logs.js";

// ==============================================
// Controladores para Home
// ==============================================
import { getHomeData } from "./controllers/home/get_home_data.js";
import { getPurchasesById } from "./controllers/purchases/get_purchases_by_id.js";

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hello World!");
});

// ========================================================
// Rutas para Entidades Financieras con Logs
// ========================================================
router.post("/financial-entities/", async (req, res) => {
  const startTime = performance.now();
  try {
    const missing = verifyAll(req, [], ["name", "userId"]);
    if (missing.length) {
      logRed(`Faltan parámetros: ${missing.join(", ")}`);
      return res.status(400).json({ message: "Faltan parámetros: " + missing.join(", ") });
    }
    const { name, userId } = req.body;
    const result = await createFinancialEntity(name, userId);
    logYellow(JSON.stringify(result));
    await createFinancialEntityLog(
      result.id,
      `Entidad financiera creada: ${name} (Usuario: ${userId})`
    );
    res.status(200).json({
      body: result,
      message: "Entidad financiera creada correctamente."
    });
  } catch (error) {
    logRed(`Error en POST /financial-entities: ${error.stack}`);
    res.status(500).json({ message: error.message });
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

router.get("/financial-entities/:userId", async (req, res) => {
  const startTime = performance.now();
  try {
    const missing = verifyAll(req, ["userId"], []);
    if (missing.length) {
      logRed(`Faltan parámetros: ${missing.join(", ")}`);
      return res.status(400).json({ message: "Faltan parámetros: " + missing.join(", ") });
    }
    const { userId } = req.params;
    const result = await getFinancialEntities(userId);
    res.status(200).json({
      body: result,
      message: "Lista de entidades financieras obtenida correctamente."
    });
  } catch (error) {
    logRed(`Error en GET /financial-entities/${req.params.userId}: ${error.stack}`);
    res.status(500).json({ message: error.message });
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

router.put("/financial-entities/:financialEntityId", async (req, res) => {
  const startTime = performance.now();
  try {
    const missing = verifyAll(req, ["financialEntityId"], ["newName"]);
    if (missing.length) {
      logRed(`Faltan parámetros: ${missing.join(", ")}`);
      return res.status(400).json({ message: "Faltan parámetros: " + missing.join(", ") });
    }
    const { financialEntityId } = req.params;
    const { newName } = req.body;
    await editFinancialEntity(newName, financialEntityId);
    await createFinancialEntityLog(
      financialEntityId,
      `Entidad financiera editada: nuevo nombre '${newName}'`
    );
    res.status(200).json({
      message: "Entidad financiera actualizada correctamente."
    });
  } catch (error) {
    logRed(`Error en PUT /financial-entities/${req.params.financialEntityId}: ${error.stack}`);
    res.status(500).json({ message: error.message });
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

router.delete("/financial-entities/:financialEntityId", async (req, res) => {
  const startTime = performance.now();
  try {
    const missing = verifyAll(req, ["financialEntityId"], []);
    if (missing.length) {
      logRed(`Faltan parámetros: ${missing.join(", ")}`);
      return res.status(400).json({ message: "Faltan parámetros: " + missing.join(", ") });
    }
    const { financialEntityId } = req.params;
    await deleteFinancialEntity(financialEntityId);
    await createFinancialEntityLog(
      financialEntityId,
      "Entidad financiera eliminada."
    );
    res.status(200).json({
      message: "Entidad financiera eliminada correctamente."
    });
  } catch (error) {
    logRed(`Error en DELETE /financial-entities/${req.params.financialEntityId}: ${error.stack}`);
    res.status(500).json({ message: error.message });
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

// ========================================================
// Rutas para Usuarios con Logs
// ========================================================
router.post("/users/", async (req, res) => {
  const startTime = performance.now();
  try {
    const missing = verifyAll(req, [], ["firebaseUserId", "name", "email"]);
    if (missing.length) {
      logRed(`Faltan parámetros: ${missing.join(", ")}`);
      return res.status(400).json({ message: "Faltan parámetros: " + missing.join(", ") });
    }
    const { firebaseUserId, name, email } = req.body;
    const result = await createUser(firebaseUserId, name, email);
    // Puedes agregar aquí la llamada a la función de log de usuarios si la tienes implementada
    res.status(200).json({
      body: result,
      message: "Usuario creado correctamente."
    });
  } catch (error) {
    logRed(`Error en POST /users: ${error.stack}`);
    res.status(500).json({ message: error.message });
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
      message: "Usuarios obtenidos correctamente."
    });
  } catch (error) {
    logRed(`Error en GET /users: ${error.stack}`);
    res.status(500).json({ message: error.message });
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

router.put("/users/:userId", async (req, res) => {
  const startTime = performance.now();
  try {
    const missing = verifyAll(req, ["userId"], ["newName"]);
    if (missing.length) {
      logRed(`Faltan parámetros: ${missing.join(", ")}`);
      return res.status(400).json({ message: "Faltan parámetros: " + missing.join(", ") });
    }
    const { userId } = req.params;
    const { newName } = req.body;
    const result = await editUser(newName, userId);
    res.status(200).json({
      body: result,
      message: "Usuario editado correctamente."
    });
  } catch (error) {
    logRed(`Error en PUT /users/${req.params.userId}: ${error.stack}`);
    res.status(500).json({ message: error.message });
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

router.delete("/users/:userId", async (req, res) => {
  const startTime = performance.now();
  try {
    const missing = verifyAll(req, ["userId"], []);
    if (missing.length) {
      logRed(`Faltan parámetros: ${missing.join(", ")}`);
      return res.status(400).json({ message: "Faltan parámetros: " + missing.join(", ") });
    }
    const { userId } = req.params;
    await deleteUser(userId);
    res.status(200).json({
      message: "Usuario eliminado correctamente."
    });
  } catch (error) {
    logRed(`Error en DELETE /users/${req.params.userId}: ${error.stack}`);
    res.status(500).json({ message: error.message });
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

router.post("/users/login", async (req, res) => {
  const startTime = performance.now();
  try {
    const missing = verifyAll(req, [], ["firebaseUserId", "name", "email"]);
    if (missing.length) {
      logRed(`Faltan parámetros: ${missing.join(", ")}`);
      return res.status(400).json({ message: "Faltan parámetros: " + missing.join(", ") });
    }
    const { firebaseUserId, email, name } = req.body;
    const response = await login(firebaseUserId, email, name);
    res.status(200).json(response);
  } catch (error) {
    logRed(`Error en POST /users/login: ${error.stack}`);
    res.status(500).json({ message: error.message });
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

// ========================================================
// Rutas para Compras con Logs
// ========================================================
// Rutas GET para compras (no entran en conflicto)
router.post("/purchases/", async (req, res) => {
  const startTime = performance.now();
  try {
    const missing = verifyAll(req, [], [
      "ignored", "amount", "amountPerQuota", "numberOfQuotas",
      "payedQuotas", "currencyType", "name", "purchaseType",
      "financialEntityId", "fixedExpense"
    ]);
    if (missing.length) {
      logRed(`Faltan parámetros: ${missing.join(", ")}`);
      return res.status(400).json({ message: "Faltan parámetros: " + missing.join(", ") });
    }
    const { image, ignored, amount, amountPerQuota, numberOfQuotas,
      payedQuotas, currencyType, name, purchaseType, financialEntityId, fixedExpense } = req.body;
    const result = await createPurchase(
      ignored, image, amount, amountPerQuota, numberOfQuotas,
      payedQuotas, currencyType, name, purchaseType, financialEntityId, fixedExpense
    );
    await createPurchaseLog(
      result.id,
      `Compra creada: ${name} por ${amount} ${currencyType}`
    );
    res.status(200).json({
      body: result,
      message: "Compra creada correctamente."
    });
  } catch (error) {
    logRed(`Error en POST /purchases: ${error.stack}`);
    res.status(500).json({ message: error.message });
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});
router.get("/purchases/logs/:entityId", async (req, res) => {
  const startTime = performance.now();
  const entityId = parseInt(req.params.entityId);
  const limit = parseInt(req.query.limit) || 10;

  try {
    if (!entityId || isNaN(entityId)) {
      logRed("Parámetro inválido: entityId");
      return res.status(400).json({ message: "Parámetro inválido: entityId" });
    }

    const logs = await getPurchaseLogsByEntity(entityId, limit);

    res.status(200).json({
      message: "Logs obtenidos correctamente.",
      body: logs
    });

  } catch (error) {
    logRed(`Error en GET /purchases/logs/:entityId: ${error.stack}`);
    res.status(500).json({ message: "Error al obtener los logs." });
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

router.get("/purchases/:purchaseId", async (req, res) => {
  const startTime = performance.now();
  try {
    const missing = verifyAll(req, ["purchaseId"], []);
    if (missing.length) {
      logRed(`Faltan parámetros: ${missing.join(", ")}`);
      return res.status(400).json({ message: "Faltan parámetros: " + missing.join(", ") });
    }
    const { purchaseId } = req.params;
    const result = await getPurchasesById(purchaseId);
    res.status(200).json({
      body: result,
      message: "Compra obtenida correctamente."
    });
  } catch (error) {
    logRed(`Error en GET /purchases//${req.params.purchaseId}: ${error.stack}`);
    res.status(500).json({ message: error.message });
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});


router.get("/purchases/user/:userId", async (req, res) => {
  const startTime = performance.now();
  try {
    const missing = verifyAll(req, ["userId"], []);
    if (missing.length) {
      logRed(`Faltan parámetros: ${missing.join(", ")}`);
      return res.status(400).json({ message: "Faltan parámetros: " + missing.join(", ") });
    }
    const { userId } = req.params;
    const result = await getPurchasesByUserId(userId);
    res.status(200).json({
      body: result,
      message: "Lista de compras del usuario obtenida correctamente."
    });
  } catch (error) {
    logRed(`Error en GET /purchases/user/${req.params.userId}: ${error.stack}`);
    res.status(500).json({ message: error.message });
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

router.get("/purchases/financial-entity/:financialEntityId", async (req, res) => {
  const startTime = performance.now();
  try {
    const missing = verifyAll(req, ["financialEntityId"], []);
    if (missing.length) {
      logRed(`Faltan parámetros: ${missing.join(", ")}`);
      return res.status(400).json({ message: "Faltan parámetros: " + missing.join(", ") });
    }
    const { financialEntityId } = req.params;
    const result = await getPurchasesByFinancialEntityId(financialEntityId);
    res.status(200).json({
      body: result,
      message: "Lista de compras de la entidad financiera obtenida correctamente."
    });
  } catch (error) {
    logRed(`Error en GET /purchases/financial-entity/${req.params.financialEntityId}: ${error.stack}`);
    res.status(500).json({ message: error.message });
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

// *** IMPORTANTE: Declarar rutas estáticas antes de las que usan parámetros ***
// Ruta para "pay-month" (ruta estática, sin :purchaseId)
router.put("/purchases/pay-month", async (req, res) => {
  const startTime = performance.now();
  try {
    const missing = verifyAll(req, [], ["purchaseIds"]);
    if (missing.length) {
      logRed(`Faltan parámetros: ${missing.join(", ")}`);
      return res.status(400).json({ message: "Faltan parámetros: " + missing.join(", ") });
    }
    const { purchaseIds } = req.body;
    const result = await payMonth(purchaseIds);
    for (const id of purchaseIds) {
      await createPurchaseLog(
        id,
        "Cuota pagada, desde el 'pagar mes'"
      );
    }
    res.status(200).json({
      body: result,
      message: "Mes pagado correctamente."
    });
  } catch (error) {
    logRed(`Error en PUT /purchases/pay-month: ${error.stack}`);
    res.status(500).json({ message: error.message });
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

// Luego, las rutas que usan :purchaseId deben definirse a continuación

router.put("/purchases/:purchaseId/pay-quota", async (req, res) => {
  const startTime = performance.now();
  try {
    const missing = verifyAll(req, ["purchaseId"], []);
    if (missing.length) {
      logRed(`Faltan parámetros: ${missing.join(", ")}`);
      return res.status(400).json({ message: "Faltan parámetros: " + missing.join(", ") });
    }
    const { purchaseId } = req.params;
    const result = await payQuota(purchaseId);
    await createPurchaseLog(
      purchaseId,
      "Cuota pagada."
    );
    res.status(200).json({
      body: result,
      message: "Cuota pagada correctamente."
    });
  } catch (error) {
    logRed(`Error en PUT /purchases/${req.params.purchaseId}/pay-quota: ${error.stack}`);
    res.status(500).json({ message: error.message });
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

router.put("/purchases/:purchaseId/unpay-quota", async (req, res) => {
  const startTime = performance.now();
  try {
    const missing = verifyAll(req, ["purchaseId"], []);
    if (missing.length) {
      logRed(`Faltan parámetros: ${missing.join(", ")}`);
      return res.status(400).json({ message: "Faltan parámetros: " + missing.join(", ") });
    }
    const { purchaseId } = req.params;
    const result = await unpayQuota(purchaseId);
    await createPurchaseLog(
      purchaseId,
      "Reversión de cuota realizada."
    );
    res.status(200).json({
      body: result,
      message: "Cuota revertida correctamente."
    });
  } catch (error) {
    logRed(`Error en PUT /purchases/${req.params.purchaseId}/unpay-quota: ${error.stack}`);
    res.status(500).json({ message: error.message });
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

router.put("/purchases/:purchaseId/ignore", async (req, res) => {
  const startTime = performance.now();
  try {
    const missing = verifyAll(req, ["purchaseId"], []);
    if (missing.length) {
      logRed(`Faltan parámetros: ${missing.join(", ")}`);
      return res.status(400).json({ message: "Faltan parámetros: " + missing.join(", ") });
    }
    const { purchaseId } = req.params;
    const result = await alternateIgnorePurchase(purchaseId);
    await createPurchaseLog(
      purchaseId,
      "Estado de ignorado alternado en la compra."
    );
    res.status(200).json({
      body: result,
      message: "Estado de ignorado actualizado correctamente."
    });
  } catch (error) {
    logRed(`Error en PUT /purchases/${req.params.purchaseId}/ignore: ${error.stack}`);
    res.status(500).json({ message: error.message });
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

router.put("/purchases/:purchaseId", async (req, res) => {
  const startTime = performance.now();
  try {
    const missing = verifyAll(req, ["purchaseId"], [
      "ignored", "amount", "numberOfQuotas",
      "payedQuotas", "currencyType", "name", "purchaseType",
      "financialEntityId", "fixedExpense"
    ]);
    if (missing.length) {
      logRed(`Faltan parámetros: ${missing.join(", ")}`);
      return res.status(400).json({ message: "Faltan parámetros: " + missing.join(", ") });
    }
    const { purchaseId } = req.params;
    const { ignored, image, amount, numberOfQuotas,
      payedQuotas, currencyType, name, purchaseType, financialEntityId, fixedExpense } = req.body;
    const result = await editPurchase(
      purchaseId,
      ignored,
      image,
      amount,
      numberOfQuotas,
      payedQuotas,
      currencyType,
      name,
      purchaseType,
      financialEntityId,
      fixedExpense
    );
    await createPurchaseLog(
      purchaseId,
      `Compra editada: nuevo nombre '${name}', monto ${amount}`
    );
    res.status(200).json({
      body: result,
      message: "Compra actualizada correctamente."
    });
  } catch (error) {
    logRed(`Error en PUT /purchases/${req.params.purchaseId}: ${error.stack}`);
    res.status(500).json({ message: error.message });
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

router.delete("/purchases/:purchaseId", async (req, res) => {
  const startTime = performance.now();
  try {
    const missing = verifyAll(req, ["purchaseId"], []);
    if (missing.length) {
      logRed(`Faltan parámetros: ${missing.join(", ")}`);
      return res.status(400).json({ message: "Faltan parámetros: " + missing.join(", ") });
    }
    const { purchaseId } = req.params;
    const result = await deletePurchase(purchaseId);
    await createPurchaseLog(
      purchaseId,
      "Compra eliminada."
    );
    res.status(200).json({
      body: result,
      message: "Compra eliminada correctamente."
    });
  } catch (error) {
    logRed(`Error en DELETE /purchases/${req.params.purchaseId}: ${error.stack}`);
    res.status(500).json({ message: error.message });
  } finally {
    const endTime = performance.now();
    logPurple(`Tiempo de ejecución: ${endTime - startTime} ms`);
  }
});

// ========================================================
// Ruta para Home con Logs
// ========================================================
router.get("/home/:userId", async (req, res) => {
  const startTime = performance.now();
  try {
    const missing = verifyAll(req, ["userId"], []);
    if (missing.length) {
      logRed(`Faltan parámetros: ${missing.join(", ")}`);
      return res.status(400).json({ message: "Faltan parámetros: " + missing.join(", ") });
    }
    const { userId } = req.params;
    const result = await getHomeData(userId);
    res.status(200).json({
      body: result,
      message: "Datos de home obtenidos correctamente."
    });
  } catch (error) {
    logRed(`Error en GET /home/${req.params.userId}: ${error.stack}`);
    res.status(500).json({ message: error.message });
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
  app.use("/.netlify/functions/server", router);
}

export const handler = serverless(app);
