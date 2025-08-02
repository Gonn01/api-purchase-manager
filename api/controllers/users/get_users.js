import { executeQuery } from "../../db.js";
import { logRed, logYellow } from "../../funciones/logsCustom.js";

export async function getUsers() {
  try {
    const query = "SELECT * FROM users";
    const result = await executeQuery(query);

    if (result.length == 0) {
      throw new Error("No se encontraron usuarios.");
    }

    return result;
  } catch (error) {
    logRed(`Error en getUsers: ${error.stack}`);
    throw error;
  }
}
