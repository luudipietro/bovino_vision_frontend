import { apiGet } from "./client";

export function obtenerPanel({ loteId } = {}) {
  const params = new URLSearchParams();
  if (loteId) params.set("lote_id", loteId);
  const query = params.toString();
  return apiGet(`/panel${query ? `?${query}` : ""}`);
}

export function generarReporte({ desde, hasta, loteId }) {
  const params = new URLSearchParams({ desde, hasta });
  if (loteId) params.set("lote_id", loteId);
  return apiGet(`/reportes?${params.toString()}`);
}
