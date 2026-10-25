import type { SesionReciente } from "../../api/tipos";
import { formatearFecha } from "../../lib/formato";
import { formatearHora, referenciaDeDia } from "./diasCalendario";

export interface ResumenDeSesion {
  /** "12 animales procesados". */
  detalle: string;
  /** Hour for a session of today, "Ayer", or the date. */
  cuando: string;
  /** The session was not closed yet. */
  enCurso: boolean;
}

export function resumirSesion(sesion: SesionReciente, ahora: Date = new Date()): ResumenDeSesion {
  const procesados = sesion.cantidad_procesadas;
  const referencia = referenciaDeDia(sesion.fecha_inicio, ahora);
  const cuando =
    referencia === "hoy"
      ? formatearHora(sesion.fecha_inicio)
      : referencia === "ayer"
        ? "Ayer"
        : formatearFecha(sesion.fecha_inicio);

  return {
    detalle: `${procesados} ${procesados === 1 ? "animal procesado" : "animales procesados"}`,
    cuando,
    enCurso: sesion.estado === "activa",
  };
}

/** "Buenos días", "Buenas tardes" or "Buenas noches" for the hour of `ahora`. */
export function saludoSegunHora(ahora: Date = new Date()): string {
  const hora = ahora.getHours();
  if (hora >= 6 && hora < 12) return "Buenos días";
  if (hora >= 12 && hora < 20) return "Buenas tardes";
  return "Buenas noches";
}

/** "Francisco López" → "F. López": first initial and last word; a single word stays as it is. */
export function nombreAbreviado(nombre: string): string {
  const [primera = "", ...resto] = nombre.trim().split(/\s+/);
  const ultima = resto.at(-1);
  return ultima ? `${primera.charAt(0)}. ${ultima}` : primera;
}
