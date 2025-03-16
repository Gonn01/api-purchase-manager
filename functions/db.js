import dotenv from "dotenv";
import postgres from "postgres";
import { logRed, logYellow } from "./funciones/logsCustom.js";

dotenv.config({ path: process.env.ENV_FILE || ".env" });

const connectionString = process.env.DATABASE_URL;
const connection = postgres(connectionString, { ssl: "require" });

export async function executeQuery(query, values = [], log = false) {
  if (log) {
    logYellow(
      `Ejecutando query: ${query} con valores: ${JSON.stringify(values)}`
    );
  }

  try {
    const results = await connection.unsafe(query, values);

    if (log) {
      logYellow(`Query ejecutado con éxito: ${JSON.stringify(results)}`);
    }

    return results;
  } catch (error) {
    logRed(`Error en executeQuery: ${error.stack}`);
    throw error;
  }
}
