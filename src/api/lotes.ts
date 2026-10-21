import { apiGet, apiPostJson, apiPutJson } from "./client";
import type { CambiosLote, Lote, NuevoLote, Uuid } from "./tipos";

export function listarLotes(): Promise<Lote[]> {
  return apiGet("/lotes");
}

export function crearLote(datos: NuevoLote): Promise<Lote> {
  return apiPostJson("/lotes", datos);
}

/** Answers 422 when the target is not positive. */
export function modificarLote(idLote: Uuid, cambios: CambiosLote): Promise<Lote> {
  return apiPutJson(`/lotes/${idLote}`, cambios);
}
