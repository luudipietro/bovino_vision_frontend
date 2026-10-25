import type { PuntoEvolucion } from "../../api/tipos";
import { formatearFechaCorta, formatearNumero } from "../../lib/formato";

const MS_POR_DIA = 86_400_000;

/** Calendar days between two "YYYY-MM-DD" dates (a longer timestamp is read by its date part). */
function diasEntre(desde: string, hasta: string): number {
  const aUtc = (valor: string) => {
    const [anio, mes, dia] = valor.slice(0, 10).split("-").map(Number);
    return Date.UTC(anio!, mes! - 1, dia!);
  };
  return Math.round((aUtc(hasta) - aUtc(desde)) / MS_POR_DIA);
}

/**
 * Target weight at each point: the first real average weight plus the lot's target daily gain
 * times the days since that point. Null when the lot has no target or there are no real points.
 */
export function curvaObjetivo(puntos: PuntoEvolucion[], gmdObjetivo: number | null): number[] | null {
  if (gmdObjetivo == null) return null;
  const reales = puntos.filter((punto) => punto.peso_promedio_kg != null);
  const [primero] = reales;
  if (!primero) return null;
  return reales.map(
    (punto) => primero.peso_promedio_kg! + gmdObjetivo * diasEntre(primero.fecha, punto.fecha),
  );
}

interface DatosSubtitulo {
  cabezas: number;
  lotes: number;
  /** Set when the panel is filtered by one lot. */
  codigoLote?: string;
  /** Date of the latest weighing in the evolution series. */
  ultimaFecha: string | null;
}

/** "1.248 cabezas en 6 lotes · datos al 24 may". */
export function subtituloDelPanel({ cabezas, lotes, codigoLote, ultimaFecha }: DatosSubtitulo): string {
  const nCabezas = `${formatearNumero(cabezas)} ${cabezas === 1 ? "cabeza" : "cabezas"}`;
  const donde = codigoLote ? `el lote ${codigoLote}` : `${formatearNumero(lotes)} ${lotes === 1 ? "lote" : "lotes"}`;
  const base = `${nCabezas} en ${donde}`;
  return ultimaFecha ? `${base} · datos al ${formatearFechaCorta(ultimaFecha)}` : base;
}
