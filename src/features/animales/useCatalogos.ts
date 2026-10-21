import { useEffect, useState } from "react";
import { mensajeDeError } from "../../api/client";
import { listarLotes } from "../../api/lotes";
import { listarRazas } from "../../api/razas";
import type { Lote, Raza } from "../../api/tipos";

/** Breeds and lots used by the animal forms. */
export function useCatalogos() {
  const [razas, setRazas] = useState<Raza[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    Promise.all([listarRazas(), listarLotes()])
      .then(([listaRazas, listaLotes]) => {
        if (!vigente) return;
        setRazas(listaRazas);
        setLotes(listaLotes);
      })
      .catch((err: unknown) => vigente && setError(mensajeDeError(err)));
    return () => {
      vigente = false;
    };
  }, []);

  return { razas, lotes, error };
}
