import { apiGet } from "./client";
import type { Raza } from "./tipos";

export function listarRazas(): Promise<Raza[]> {
  return apiGet("/razas");
}
