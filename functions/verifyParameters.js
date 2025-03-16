export function verifyParamaters(body, parametrosRequeridos) {
  const param = [...parametrosRequeridos];

  const faltantes = param.filter((p) => !(p in body));

  if (faltantes.length > 0) {
    return `Faltan los siguientes parámetros: ${faltantes.join(", ")}`;
  }

  return null;
}
