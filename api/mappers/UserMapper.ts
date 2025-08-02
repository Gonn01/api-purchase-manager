import { UserDto } from "../dtos/users/UserDto";

export const UserMapper = {
  toDto(row: any): UserDto {
    return {
      id: Number(row.id),
      firebase_user_id: row.firebase_user_id,
      name: row.name,
      email: row.email,
      created_at: new Date(row.created_at).toISOString(),
    };
  },
};
