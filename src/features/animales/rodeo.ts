import type { Animal, Uuid } from "../../api/tipos";
import { formatearEdad, formatearFechaCorta, formatearKg } from "../../lib/formato";

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

/** Figures of the "Total cabezas" counter. */
export function resumenDelRodeo(animales: Pick<Animal, "alertas_activas">[]): {
  cabezas: number;
  conAlertas: number;
} {
  return {
    cabezas: animales.length,
    conAlertas: animales.filter((animal) => animal.alertas_activas > 0).length,
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
