import { apiGet, apiPostJson, apiPutJson, query } from "./client";
import type {
  Animal,
  AsignacionLote,
  CambiosAnimal,
  FiltroAnimales,
  NuevoAnimal,
  PesajeHistorial,
  Uuid,
} from "./tipos";

export function listarAnimales({ idLote, q, conAlertasActivas }: FiltroAnimales = {}): Promise<Animal[]> {
  return apiGet(
    `/animales${query({ id_lote: idLote, q, con_alertas_activas: conAlertasActivas || undefined })}`,
  );
}

export function obtenerAnimal(idAnimal: Uuid): Promise<Animal> {
  return apiGet(`/animales/${idAnimal}`);
}

export function crearAnimal(datos: NuevoAnimal): Promise<Animal> {
  return apiPostJson("/animales", datos);
}

export function modificarAnimal(idAnimal: Uuid, cambios: CambiosAnimal): Promise<Animal> {
  return apiPutJson(`/animales/${idAnimal}`, cambios);
}

/** Weighing events of the animal, newest first. */
export function historialDePesajes(idAnimal: Uuid): Promise<PesajeHistorial[]> {
  return apiGet(`/animales/${idAnimal}/pesajes`);
}

/** Lot membership periods of the animal. */
export function historialDeLotes(idAnimal: Uuid): Promise<AsignacionLote[]> {
  return apiGet(`/animales/${idAnimal}/historial-lotes`);
}
