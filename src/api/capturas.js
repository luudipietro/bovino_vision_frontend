import { apiGet, apiPostForm, apiPostJson } from "./client";

export function iniciarSesionCaptura() {
  return apiPostJson("/sesiones-captura", {});
}

export function subirCaptura({ sesionId, animalId, archivo }) {
  const formData = new FormData();
  formData.append("sesion_id", sesionId);
  formData.append("animal_id", animalId);
  formData.append("imagen", archivo);
  return apiPostForm("/capturas", formData);
}

export function listarCapturasDeSesion(sesionId) {
  return apiGet(`/sesiones-captura/${sesionId}/capturas`);
}
