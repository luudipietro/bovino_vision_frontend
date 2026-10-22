import type { Animal, Pesaje } from "../../api/tipos";
import { formatearEdad, formatearFecha, formatearFechaHora, formatearKg } from "../../lib/formato";
import { etiquetaDeSexo } from "../animales/formularioAnimal";

export interface Detalle {
  etiqueta: string;
  valor: string;
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

/**
 * What the result screen lists besides the weight: when it was weighed, the animal's breed,
 * sex and age when known, and the previous weight with its date (even if the weighing raised an alert).
 */
export function resumirPesaje(pesaje: Pesaje, animal: Animal | null, ahora: Date = new Date()): ResumenDePesaje {
  const detalles: Detalle[] = [{ etiqueta: "Fecha y hora", valor: formatearFechaHora(pesaje.fecha_pesaje) }];

  if (animal?.raza) detalles.push({ etiqueta: "Raza", valor: animal.raza });
  if (animal?.sexo) detalles.push({ etiqueta: "Sexo", valor: etiquetaDeSexo(animal.sexo) });
  const edad = animal?.fecha_nacimiento ? formatearEdad(animal.fecha_nacimiento, ahora) : null;
  if (edad) detalles.push({ etiqueta: "Edad", valor: edad });

  const previo = pesaje.ultimo_peso_previo;
  if (previo) {
    detalles.push({
      etiqueta: "Peso anterior",
      valor: `${pesoLegible(previo.peso_kg)} · ${formatearFecha(previo.fecha_pesaje)}`,
    });
  }

  return { detalles, primerPesaje: previo === null };
}
