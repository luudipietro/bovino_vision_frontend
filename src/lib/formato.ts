// Argentine number and date formats: decimal comma, dot for thousands.

const LOCALE = "es-AR";

export function formatearNumero(valor: number, decimales = 0): string {
  return valor.toLocaleString(LOCALE, {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}

/** "452 kg", "452,5 kg". */
export function formatearKg(valor: number, decimales = 0): string {
  return `${formatearNumero(valor, decimales)} kg`;
}

/** "60 %" with the space the design system asks for. */
export function formatearPorcentaje(fraccion: number): string {
  return `${formatearNumero(Math.round(fraccion * 100))} %`;
}

/** Calendar dates from the API ("2026-10-20") are parsed as local dates, not UTC. */
function aFecha(valor: string): Date {
  return /^\d{4}-\d{2}-\d{2}$/.test(valor) ? new Date(`${valor}T00:00:00`) : new Date(valor);
}

/** "20/10/2026". */
export function formatearFecha(valor: string): string {
  return aFecha(valor).toLocaleDateString(LOCALE, { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** "20 oct", for chart axes. */
export function formatearFechaCorta(valor: string): string {
  return aFecha(valor)
    .toLocaleDateString(LOCALE, { day: "numeric", month: "short" })
    .replace(".", "");
}

/** "20/10/2026, 14:30". */
export function formatearFechaHora(valor: string): string {
  return aFecha(valor).toLocaleString(LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

/** "Hace 15 min", "Hace 3 h", "Ayer", "Hace 4 días", relative to `ahora`. */
export function formatearHace(valor: string, ahora: Date = new Date()): string {
  const minutos = Math.floor((ahora.getTime() - aFecha(valor).getTime()) / 60_000);
  if (minutos < 1) return "Recién";
  if (minutos < 60) return `Hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  return dias === 1 ? "Ayer" : `Hace ${dias} días`;
}

function unidades(cantidad: number, singular: string, plural: string): string {
  return `${cantidad} ${cantidad === 1 ? singular : plural}`;
}

/**
 * Age of an animal from its birth date, counted in whole calendar months relative to `hoy`:
 * "Menos de 1 mes", "8 meses", "1 año", "2 años y 3 meses". Null when the date is in the future.
 */
export function formatearEdad(fechaNacimiento: string, hoy: Date = new Date()): string | null {
  const nacimiento = aFecha(fechaNacimiento);
  const diaSinCumplir = hoy.getDate() < nacimiento.getDate() ? 1 : 0;
  const meses =
    (hoy.getFullYear() - nacimiento.getFullYear()) * 12 + hoy.getMonth() - nacimiento.getMonth() - diaSinCumplir;
  if (meses < 0) return null;
  if (meses < 1) return "Menos de 1 mes";
  if (meses < 12) return unidades(meses, "mes", "meses");
  const anios = unidades(Math.floor(meses / 12), "año", "años");
  const mesesSueltos = meses % 12;
  return mesesSueltos === 0 ? anios : `${anios} y ${unidades(mesesSueltos, "mes", "meses")}`;
}
