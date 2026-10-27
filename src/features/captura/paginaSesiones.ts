import { listarSesionesRecientes } from "../../api/capturas";

export const TAMANO_PAGINA = 10;

export interface ConsultaHistorial {
  pagina: number;
  desde: string;
  hasta: string;
}

/** Convierte el día del navegador en un instante; el límite final es la medianoche siguiente. */
function medianoche(fecha: string, diaSiguiente = false): string | undefined {
  if (!fecha) return undefined;
  const instante = new Date(fecha + "T00:00:00");
  if (diaSiguiente) instante.setDate(instante.getDate() + 1);
  return instante.toISOString();
}

/** Pide un registro adicional sin mostrarlo para no ofrecer páginas vacías al final. */
export async function cargarPaginaSesiones({ pagina, desde, hasta }: ConsultaHistorial) {
  if (desde && hasta && desde > hasta) {
    throw new Error("La fecha Desde no puede ser posterior a Hasta.");
  }
  const sesiones = await listarSesionesRecientes(TAMANO_PAGINA + 1, (pagina - 1) * TAMANO_PAGINA, {
    desde: medianoche(desde),
    hasta: medianoche(hasta, true),
  });
  return { sesiones: sesiones.slice(0, TAMANO_PAGINA), hayMas: sesiones.length > TAMANO_PAGINA };
}
