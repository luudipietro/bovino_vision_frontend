import { useCallback, useEffect, useState } from "react";
import { listarSesionesRecientes } from "../../api/capturas";
import { mensajeDeError } from "../../api/client";
import type { SesionReciente } from "../../api/tipos";

const CANTIDAD = 5;

export type SesionesRecientes =
  | { estado: "cargando" }
  | { estado: "error"; mensaje: string }
  | { estado: "listo"; sesiones: SesionReciente[] };

/** Last capture sessions of the current user, with a way to ask again after a failure. */
export function useSesionesRecientes(): { sesiones: SesionesRecientes; recargar: () => void } {
  const [sesiones, setSesiones] = useState<SesionesRecientes>({ estado: "cargando" });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    listarSesionesRecientes(CANTIDAD)
      .then((lista) => vigente && setSesiones({ estado: "listo", sesiones: lista }))
      .catch((err: unknown) => vigente && setSesiones({ estado: "error", mensaje: mensajeDeError(err) }));
    return () => {
      vigente = false;
    };
  }, [intento]);

  const recargar = useCallback(() => {
    setSesiones({ estado: "cargando" });
    setIntento((actual) => actual + 1);
  }, []);
  return { sesiones, recargar };
}
