import express from "express";
import cors from "cors";
import serverless from "serverless-http";
import financialEntitiesRouter from "./routes/financial_entities.js";
import purchases from "./routes/purchases.js";
import users from "./routes/users.js";
import { logBlue } from "./funciones/logsCustom.js";

var app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

// Aquí definimos las rutas directamente sin el prefijo de Netlify para el entorno local.
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hello World!");
});

// Descomenta las rutas si las necesitas
router.use("/financial-entities", financialEntitiesRouter);
router.use("/users", users);
router.use("/purchases", purchases);

// Si no estás en Netlify, el servidor debe escuchar en el puerto local.
if (process.env.NETLIFY !== "true") {
  app.use("/.netlify/functions/server", router);
  app.listen(port, () => {
    logBlue(`Servidor corriendo en http://localhost:${port}`);
  });
} else {
  // Si estás en Netlify, usa este prefijo para las rutas.
  app.use('/.netlify/functions/server', router);
}

export const handler = serverless(app);
