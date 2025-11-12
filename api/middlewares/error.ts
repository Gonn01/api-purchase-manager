import type { ZodError, ZodIssue } from "zod";
import type { Request, Response, NextFunction } from "express";
import CustomException from "../models/CustomException";
import { Status } from "../models/Status";
import { logBlue } from "../lib/logs";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  // Si ya es un CustomException, lo usamos tal cual
  if (err instanceof CustomException) {
    return res.status(err.status || Status.internalServerError).json({
      title: err.title || "Error",
      message: err.message || "Ha ocurrido un error.",
    });
  }

  // ZodError no atrapado (por si algún otro lugar usa parse() directamente)
  if (err?.name === "ZodError" && Array.isArray(err.issues)) {
    return res.status(Status.badRequest).json({
      title: "Datos inválidos",
      message: "Hay errores de validación en los datos enviados.",
    });
  }

  // Genérico
  const status = err?.status || Status.internalServerError;
  const title = err?.title || "Internal Server Error";
  const message = err?.message || "Ha ocurrido un error.";
  logBlue(`[ErrorHandler] ${status} - ${message} - ${err?.stack || ""}`);
  return res.status(status).json({
    title,
    message,
  });
}

/**
 * Convierte un ZodError en un CustomException con mensaje y detalles legibles.
 */
export function zodToCustomException(error: ZodError, {
  title = "Error de validación",
  status = Status.badRequest,
} = {}) {
  const details = simplifyIssues(error.issues);

  // Mensaje corto y humano
  const msg = buildHumanMessage(details);

  return new CustomException({
    title,
    message: msg,
    status,
    stack: undefined,
  });
}

/**
 * Simplifica issues de Zod a un formato más claro.
 */
export function simplifyIssues(issues: ZodIssue[]) {
  return issues.map(i => ({
    path: i.path.join("."),
    code: i.code,
    expected: (i as any).expected,   // no siempre está, por eso opcional
    received: (i as any).received,   // idem
    message: i.message,
  }));
}

/**
 * Construye un mensaje humano resumido a partir de los detalles.
 * Ejemplos:
 * - "Faltan: currencyType, type."
 * - "Campos con tipo inválido (esperado number): currencyType, type."
 */
export function buildHumanMessage(details: Array<{ path: string; code: string; expected?: any; received?: any; message: string; }>) {
  const missing = details
    .filter(d => d.code === "invalid_type" && (d.received === "undefined" || /required/i.test(d.message)))
    .map(d => d.path);

  const invalidTypeNumber = details
    .filter(d =>
      d.code === "invalid_type" &&
      String(d.expected) === "number" &&
      d.received !== "undefined"
    )
    .map(d => d.path);

  const others = details
    .filter(d => !missing.includes(d.path) && !invalidTypeNumber.includes(d.path))
    .map(d => `${d.path}: ${d.message}`);

  const parts: string[] = [];
  if (missing.length) parts.push(`Faltan: ${missing.join(", ")}.`);
  if (invalidTypeNumber.length) parts.push(`Campos con tipo inválido (esperado number): ${invalidTypeNumber.join(", ")}.`);
  if (others.length) parts.push(`Otros: ${others.join(" | ")}`);

  // Fallback si no armamos nada específico
  return parts.length ? parts.join(" ") : "Hay errores de validación en los datos enviados.";
}