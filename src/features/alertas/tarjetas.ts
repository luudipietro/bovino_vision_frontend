import type { Alerta, CodigoPermiso } from "../../api/tipos";

/** Resolving an alert writes to the herd, so it needs `rodeo_gestionar`. */
export function puedeResolverAlertas(permisos: readonly CodigoPermiso[]): boolean {
  return permisos.includes("rodeo_gestionar");
}

/** The `limite` alerts to highlight: most urgent first (priority 1), then the most recent. */
export function alertasDestacadas(alertas: Alerta[], limite: number): Alerta[] {
  return [...alertas]
    .sort(
      (a, b) =>
        a.prioridad - b.prioridad || Date.parse(b.fecha_generacion) - Date.parse(a.fecha_generacion),
    )
    .slice(0, limite);
}

/** Link text of the dashboard strip that leads to the full list. */
export function textoVerAlertas(cantidad: number): string {
  return cantidad === 1 ? "Ver la alerta" : `Ver las ${cantidad} alertas`;
}
