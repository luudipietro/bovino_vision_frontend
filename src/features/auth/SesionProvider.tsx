import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { cerrarSesionEnApi, iniciarSesionEnApi, obtenerSesion } from "../../api/auth";
import { alNoAutorizado } from "../../api/client";
import type { Credenciales, Sesion } from "../../api/tipos";
import { ContextoSesion } from "./useSesion";

export default function SesionProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vigente = true;
    obtenerSesion()
      .then((actual) => {
        if (vigente) setSesion(actual);
      })
      .catch(() => {
        // no valid cookie (401) or API down: the guard sends the user to the login
        if (vigente) setSesion(null);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    // any later 401 means the session expired or was revoked
    const darDeBaja = alNoAutorizado(() => setSesion(null));
    return () => {
      vigente = false;
      darDeBaja();
    };
  }, []);

  const iniciarSesion = useCallback(async (credenciales: Credenciales) => {
    setSesion(await iniciarSesionEnApi(credenciales));
  }, []);

  const cerrarSesion = useCallback(async () => {
    try {
      await cerrarSesionEnApi();
    } catch {
      // the local session is dropped anyway; an expired one has nothing left to revoke
    }
    setSesion(null);
  }, []);

  const valor = useMemo(
    () => ({ cargando, sesion, iniciarSesion, cerrarSesion }),
    [cargando, sesion, iniciarSesion, cerrarSesion],
  );

  return <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>;
}
