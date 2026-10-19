import { apiGet, apiPostJson, apiPutJson } from "./client";

export function listarAnimales({ loteId, q } = {}) {
  const params = new URLSearchParams();
  if (loteId) params.set("lote_id", loteId);
  if (q) params.set("q", q);
  const query = params.toString();
  return apiGet(`/animales${query ? `?${query}` : ""}`);
}

export function obtenerAnimal(animalId) {
  return apiGet(`/animales/${animalId}`);
}

export function crearAnimal({ identificador, loteId }) {
  return apiPostJson("/animales", { identificador, lote_id: loteId ?? null });
}

export function modificarAnimal(animalId, cambios) {
  return apiPutJson(`/animales/${animalId}`, cambios);
}

export function historialDePesajes(animalId) {
  return apiGet(`/animales/${animalId}/pesajes`);
}
