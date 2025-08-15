export interface User {
    id: number;
    createdAt: Date;
    name: string;
    email: string;
    firebaseUserId: string | null;
}

export const UserEntity = {
    table: "users",

    fromRow(row: any): User {
        return {
            id: Number(row.id),
            createdAt: new Date(row.created_at),
            name: String(row.name),
            email: String(row.email),
            firebaseUserId: row.firebase_user_id ?? null,
        };
    },

    toRow(u: Partial<User>) {
        return {
            id: u.id,
            created_at: u.createdAt,
            name: u.name,
            email: u.email,
            firebase_user_id: u.firebaseUserId,
        };
    },
};
