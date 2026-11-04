import type { Captura } from "../../api/tipos";

export type EstadoDePaso = "hecho" | "en_curso" | "pendiente";

export interface PasoDeEstimacion {
  texto: string;
  estado: EstadoDePaso;
}

/**
 * The steps the estimation really goes through, read from the capture's state:
 * photo uploaded, queued (`pendiente`), processing (`procesando`), estimated (`procesada`).
 * `registrada` counts as queued: the request was just sent and the first poll has not answered yet.
 */
export function pasosDeEstimacion(captura: Captura | null): PasoDeEstimacion[] {
  // How many steps are already done; the next one (if any) is the one in progress.
  const hechos = captura === null ? 0 : { registrada: 1, pendiente: 1, procesando: 2, procesada: 4, fallida: 2 }[captura.estado];
  const intento = captura && captura.estado === "procesando" && captura.intentos > 1 ? ` (intento ${captura.intentos})` : "";
  const textos = ["Foto subida", "En la cola de procesamiento", `Procesando la foto${intento}`, "Peso estimado"];

  return textos.map((texto, indice) => ({
    texto,
    estado: indice < hechos ? "hecho" : indice === hechos ? "en_curso" : "pendiente",
  }));
}
