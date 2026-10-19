import { apiGet } from "./client";

export function listarAlertasDelRodeo() {
  return apiGet("/alertas");
}

export function listarAlertasDeAnimal(animalId) {
  return apiGet(`/animales/${animalId}/alertas`);
}
