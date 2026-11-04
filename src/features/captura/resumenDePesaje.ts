import type { Animal, Pesaje } from "../../api/tipos";
import { formatearEdad, formatearFecha, formatearFechaHora, formatearKg, formatearNumero } from "../../lib/formato";
import { etiquetaDeSexo } from "../animales/formularioAnimal";
import { diasEntre, formatearHora, referenciaDeDia } from "./diasCalendario";
import { nombreAbreviado } from "./sesionesRecientes";

export interface Detalle {
  etiqueta: string;
  valor: string;
}

/** A row of the result sheet; `tono` colors the value (a gain reads green, a loss red). */
export interface FilaDeFicha extends Detalle {
  tono?: "positivo" | "negativo";
}

export interface ResumenDePesaje {
  detalles: Detalle[];
  /** There is no earlier weighing to compare with (ERS CU-15 4a). */
  primerPesaje: boolean;
}

/** "440 kg" or "440,5 kg": decimals only when the weight has them, as the result headline does. */
function pesoLegible(kg: number): string {
  return formatearKg(kg, Number.isInteger(kg) ? 0 : 1);
}

/** Breed, sex and age of the animal, only those it has. */
function detallesDelAnimal(animal: Animal | null, ahora: Date): Detalle[] {
  const detalles: Detalle[] = [];
  if (animal?.raza) detalles.push({ etiqueta: "Raza", valor: animal.raza });
  if (animal?.sexo) detalles.push({ etiqueta: "Sexo", valor: etiquetaDeSexo(animal.sexo) });
  const edad = animal?.fecha_nacimiento ? formatearEdad(animal.fecha_nacimiento, ahora) : null;
  if (edad) detalles.push({ etiqueta: "Edad", valor: edad });
  return detalles;
}

/**
 * What the result screen lists besides the weight: when it was weighed, the animal's breed,
 * sex and age when known, and the previous weight with its date (even if the weighing raised an alert).
 */
export function resumirPesaje(pesaje: Pesaje, animal: Animal | null, ahora: Date = new Date()): ResumenDePesaje {
  const detalles: Detalle[] = [
    { etiqueta: "Fecha y hora", valor: formatearFechaHora(pesaje.fecha_pesaje) },
    ...detallesDelAnimal(animal, ahora),
  ];

  const previo = pesaje.ultimo_peso_previo;
  if (previo) {
    detalles.push({
      etiqueta: "Peso anterior",
      valor: `${pesoLegible(previo.peso_kg)} · ${formatearFecha(previo.fecha_pesaje)}`,
    });
  }

  return { detalles, primerPesaje: previo === null };
}

/** "443 kg · +15 kg en 33 días": the previous weight, the change and the calendar days between weighings. */
export function describirPesajeAnterior(pesaje: Pesaje): Pick<FilaDeFicha, "valor" | "tono"> | null {
  const previo = pesaje.ultimo_peso_previo;
  if (!previo) return null;

  const diferencia = Math.round((pesaje.peso_kg - previo.peso_kg) * 10) / 10;
  const decimales = Number.isInteger(diferencia) ? 0 : 1;
  const signo = diferencia >= 0 ? "+" : "-";
  const dias = diasEntre(previo.fecha_pesaje, pesaje.fecha_pesaje);
  const plazo = dias === 0 ? "el mismo día" : `en ${dias} ${dias === 1 ? "día" : "días"}`;

  return {
    valor: `${pesoLegible(previo.peso_kg)} · ${signo}${formatearNumero(Math.abs(diferencia), decimales)} kg ${plazo}`,
    tono: diferencia >= 0 ? "positivo" : "negativo",
  };
}

/** "F. López · hoy 09:12": who took the capture and when, or null when the operator is unknown. */
export function describirOperario(operario: string | null, fechaPesaje: string, ahora: Date = new Date()): string | null {
  if (!operario) return null;
  const referencia = referenciaDeDia(fechaPesaje, ahora);
  const cuando = referencia ? `${referencia} ${formatearHora(fechaPesaje)}` : formatearFechaHora(fechaPesaje);
  return `${nombreAbreviado(operario)} · ${cuando}`;
}

/**
 * Data sheet of the result screen: tag, lot, previous weighing and operator (each only when known),
 * followed by the animal's breed, sex and age.
 */
export function fichaDelResultado(pesaje: Pesaje, animal: Animal | null, ahora: Date = new Date()): FilaDeFicha[] {
  const ficha: FilaDeFicha[] = [{ etiqueta: "Identificador SENASA", valor: pesaje.animal_identificador }];

  if (pesaje.lote_codigo) ficha.push({ etiqueta: "Lote", valor: pesaje.lote_codigo });
  const anterior = describirPesajeAnterior(pesaje);
  if (anterior) ficha.push({ etiqueta: "Pesaje anterior", ...anterior });
  const operario = describirOperario(pesaje.operario, pesaje.fecha_pesaje, ahora);
  if (operario) ficha.push({ etiqueta: "Operario", valor: operario });

  return [...ficha, ...detallesDelAnimal(animal, ahora)];
}
