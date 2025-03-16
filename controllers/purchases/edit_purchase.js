import { executeQuery } from "../../db.js";
import { logRed, logYellow } from "../../functions/logsCustom.js";

export async function editPurchase(newName, userId) {
  try {
    const checkQuery = "SELECT id FROM users WHERE id = $1";
    const checkResult = await executeQuery(checkQuery, [userId]);

    if (checkResult.length === 0) {
      logRed(`No se encontró la entidad financiera con ID ${userId}`);
      throw new Error(
        "No se encontró la entidad financiera con el ID proporcionado."
      );
    }
    const query = "UPDATE users SET name = $1 WHERE id = $2";
    const result = await executeQuery(query, [newName, userId]);

    if (result.length == 0) {
      logRed("No se pudo actualizar la entidad financiera.");
      throw new Error("No se pudo actualizar la entidad financiera.");
    }

    return result;
  } catch (error) {
    logRed(`Error en editUser: ${error.stack}`);
    throw error;
  }
}
