import { apiDelete, apiGet, apiPostJson } from "./client";
import type { Credenciales, Sesion } from "./tipos";

/** Answers 401, 403 or 429 with the reason in `detail`; the cookie is set on success. */
export function iniciarSesionEnApi(credenciales: Credenciales): Promise<Sesion> {
  return apiPostJson("/auth/sesion", credenciales);
}

export function obtenerSesion(): Promise<Sesion> {
  return apiGet("/auth/sesion");
}

export function cerrarSesionEnApi(): Promise<void> {
  return apiDelete("/auth/sesion");
}
