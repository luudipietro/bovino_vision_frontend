import { createContext, useContext } from "react";
import type { CodigoPermiso, Credenciales, Sesion } from "../../api/tipos";

export interface ContextoDeSesion {
  /** True while the first `GET /auth/sesion` is in flight. */
  cargando: boolean;
  sesion: Sesion | null;
  /** Rejects with the API error (`detail` of the 401, 403 or 429) so the login page can show it. */
  iniciarSesion: (credenciales: Credenciales) => Promise<void>;
  cerrarSesion: () => Promise<void>;
}

export const ContextoSesion = createContext<ContextoDeSesion | null>(null);

export function useSesion(): ContextoDeSesion {
  const contexto = useContext(ContextoSesion);
  if (!contexto) throw new Error("useSesion debe usarse dentro de SesionProvider");
  return contexto;
}

/** Permissions of the current session; empty when there is none. */
export function usePermisos(): readonly CodigoPermiso[] {
  return useSesion().sesion?.permisos ?? [];
}

export function usePuede(permiso: CodigoPermiso): boolean {
  return usePermisos().includes(permiso);
}
