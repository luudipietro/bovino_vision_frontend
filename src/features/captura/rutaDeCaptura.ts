import type { Uuid } from "../../api/tipos";

const PARAMETRO_ANIMAL = "animal";

/** Capture page that starts with this animal already identified ("Pesar este animal"). */
export function rutaDeCapturaParaAnimal(idAnimal: Uuid): string {
  return `/captura?${new URLSearchParams({ [PARAMETRO_ANIMAL]: idAnimal })}`;
}

/** The animal a capture link asks for, or null when it carries none. */
export function idAnimalDeConsulta(parametros: URLSearchParams): Uuid | null {
  const id = parametros.get(PARAMETRO_ANIMAL)?.trim();
  return id ? id : null;
}

/** Detail of a capture session: its photos and their state. */
export function rutaDeSesion(idSesion: Uuid): string {
  return `/captura/sesiones/${idSesion}`;
}
