import { logPurple, logYellow } from "./logsCustom.js";

export function verifyParamaters(body, parametrosRequeridos) {
  if (typeof body !== "object" || body === null) {
    return "El cuerpo de la petición no es válido.";
  }

  const faltantes = parametrosRequeridos.filter((p) => !(p in body));

  if (faltantes.length > 0) {
    return `Faltan los siguientes parámetros: ${faltantes.join(", ")}`;
  }

  return null;
}
