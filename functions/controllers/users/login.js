import { executeQuery } from "../../db.js";
import { logRed } from "../../funciones/logsCustom.js";

export async function login(firebaseUserId, email, name) {
    try {
        const query = "SELECT * FROM users WHERE firebase_user_id = $1";
        const result = await executeQuery(query, [firebaseUserId]);

        if (result.length == 0) {
            const updateQuery = "INSERT INTO users (firebase_user_id, email, name) VALUES ($1, $2, $3) RETURNING id";
            const resultUpdate = await executeQuery(updateQuery, [firebaseUserId, email, name]);
            return { message: "Usuario registrado", body: parseInt(resultUpdate[0].id) };
        } else {
            return { message: "Usuario ya registrado", body: parseInt(result[0].id) };
        }
    } catch (error) {
        logRed(`Error en login: ${error.stack}`);
        throw error;
    }
}