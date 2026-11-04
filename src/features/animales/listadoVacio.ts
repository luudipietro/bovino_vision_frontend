import type { Uuid } from "../../api/tipos";

export interface FiltrosDelListado {
  busqueda: string;
  idLote: Uuid | null;
  conAlertasActivas: boolean;
}

/** Whether something narrows the list of animals (a search of only spaces does not). */
function hayFiltros({ busqueda, idLote, conAlertasActivas }: FiltrosDelListado): boolean {
  return busqueda.trim() !== "" || idLote !== null || conAlertasActivas;
}

export type MotivoListadoVacio = "con_filtros" | "sin_animales";

/** Why an empty list is empty: the filters left nothing, or the herd has no animals yet (CU-19). */
export function motivoDeListadoVacio(filtros: FiltrosDelListado): MotivoListadoVacio {
  return hayFiltros(filtros) ? "con_filtros" : "sin_animales";
}
