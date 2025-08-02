import { Request, Response } from "express";
import { logRed } from "./logsCustom";
import CustomException from "../models/CustomException";
import { Status } from "../models/Status";
export function verificarTodo(
  req: Request,
  res: Response,
  requiredParams: string[] = [],
  requiredBodyFields: string[] = []
): boolean {
  const faltantes: string[] = [];

  // 1) Validar siempre los params de ruta
  for (const p of requiredParams) {
    if (!req.params || req.params[p] === undefined) {
      faltantes.push(`Parámetro de ruta "${p}" es obligatorio`);
    }
  }

  // 2) Si es GET o DELETE, validamos solo params
  if (req.method === "GET" || req.method === "DELETE") {
    if (faltantes.length) {
      const ex = new CustomException({
        title: "Faltan parámetros",
        message: `Faltan parámetros: ${faltantes.join(", ")}`,
        status: Status.badRequest,
      });
      logRed(
        `Error Status.badRequest ${req.method} ${req.originalUrl}: ${ex.toJsonString()}`
      );
      res.status(Status.badRequest).json(ex.toJSON());
      return false;
    }
    return true;
  }

  // 3) Para POST (y métodos con body), validar campos obligatorios
  const body: Record<string, any> = req.body || {};
  if (req.method === "POST") {
    for (const f of requiredBodyFields) {
      if (body[f] === undefined) {
        faltantes.push(`Campo de body "${f}" es obligatorio`);
      }
    }
    if (faltantes.length) {
      const ex = new CustomException({
        title: "Faltan campos",
        message: `Faltan campos: ${faltantes.join(", ")}`,
        status: Status.badRequest,
      });
      logRed(
        `Error Status.badRequest ${req.method} ${req.originalUrl}: ${ex.toJsonString()}`
      );
      res.status(Status.badRequest).json(ex.toJSON());
      return false;
    }
  }

  // 4) Validar que no lleguen campos extra (sólo en métodos con body)
  const desconocidos = Object.keys(body).filter(
    (k) => !requiredBodyFields.includes(k)
  );
  if (desconocidos.length) {
    const ex = new CustomException({
      title: "Campos inválidos",
      message: `No se permiten estos campos: ${desconocidos.join(", ")}`,
      status: Status.badRequest,
    });
    logRed(
      `Error Status.badRequest ${req.method} ${req.originalUrl}: ${ex.toJsonString()}`
    );
    res.status(Status.badRequest).json(ex.toJSON());
    return false;
  }

  return true;
}
