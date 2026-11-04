import { apiGet, apiPutJson } from "./client";
import type { CodigoPermiso, Permiso, Rol, Uuid } from "./tipos";

export function listarRoles(): Promise<Rol[]> {
  return apiGet("/roles");
}

export function listarPermisos(): Promise<Permiso[]> {
  return apiGet("/permisos");
}

/** Answers 422 when the change would leave the system without an administrator. */
export function guardarPermisosDeRol(idRol: Uuid, permisos: CodigoPermiso[]): Promise<Rol> {
  return apiPutJson(`/roles/${idRol}/permisos`, { permisos });
}
