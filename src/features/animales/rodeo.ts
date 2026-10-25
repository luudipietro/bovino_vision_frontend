import type { Animal, Uuid } from "../../api/tipos";
import { formatearEdad, formatearFechaCorta, formatearKg, formatearNumero } from "../../lib/formato";

/** Filter chip of the herd list: the whole herd, one lot, or the animals with active alerts. */
export type ChipRodeo = { tipo: "todos" } | { tipo: "alertas" } | { tipo: "lote"; idLote: Uuid };

/** Server-side filters a chip stands for (the `FiltroAnimales` fields the chips drive). */
export function filtrosDeChip(chip: ChipRodeo): { idLote: Uuid | null; conAlertasActivas: boolean } {
  if (chip.tipo === "lote") return { idLote: chip.idLote, conAlertasActivas: false };
  return { idLote: null, conAlertasActivas: chip.tipo === "alertas" };
}

/** The animal's GMD as a fraction of its lot target; null without GMD or without a positive target. */
export function porcentajeDeObjetivo(gmd: number | null, objetivo: number | null): number | null {
  if (gmd == null || objetivo == null || objetivo <= 0) return null;
  return gmd / objetivo;
}

export interface ResumenRodeo {
  cabezas: number;
  conAlertas: number;
  /** Sum of the active alerts of every animal. */
  alertas: number;
  /** Distinct lots with at least one of these animals. */
  lotes: number;
  /** Mean of the last weight of the animals that were weighed; null when none was. */
  pesoPromedio: number | null;
  conPeso: number;
  /** Mean GMD of the animals that have one (two weighings or more); null when none has. */
  gmdPromedio: number | null;
  conGmd: number;
}

function promedio(valores: number[]): number | null {
  return valores.length === 0 ? null : valores.reduce((suma, valor) => suma + valor, 0) / valores.length;
}

export interface TarjetaDeRodeo {
  etiqueta: string;
  valor: string;
  detalle: string;
}

function animales(cantidad: number): string {
  return `${formatearNumero(cantidad)} ${cantidad === 1 ? "animal" : "animales"}`;
}

/** The four stat tiles of the herd list; `codigoLote` is set when they describe one lot. */
export function tarjetasDelRodeo(resumen: ResumenRodeo, codigoLote: string | null): TarjetaDeRodeo[] {
  const lotesActivos = `${formatearNumero(resumen.lotes)} ${resumen.lotes === 1 ? "lote activo" : "lotes activos"}`;
  return [
    {
      etiqueta: "Total animales",
      valor: formatearNumero(resumen.cabezas),
      detalle: codigoLote ? `Lote ${codigoLote}` : lotesActivos,
    },
    {
      etiqueta: "Peso promedio",
      valor: resumen.pesoPromedio == null ? "—" : formatearKg(resumen.pesoPromedio),
      detalle: resumen.conPeso > 0 ? `Último pesaje de ${animales(resumen.conPeso)}` : "Todavía sin pesajes",
    },
    {
      etiqueta: "GMD promedio",
      valor: resumen.gmdPromedio == null ? "—" : `${formatearNumero(resumen.gmdPromedio, 2)} kg/día`,
      detalle:
        resumen.conGmd > 0 ? `${animales(resumen.conGmd)} con dos pesajes o más` : "Hace falta un segundo pesaje",
    },
    {
      etiqueta: "Alertas activas",
      valor: formatearNumero(resumen.alertas),
      detalle: resumen.conAlertas > 0 ? `En ${animales(resumen.conAlertas)}` : "Ninguna pendiente",
    },
  ];
}

/** Figures of the herd stat tiles, for the whole herd or the animals of one lot. */
export function resumenDelRodeo(
  animales: Pick<Animal, "id_lote" | "ultimo_peso_kg" | "gmd_kg_dia" | "alertas_activas">[],
): ResumenRodeo {
  const pesos = animales.flatMap((animal) => (animal.ultimo_peso_kg == null ? [] : [animal.ultimo_peso_kg]));
  const gmds = animales.flatMap((animal) => (animal.gmd_kg_dia == null ? [] : [animal.gmd_kg_dia]));
  return {
    cabezas: animales.length,
    conAlertas: animales.filter((animal) => animal.alertas_activas > 0).length,
    alertas: animales.reduce((suma, animal) => suma + animal.alertas_activas, 0),
    lotes: new Set(animales.flatMap((animal) => (animal.id_lote ? [animal.id_lote] : []))).size,
    pesoPromedio: promedio(pesos),
    conPeso: pesos.length,
    gmdPromedio: promedio(gmds),
    conGmd: gmds.length,
  };
}

export type TonoDiferencia = "ganancia" | "perdida" | "sin_cambio";

/** Weight change against the previous weighing: "+15 kg" (gain) or "-10,5 kg" (loss). Null without a previous one. */
export function diferenciaDePeso(
  actual: number,
  anterior: number | null,
): { texto: string; tono: TonoDiferencia } | null {
  if (anterior == null) return null;
  const diferencia = Math.round((actual - anterior) * 10) / 10;
  if (diferencia === 0) return { texto: formatearKg(0), tono: "sin_cambio" };
  const decimales = Number.isInteger(diferencia) ? 0 : 1;
  const modulo = formatearKg(Math.abs(diferencia), decimales);
  return diferencia > 0
    ? { texto: `+${modulo}`, tono: "ganancia" }
    : { texto: `-${modulo}`, tono: "perdida" };
}

/** "15 may 2024 · F. López"; just the date when the weighing has no operator. */
export function lineaFechaOperario(fechaPesaje: string, operario: string | null): string {
  const dia = `${formatearFechaCorta(fechaPesaje)} ${new Date(fechaPesaje).getFullYear()}`;
  return operario ? `${dia} · ${operario}` : dia;
}

/** Chips under the animal's name: breed, age and lot. */
export function chipsDeFicha(
  animal: Pick<Animal, "raza" | "fecha_nacimiento" | "lote_codigo">,
  hoy: Date = new Date(),
): string[] {
  const edad = animal.fecha_nacimiento ? formatearEdad(animal.fecha_nacimiento, hoy) : null;
  return [
    animal.raza ?? "Raza sin registrar",
    edad ?? "Edad sin registrar",
    animal.lote_codigo ? `Lote ${animal.lote_codigo}` : "Sin lote",
  ];
}
