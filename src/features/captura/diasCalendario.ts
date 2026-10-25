
const MS_POR_DIA = 86_400_000;

/** Same parsing rule as `lib/formato`: calendar dates are local dates, timestamps keep their instant. */
function aFecha(valor: string): Date {
  return /^\d{4}-\d{2}-\d{2}$/.test(valor) ? new Date(`${valor}T00:00:00`) : new Date(valor);
}

/** Position of the local calendar day on a day-by-day axis, free of daylight-saving shifts. */
function numeroDeDia(fecha: Date): number {
  return Math.round(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()) / MS_POR_DIA);
}

/** Calendar days from `desde` to `hasta` (local days, not 24 h blocks). */
export function diasEntre(desde: string, hasta: string): number {
  return numeroDeDia(aFecha(hasta)) - numeroDeDia(aFecha(desde));
}

/** "09:12", 24 h clock. */
export function formatearHora(valor: string): string {
  return aFecha(valor).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
}

/** "hoy" or "ayer" when `valor` falls on that calendar day relative to `ahora`, else null. */
export function referenciaDeDia(valor: string, ahora: Date): "hoy" | "ayer" | null {
  const dias = numeroDeDia(ahora) - numeroDeDia(aFecha(valor));
  if (dias === 0) return "hoy";
  return dias === 1 ? "ayer" : null;
}
