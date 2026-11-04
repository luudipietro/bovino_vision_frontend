import type { SesionReciente } from "../../api/tipos";

export interface HistorialDeSesiones {
  sesiones: SesionReciente[];
  /** A full page came back, so there may be older sessions. */
  hayMas: boolean;
}

/**
 * Appends the next page of the history. A session started while browsing shifts the pages by one,
 * so a session already shown can come again and is skipped.
 */
export function agregarPagina(
  actuales: SesionReciente[],
  pagina: SesionReciente[],
  tamano: number,
): HistorialDeSesiones {
  const mostradas = new Set(actuales.map((sesion) => sesion.id));
  return {
    sesiones: [...actuales, ...pagina.filter((sesion) => !mostradas.has(sesion.id))],
    hayMas: pagina.length === tamano,
  };
}
