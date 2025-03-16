import { Router } from "express";
import { performance } from "perf_hooks";
import { verifyParamaters } from "../funciones/verifyParameters.js";
import { logPurple, logRed } from "../funciones/logsCustom.js";
import { createUser } from "../controllers/users/create_user.js";
import { getUsers } from "../controllers/users/get_users.js";
import { editUser } from "../controllers/users/edit_user.js";
import { deleteUser } from "../controllers/users/delete_user.js";

const users = Router();

users.post("/create", async (req, res) => {
  const startTime = performance.now();

  const errorMessage = verifyParamaters(req.body, ["name", "userId"]);

  if (errorMessage) {
    return res.status(400).json({ message: errorMessage });
  }

  const { name, userId } = req.body;

  try {
    const result = await createUser(name, userId);

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

users.get("/", async (req, res) => {
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

users.put("/:userId", async (req, res) => {
  const startTime = performance.now();

  const errorMessage = verifyParamaters(req.params, ["userId"]);

  if (errorMessage) {
    return res.status(400).json({ message: errorMessage });
  }

  const { userId } = req.params;

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

users.delete("/:userId", async (req, res) => {
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

export default users;
