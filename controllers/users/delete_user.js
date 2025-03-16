import { executeQuery } from "../../db.js";
import { logRed, logYellow } from "../../functions/logsCustom.js";

export async function deleteUser(userId) {
  try {
    const checkQuery = "SELECT id FROM users WHERE id = $1";
    const checkResult = await executeQuery(checkQuery, [userId]);

    if (checkResult.length === 0) {
      logRed(`No se encontró el usuario con ID ${userId}`);
      throw new Error("No se encontró el usuario con el ID proporcionado.");
    }

    const query = "DELETE FROM users WHERE id = $1";
    const result = await executeQuery(query, [userId]);

    if (result.length == 0) {
      logRed("No se pudo eliminar el usuario.");
      throw new Error("No se pudo eliminar el usuario.");
    }

    return result;
  } catch (error) {
    logRed(`Error en deleteUser: ${error.stack}`);
    throw error;
  }
}
