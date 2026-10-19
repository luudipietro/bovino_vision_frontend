import { apiGet, apiPostJson } from "./client";

export function listarLotes() {
  return apiGet("/lotes");
}

export function crearLote(codigo) {
  return apiPostJson("/lotes", { codigo });
}
