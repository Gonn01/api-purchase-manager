import dotenv from "dotenv";
import postgres, { Sql } from "postgres";
import { logRed, logYellow } from "./functions/logsCustom";

dotenv.config({ path: process.env.ENV_FILE || ".env" });

const connectionString: string = process.env.DATABASE_URL || "";
if (!connectionString) {
  throw new Error("DATABASE_URL no está definida en el archivo .env");
}

const connection: Sql = postgres(connectionString, { ssl: "require" });

/**
 * Ejecuta una query en la base de datos con parámetros opcionales.
 * @param query SQL a ejecutar.
 * @param values Parámetros para el query.
 * @param log Indica si se loguea la query y el resultado.
 */
export async function executeQuery<T = any>(
  query: string,
  values: any[] = [],
  log: boolean = true
): Promise<T[]> {
  if (log) {
    logYellow(
      `Ejecutando query: ${query} con valores: ${JSON.stringify(values)}`
    );
  }

  try {
    const results = await connection.unsafe < T[] > (query, values);

    if (log) {
      logYellow(`Query ejecutado con éxito: ${JSON.stringify(results)}`);
    }

    return results;
  } catch (error: any) {
    logRed(`Error en executeQuery: ${error.stack || error.message}`);
    throw error;
  }
}
