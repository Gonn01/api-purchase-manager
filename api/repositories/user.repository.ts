import { executeQuery } from "../db"; // usa tu helper existente
import { User, UserEntity } from "../models/user.entity";

export class UserRepository {
    async findIdByFirebaseId(firebaseUserId: string): Promise<number | null> {
        const rows = await executeQuery<{ id: number }>(
            `SELECT id FROM users WHERE firebase_user_id = $1 LIMIT 1`,
            [firebaseUserId],
            true
        );
        return rows.length ? Number(rows[0].id) : null;
    }

    async create(email: string, name: string | null | undefined, firebaseUserId: string): Promise<number> {
        const rows = await executeQuery<{ id: number }>(
            `INSERT INTO users (firebase_user_id, email, name)
       VALUES ($1, $2, $3)
       RETURNING id`,
            [firebaseUserId, email, name],
            true
        );
        return Number(rows[0].id);
    }

    async findById(id: number): Promise<User | null> {
        const rows = await executeQuery<any>(
            `SELECT id, name, email, firebase_user_id, created_at
       FROM users WHERE id = $1 LIMIT 1`,
            [id],
            true
        );
        return rows.length ? UserEntity.fromRow(rows[0]) : null;
    }
}
