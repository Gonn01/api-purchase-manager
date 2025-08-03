import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logRed } from "./logsCustom";

export function verifyToken(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader) {
            return res.status(401).json({ message: "Token no proporcionado" });
        }

        const token = authHeader.split(" ")[1]; // Formato esperado: "Bearer <token>"
        if (!token) {
            return res.status(401).json({ message: "Token inválido o ausente" });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET no está definido en .env");
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Token inválido o expirado" });
            }

            // Guardamos el payload decodificado en req.user para usarlo después
            (req as any).user = decoded;
            next();
        });
    } catch (error: any) {
        logRed(`Error en verifyToken: ${error.message}`);
        return res.status(500).json({ message: "Error al verificar token" });
    }
}
