import { executeQuery } from "../../db";
import { logRed } from "../../functions/logsCustom";
import { UserDto } from "../../dtos/users/UserDto";
import { UserMapper } from "../../mappers/UserMapper";

/**
 * Crea un nuevo usuario en la base de datos.
 * @param firebaseUserId ID del usuario en Firebase
 * @param name Nombre del usuario
 * @param email Email del usuario
 */
export async function createUser(
  firebaseUserId: string,
  name: string,
  email: string
): Promise<UserDto> {
  try {
    // 1. Validar si ya existe
    const checkQuery = `
      SELECT id FROM users WHERE firebase_user_id = $1 LIMIT 1
    `;
    const checkResult = await executeQuery(checkQuery, [firebaseUserId]);

    if (checkResult.length > 0) {
      throw new Error("Ya existe un usuario con ese firebaseUserId.");
    }

    // 2. Insertar nuevo usuario
    const query = `
      INSERT INTO users (firebase_user_id, name, email)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await executeQuery < any > (query, [firebaseUserId, name, email]);

    // 3. Mapear a DTO
    return UserMapper.toDto(result[0]);
  } catch (error: any) {
    logRed(`Error en createUser: ${error.stack || error.message}`);
    throw error;
  }
}
