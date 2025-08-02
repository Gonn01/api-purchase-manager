import { executeQuery } from "../../db";
import LoginResponse from "../../dtos/auth/loginResponse";
import { logRed } from "../../functions/logsCustom";

/**
 * Inicia sesión con Firebase UID, o registra un nuevo usuario si no existe.
 */
export async function login(
  firebaseUserId: string,
  email: string,
  name: string
): Promise<LoginResponse> {
  try {
    const query = `
      SELECT id FROM users WHERE firebase_user_id = $1
    `;
    const result = await executeQuery<{ id: number }>(query, [firebaseUserId]);

    if (result.length === 0) {
      const insertQuery = `
        INSERT INTO users (firebase_user_id, email, name)
        VALUES ($1, $2, $3)
        RETURNING id
      `;
      const resultInsert = await executeQuery<{ id: number }>(insertQuery, [
        firebaseUserId,
        email,
        name,
      ]);

      return { message: "Usuario registrado", body: resultInsert[0].id };
    } else {
      return { message: "Usuario ya registrado", body: result[0].id };
    }
  } catch (error: any) {
    logRed(`Error en login: ${error.stack || error.message}`);
    throw error;
  }
}
