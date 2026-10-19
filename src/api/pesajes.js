import { apiGet, apiPostJson } from "./client";

export function procesarPesaje(capturaId) {
  return apiPostJson("/pesajes", { captura_id: capturaId });
}

export function obtenerPesaje(eventoId) {
  return apiGet(`/pesajes/${eventoId}`);
}
