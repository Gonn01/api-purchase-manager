import express from "express";
import routes from "./routes"; // 👈 tu index de routes
import { logBlue } from "./functions/logsCustom";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Todas las rutas bajo /api
app.use("/api", routes);

// Vercel usa este export como entrypoint
export default app;

// Si querés que también funcione localmente:
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    logBlue(`Servidor corriendo en http://localhost:${port}/api`);
  });
}
