import type { Rol, Usuario, Uuid } from "../../api/tipos";

export interface ConteoDeRol {
  id: Uuid;
  nombre: string;
  cantidad: number;
}

/** Counts for the role chips: every listed user in the total, then one entry per role (empty ones included). */
export function contarPorRol(usuarios: readonly Usuario[], roles: readonly Rol[]): { total: number; porRol: ConteoDeRol[] } {
  return {
    total: usuarios.length,
    porRol: roles.map((rol) => ({
      id: rol.id,
      nombre: rol.nombre,
      cantidad: usuarios.filter((u) => u.id_rol === rol.id).length,
    })),
  };
}

/** An empty `idRol` means "all roles". */
export function filtrarPorRol(usuarios: readonly Usuario[], idRol: Uuid | ""): Usuario[] {
  return idRol ? usuarios.filter((u) => u.id_rol === idRol) : [...usuarios];
}

export type EstadoDeUsuario = "activo" | "bloqueado" | "inactivo";

/** Deactivation wins over a lock; a lock that already expired counts as active. */
export function estadoDeUsuario(usuario: Usuario, ahora: number): EstadoDeUsuario {
  if (!usuario.activo) return "inactivo";
  if (usuario.bloqueado_hasta && new Date(usuario.bloqueado_hasta).getTime() > ahora) return "bloqueado";
  return "activo";
}

const LOCALE = "es-AR";


/** "Último acceso hoy 08:10", "Último acceso ayer 17:35", "Último acceso 20/10/2026, 09:05" or "Nunca ingresó". */
export function textoUltimoAcceso(ultimoAcceso: string | null, ahora: Date = new Date()): string {
  if (!ultimoAcceso) return "Nunca ingresó";
  const fecha = new Date(ultimoAcceso);
  const hora = fecha.toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const dias = Math.round(
    (Date.UTC(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()) -
      Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())) /
      86_400_000,
  );
  if (dias === 0) return `Último acceso hoy ${hora}`;
  if (dias === 1) return `Último acceso ayer ${hora}`;
  const dia = fecha.toLocaleDateString(LOCALE, { day: "2-digit", month: "2-digit", year: "numeric" });
  return `Último acceso ${dia}, ${hora}`;
}
