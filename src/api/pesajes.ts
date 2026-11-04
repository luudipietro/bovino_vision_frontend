import { apiGet, apiPostJson } from "./client";
import type { Pesaje, Uuid } from "./tipos";

/** Queues the estimation; the API answers 202 and the capture state must be polled. */
export function solicitarPesaje(idCaptura: Uuid): Promise<void> {
  return apiPostJson("/pesajes", { id_captura: idCaptura });
}

export function obtenerPesaje(idEvento: Uuid): Promise<Pesaje> {
  return apiGet(`/pesajes/${idEvento}`);
}
