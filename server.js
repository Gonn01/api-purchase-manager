import express from "express";
import cors from "cors";
import serverless from "serverless-http";
import financialEntitiesRouter from "./routes/financial_entities.js";
import purchases from "./routes/purchases.js";
import users from "./routes/users.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/financial-entities", financialEntitiesRouter);
app.use("/users", users);
app.use("/purchases", purchases);

const router = express.Router();
router.get("/", (req, res) => {
  res.send("Hello World! desde Netlify");
});
app.use("/server", router);

if (process.env.NETLIFY !== "true") {
  app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
  });
}

export const handler = serverless(app);
