import { executeQuery } from "../../db";
import { logRed } from "../../functions/logsCustom";

/**
 * Elimina un usuario de la base de datos.
 * @param userId ID del usuario
 */
export async function deleteUser(userId: number): Promise<{ id: number }> {
  try {
    // 1. Verificar existencia
    const checkQuery = `
      SELECT id FROM users WHERE id = $1
    `;
    const checkResult = await executeQuery<{ id: number }>(checkQuery, [userId]);

    if (checkResult.length === 0) {
      logRed(`No se encontró el usuario con ID ${userId}`);
      throw new Error("No se encontró el usuario con el ID proporcionado.");
    }

    // 2. Eliminar con RETURNING
    const query = `
      DELETE FROM users WHERE id = $1 RETURNING id
    `;
    const result = await executeQuery<{ id: number }>(query, [userId]);

    if (result.length === 0) {
      logRed("No se pudo eliminar el usuario.");
      throw new Error("No se pudo eliminar el usuario.");
    }

    return { id: result[0].id };
  } catch (error: any) {
    logRed(`Error en deleteUser: ${error.stack || error.message}`);
    throw error;
  }
}
