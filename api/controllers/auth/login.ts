import { executeQuery } from "../../db";
import LoginResponse from "../../dtos/auth/loginResponse";
import { logRed } from "../../functions/logsCustom";
import jwt, { SignOptions, Secret } from "jsonwebtoken";
import CustomException from "../../models/CustomException";

export async function login(
  firebaseUserId: string,
  email: string,
  name: string
): Promise<LoginResponse> {
  const query = `
      SELECT id FROM users WHERE firebase_user_id = $1
    `;
  const result = await executeQuery<{ id: number }>(query, [firebaseUserId]);
  let userId: number;

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
    userId = Number(resultInsert[0].id);
  } else {
    userId = Number(result[0].id);
  }

  if (!process.env.JWT_SECRET) {
    throw new CustomException({ title: "JWT_SECRET no está definido en .env", message: "Por favor, define JWT_SECRET en tu archivo .env" });
  }

  const secret: Secret = process.env.JWT_SECRET as Secret;
  const expiresInEnv = process.env.JWT_EXPIRES_IN ? Number(process.env.JWT_EXPIRES_IN) : undefined;
  const options: SignOptions = {
    expiresIn: expiresInEnv ?? 3600,
  };

  const token = jwt.sign({ userId }, secret, options);

  return { message: "Usuario ya registrado", body: { id: userId as number, token } };
}
