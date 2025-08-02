import { executeQuery } from "../../db";
import { logRed } from "../../functions/logsCustom";
import { UserDto } from "../../dtos/users/UserDto";
import { UserMapper } from "../../mappers/UserMapper";

/**
 * Obtiene todos los usuarios de la base de datos.
 * @returns Lista de usuarios en formato DTO
 */
export async function getUsers(): Promise<UserDto[]> {
  try {
    const query = "SELECT * FROM users";
    const result = await executeQuery<any>(query);

    if (result.length === 0) {
      throw new Error("No se encontraron usuarios.");
    }

    return result.map((row: any) => UserMapper.toDto(row));
  } catch (error: any) {
    logRed(`Error en getUsers: ${error.stack || error.message}`);
    throw error;
  }
}
