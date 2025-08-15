import { Request, Response } from "express";
import { logRed } from "./logsCustom";
import CustomException from "../models/CustomException";
import { Status } from "../models/Status";

/**
 * Envía la respuesta de error apropiada y loguea, según el tipo de excepción.
 */
export function handleError(req: Request, res: Response, err: unknown) {
  let ex: CustomException;

  if (err instanceof CustomException) {
    ex = err;
  } else if (err instanceof Error) {
    ex = new CustomException({
      title: "Internal Server Error",
      message: err.message,
      stack: err.stack,
      status: Status.internalServerError,
    });
  } else {
    ex = new CustomException({
      title: "Unknown Error",
      message: "An unknown error occurred.",
      status: Status.internalServerError,
    });
  }

  logRed(
    `Error ${ex.status} ${req.method} ${req.originalUrl}: ${ex.toJsonString()}`
  );
  return res.status(ex.status).json(ex.toJSON());
}
