import { apiGet } from "./client";
import type { Alerta, Uuid } from "./tipos";

/** Active alerts of the herd. */
export function listarAlertasDelRodeo(): Promise<Alerta[]> {
  return apiGet("/alertas");
}

export function listarAlertasDeAnimal(idAnimal: Uuid): Promise<Alerta[]> {
  return apiGet(`/animales/${idAnimal}/alertas`);
}
