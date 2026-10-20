import { apiGet, apiPostJson } from "./client";
import type { Lote, NuevoLote } from "./tipos";

export function listarLotes(): Promise<Lote[]> {
  return apiGet("/lotes");
}

export function crearLote(datos: NuevoLote): Promise<Lote> {
  return apiPostJson("/lotes", datos);
}
