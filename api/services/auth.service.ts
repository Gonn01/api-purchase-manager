import jwt, { SignOptions, Secret } from "jsonwebtoken";
import { UserRepository } from "../repositories/user.repository";
import { LoginInputDTO } from "../dtos/auth/login-input.dto";
import { LoginOutputDTO } from "../dtos/auth/login-output.dto";

export class AuthService {
    private readonly users = new UserRepository();

    async login(input: LoginInputDTO): Promise<LoginOutputDTO> {
        const { firebaseUserId, email, name } = input;

        let userId = await this.users.findIdByFirebaseId(firebaseUserId);
        if (userId == null) {
            userId = await this.users.create(email, name, firebaseUserId);
        }

        const secret = process.env.JWT_SECRET as Secret | undefined;
        if (!secret) {
            const e: any = new Error("JWT_SECRET no configurado");
            e.status = 500;
            e.code = "JWT_SECRET_MISSING";
            throw e;
        }

        const options: SignOptions = { expiresIn: 60 * 60 * 24 * 30 }; // 30 días
        const token = jwt.sign({ userId }, secret, options);

        return { message: "Usuario autenticado", body: { id: userId, token } };
    }
}
