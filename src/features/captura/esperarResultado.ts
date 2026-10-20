import type { Captura, Pesaje, Uuid } from "../../api/tipos";

export type ResultadoCaptura =
  | { tipo: "estimado"; captura: Captura; pesaje: Pesaje }
  | { tipo: "fallido"; captura: Captura };

export interface DependenciasEspera {
  obtenerCaptura: (idCaptura: Uuid) => Promise<Captura>;
  obtenerPesaje: (idEvento: Uuid) => Promise<Pesaje>;
  esperar: () => Promise<void>;
  /** False once the operator left the screen; late responses are then ignored. */
  sigueVigente: () => boolean;
  alActualizar: (captura: Captura) => void;
}

/**
 * Polls the capture until the background estimation ends in `procesada` or `fallida`.
 * Resolves null when it stopped being current; request errors are propagated.
 */
export async function esperarResultado(
  idCaptura: Uuid,
  { obtenerCaptura, obtenerPesaje, esperar, sigueVigente, alActualizar }: DependenciasEspera,
): Promise<ResultadoCaptura | null> {
  for (;;) {
    const actual = await obtenerCaptura(idCaptura);
    if (!sigueVigente()) return null;
    alActualizar(actual);
    if (actual.estado === "fallida") return { tipo: "fallido", captura: actual };
    if (actual.estado === "procesada" && actual.id_evento_pesaje) {
      const pesaje = await obtenerPesaje(actual.id_evento_pesaje);
      return sigueVigente() ? { tipo: "estimado", captura: actual, pesaje } : null;
    }
    await esperar();
    if (!sigueVigente()) return null;
  }
}
