import { apiGet, apiPostJson, apiPutJson, query } from "./client";
import type { CambioRolUsuario, CambiosUsuario, NuevoUsuario, Usuario, Uuid } from "./tipos";

export function listarUsuarios(idRol?: Uuid | null): Promise<Usuario[]> {
  return apiGet(`/usuarios${query({ id_rol: idRol })}`);
}

/** Answers 409 when the email is already taken and 422 for a short password. */
export function crearUsuario(datos: NuevoUsuario): Promise<Usuario> {
  return apiPostJson("/usuarios", datos);
}

export function modificarUsuario(idUsuario: Uuid, cambios: CambiosUsuario): Promise<Usuario> {
  return apiPutJson(`/usuarios/${idUsuario}`, cambios);
}

/** Answers 422 when it is the same role or it would leave the system without an administrator. */
export function cambiarRolDeUsuario(idUsuario: Uuid, cambio: CambioRolUsuario): Promise<Usuario> {
  return apiPutJson(`/usuarios/${idUsuario}/rol`, cambio);
}

/** Logical deactivation; answers 422 for the last administrator. */
export function darDeBajaUsuario(idUsuario: Uuid): Promise<Usuario> {
  return apiPostJson(`/usuarios/${idUsuario}/baja`);
}
