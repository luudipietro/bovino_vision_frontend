import { apiGet, query } from "./client";
import type { Fecha, Panel, Reporte, Uuid } from "./tipos";

export function obtenerPanel({ idLote }: { idLote?: Uuid | null } = {}): Promise<Panel> {
  return apiGet(`/panel${query({ id_lote: idLote })}`);
}

/** Answers 422 when `desde` is after `hasta`. */
export function generarReporte({
  desde,
  hasta,
  idLote,
}: {
  desde: Fecha;
  hasta: Fecha;
  idLote?: Uuid | null;
}): Promise<Reporte> {
  return apiGet(`/reportes${query({ desde, hasta, id_lote: idLote })}`);
}
