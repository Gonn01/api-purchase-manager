import { executeQuery } from "../../db.js";
import { logRed, logYellow } from "../../funciones/logsCustom.js";

export async function createUser(firebaseUserId, name, email) {
  try {
    const checkQuery = "SELECT id FROM users WHERE firebase_user_id = $1 LIMIT 1";
    const checkResult = await executeQuery(checkQuery, [firebaseUserId]);

    if (checkResult.length > 0) {
      throw new Error("Ya existe un usuario con ese firebaseUserId.");
    }

    const query = "INSERT INTO users (firebase_user_id, name, email) VALUES ($1, $2, $3) RETURNING *";
    const result = await executeQuery(query, [firebaseUserId, name, email]);

    return result[0];
  } catch (error) {
    logRed(`Error en createUser: ${error.stack}`);
    throw error;
  }
}
