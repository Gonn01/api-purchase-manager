import { executeQuery } from "../../db";
import { logRed } from "../../functions/logsCustom";
import { UserDto } from "../../dtos/users/UserDto";
import { UserMapper } from "../../mappers/UserMapper";

/**
 * Edita el nombre de un usuario.
 * @param newName Nuevo nombre del usuario
 * @param userId ID del usuario
 * @returns Usuario actualizado como DTO
 */
export async function editUser(
  newName: string,
  userId: number
): Promise<UserDto> {
  try {
    // 1. Verificar existencia
    const checkQuery = `
      SELECT name FROM users WHERE id = $1
    `;
    const checkResult = await executeQuery<{ name: string }>(checkQuery, [userId]);

    if (checkResult.length === 0) {
      logRed(`No se encontró el usuario con ID ${userId}`);
      throw new Error("No se encontró el usuario con el ID proporcionado.");
    }

    // 2. Validar que el nombre sea distinto
    if (checkResult[0].name === newName) {
      logRed("El nombre proporcionado es igual al actual.");
      throw new Error("El nombre proporcionado es igual al actual.");
    }

    // 3. Actualizar nombre y devolver el usuario
    const query = `
      UPDATE users SET name = $1 WHERE id = $2 RETURNING *
    `;
    const result = await executeQuery<any>(query, [newName, userId]);

    if (result.length === 0) {
      logRed("No se pudo actualizar el usuario.");
      throw new Error("No se pudo actualizar el usuario.");
    }
    
    return UserMapper.toDto(result[0]);
  } catch (error: any) {
    logRed(`Error en editUser: ${error.stack || error.message}`);
    throw error;
  }
}
