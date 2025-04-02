import { logPurple, logYellow } from "./logsCustom.js";

function verifyParamaters(body, parametrosRequeridos) {
  if (typeof body !== "object" || body === null) {
    return ["El cuerpo de la petición no es válido."];
  }
  const faltantes = parametrosRequeridos.filter((p) => !(p in body));
  return faltantes; // Retorna un array (vacío si no faltan parámetros)
}



export function verifyAll(req, requiredParams = [], requiredBody = []) {
  const missingParams = verifyParamaters(req.params, requiredParams);
  const missingBody = verifyParamaters(req.body, requiredBody);
  return [...missingParams, ...missingBody];
}