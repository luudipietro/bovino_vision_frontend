import { apiDelete, apiGet, apiPostForm, apiPostJson } from "./client";
import type { Captura, CapturaDeSesion, SesionCaptura, Uuid } from "./tipos";

export function iniciarSesionCaptura(): Promise<SesionCaptura> {
  return apiPostJson("/sesiones-captura");
}

/** Registers the photo; the API answers 422 when the image is not acceptable. */
export function subirCaptura({
  idSesion,
  idAnimal,
  archivo,
}: {
  idSesion: Uuid;
  idAnimal: Uuid;
  archivo: File;
}): Promise<Captura> {
  const formData = new FormData();
  formData.append("id_sesion", idSesion);
  formData.append("id_animal", idAnimal);
  formData.append("imagen", archivo);
  return apiPostForm("/capturas", formData);
}

export function obtenerCaptura(idCaptura: Uuid): Promise<Captura> {
  return apiGet(`/capturas/${idCaptura}`);
}

/** Operator acknowledges the result (CU-15); it never changes the weighing event. */
export function confirmarCaptura(idCaptura: Uuid): Promise<Captura> {
  return apiPostJson(`/capturas/${idCaptura}/confirmar`);
}

/** Discards a photo that was not sent to estimation (204); the API answers 422 for any other state. */
export function descartarCaptura(idCaptura: Uuid): Promise<void> {
  return apiDelete(`/capturas/${idCaptura}`);
}

export function listarCapturasDeSesion(idSesion: Uuid): Promise<CapturaDeSesion[]> {
  return apiGet(`/sesiones-captura/${idSesion}/capturas`);
}
