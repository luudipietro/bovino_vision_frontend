import { apiGet, apiPostJson } from "./client";
import type { Alerta, Uuid } from "./tipos";

/** Marks an active alert as resolved (204); 409 when it already was. Needs `rodeo_gestionar`. */
export function resolverAlerta(idAlerta: Uuid): Promise<void> {
  return apiPostJson(`/alertas/${idAlerta}/resolver`);
}

/** Active alerts of the herd. */
export function listarAlertasDelRodeo(): Promise<Alerta[]> {
  return apiGet("/alertas");
}

export function listarAlertasDeAnimal(idAnimal: Uuid): Promise<Alerta[]> {
  return apiGet(`/animales/${idAnimal}/alertas`);
}
