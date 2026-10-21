import type { CodigoPermiso } from "../../api/tipos";

/** Navigation sections and the permission that enables each one, in menu order. */
export const SECCIONES = [
  { to: "/captura", label: "Captura", permiso: "capturas_registrar" },
  { to: "/animales", label: "Rodeo", permiso: "rodeo_consultar" },
  { to: "/lotes", label: "Lotes", permiso: "rodeo_consultar" },
  { to: "/panel", label: "Panel", permiso: "analitica_consultar" },
  { to: "/alertas", label: "Alertas", permiso: "analitica_consultar" },
  { to: "/usuarios", label: "Usuarios", permiso: "usuarios_gestionar" },
  { to: "/roles", label: "Roles", permiso: "roles_gestionar" },
] as const satisfies readonly { to: string; label: string; permiso: CodigoPermiso }[];

export type Seccion = (typeof SECCIONES)[number];

/** First permission of the list decides the home screen. */
const PRIORIDAD_DE_INICIO: readonly { permiso: CodigoPermiso; ruta: string }[] = [
  { permiso: "capturas_registrar", ruta: "/captura" },
  { permiso: "analitica_consultar", ruta: "/panel" },
  { permiso: "rodeo_consultar", ruta: "/animales" },
  { permiso: "usuarios_gestionar", ruta: "/usuarios" },
  { permiso: "roles_gestionar", ruta: "/roles" },
];

export function seccionesPermitidas(permisos: readonly CodigoPermiso[]): Seccion[] {
  return SECCIONES.filter((seccion) => permisos.includes(seccion.permiso));
}

/** Permission required by a path (nested paths included), or null when the path is not a section. */
export function permisoDeRuta(ruta: string): CodigoPermiso | null {
  const seccion = SECCIONES.find((s) => ruta === s.to || ruta.startsWith(`${s.to}/`));
  return seccion?.permiso ?? null;
}

/** Paths that are not a protected section (root, unknown) pass so the router can redirect them. */
export function puedeAcceder(permisos: readonly CodigoPermiso[], ruta: string): boolean {
  const requerido = permisoDeRuta(ruta);
  return requerido === null || permisos.includes(requerido);
}

/** Home screen of the user, or null when no permission opens a screen. */
export function rutaDeInicio(permisos: readonly CodigoPermiso[]): string | null {
  return PRIORIDAD_DE_INICIO.find(({ permiso }) => permisos.includes(permiso))?.ruta ?? null;
}
