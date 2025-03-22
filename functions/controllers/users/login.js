import { executeQuery } from "../../db.js";
import { logRed, logYellow } from "../../funciones/logsCustom.js";

export async function login(firebaseUserId, email, name) {
    try {
        const query = "SELECT * FROM users WHERE firebase_user_id = $1";
        const result = await executeQuery(query, [firebaseUserId]);

        if (result.length == 0) {
            const updateQuery = "INSERT INTO users (firebase_user_id, email, name) VALUES ($1, $2, $3)";
            await executeQuery(updateQuery, [firebaseUserId, email, name]);
        } else {
            return { message: "Usuario ya registrado" };
        }
    } catch (error) {
        logRed(`Error en login: ${error.stack}`);
        throw error;
    }
}