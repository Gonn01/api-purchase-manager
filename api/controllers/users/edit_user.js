import { executeQuery } from "../../db.js";
import { logRed, logYellow } from "../../funciones/logsCustom.js";

export async function editUser(newName, userId) {
  try {
    const checkQuery = "SELECT name FROM users WHERE id = $1";
    const checkResult = await executeQuery(checkQuery, [userId]);

    if (checkResult.length === 0) {
      logRed(`No se encontró el usuario con ID ${userId}`);
      throw new Error(
        "No se encontró el usuario con el ID proporcionado."
      );
    }


    if (checkResult[0].name === newName) {
      logRed("El nombre proporcionado es igual al actual.");
      throw new Error("El nombre proporcionado es igual al actual.");
    }
    const query = "UPDATE users SET name = $1 WHERE id = $2";
    const result = await executeQuery(query, [newName, userId]);

    if (result.affectedRows == 0) {
      logRed("No se pudo actualizar el usuario.");
      throw new Error("No se pudo actualizar el usuario.");
    }

    return result;
  } catch (error) {
    logRed(`Error en editUser: ${error.stack}`);
    throw error;
  }
}
