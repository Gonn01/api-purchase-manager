import { executeQuery } from "../../db.js";
import { logRed, logYellow } from "../../funciones/logsCustom.js";

export async function createUser(name, email) {
  try {
    const checkQuery = "SELECT id FROM users WHERE email = $1 LIMIT 1";
    const checkResult = await executeQuery(checkQuery, [email]);

    if (checkResult.length > 0) {
      throw new Error("Ya existe un usuario con ese email.");
    }

    const query = "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *";
    const result = await executeQuery(query, [name, email]);

    return result[0];
  } catch (error) {
    logRed(`Error en createUser: ${error.stack}`);
    throw error;
  }
}
