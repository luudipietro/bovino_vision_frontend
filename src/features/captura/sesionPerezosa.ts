import type { SesionCaptura, Uuid } from "../../api/tipos";

export interface DependenciasSesion {
  iniciar: () => Promise<SesionCaptura>;
  finalizar: (idSesion: Uuid) => Promise<unknown>;
}

export interface SesionPerezosa {
  /** The started session, or null while no photo asked for one. */
  id: () => Uuid | null;
  /** The current session, started on the first call; concurrent calls share the same start. */
  obtener: () => Promise<Uuid>;
  /** Finalizes the session if one was started; the next `obtener` starts a new one. */
  cerrar: () => Promise<void>;
}

/** Capture session started with the first photo, so leaving the flow without photos leaves no empty session behind. */
export function crearSesionPerezosa({ iniciar, finalizar }: DependenciasSesion): SesionPerezosa {
  let id: Uuid | null = null;
  let iniciando: Promise<Uuid> | null = null;

  function obtener(): Promise<Uuid> {
    if (id) return Promise.resolve(id);
    iniciando ??= iniciar()
      .then((sesion) => (id = sesion.id))
      .finally(() => {
        iniciando = null;
      });
    return iniciando;
  }

  async function cerrar(): Promise<void> {
    const actual = id ?? (iniciando ? await iniciando.catch(() => null) : null);
    id = null;
    if (actual) await finalizar(actual);
  }

  return { id: () => id, obtener, cerrar };
}
