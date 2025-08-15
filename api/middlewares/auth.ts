// middlewares/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

type JwtClaims = { userId: number };

export function verifyToken(req: Request, res: Response, next: NextFunction) {
    const h = req.header("authorization") || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : "";
    if (!token) return res.status(401).json({ error: { message: "Token requerido" } });

    try {
        const { userId } = jwt.verify(token, process.env.JWT_SECRET!) as JwtClaims;
        res.locals.userId = userId;         // <- guardo acá
        next();
    } catch {
        res.status(401).json({ error: { message: "Token inválido" } });
    }
}
