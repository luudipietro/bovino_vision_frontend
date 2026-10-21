// Shapes of the BovinoVision .NET API (snake_case JSON, UUIDs as strings, dates as ISO 8601).

export type Uuid = string;
/** ISO 8601 date-time with offset, e.g. "2026-10-11T13:00:00+00:00". */
export type FechaHora = string;
/** Calendar date, e.g. "2026-10-11". */
export type Fecha = string;

export type Sexo = "macho" | "hembra";

export interface Raza {
  id: Uuid;
  nombre: string;
}

export interface Lote {
  id: Uuid;
  codigo: string;
  nombre: string | null;
  gmd_objetivo: number | null;
  cantidad_animales: number;
}

export interface NuevoLote {
  codigo: string;
  nombre?: string | null;
  gmd_objetivo?: number | null;
}

/** Null values keep the stored data. */
export type CambiosLote = Omit<NuevoLote, "codigo">;

export interface Animal {
  id: Uuid;
  identificador: string;
  id_establecimiento: Uuid;
  id_lote: Uuid | null;
  lote_codigo: string | null;
  id_raza: Uuid | null;
  raza: string | null;
  sexo: Sexo | null;
  fecha_nacimiento: Fecha | null;
  ultimo_peso_kg: number | null;
  alertas_activas: number;
}

export interface NuevoAnimal {
  identificador: string;
  id_raza?: Uuid | null;
  sexo?: Sexo | null;
  fecha_nacimiento?: Fecha | null;
  id_lote?: Uuid | null;
}

export type CambiosAnimal = Omit<NuevoAnimal, "identificador">;

/** One period of the animal in a lot; `vigente_hasta` is null for the current one. */
export interface AsignacionLote {
  id_lote: Uuid;
  lote_codigo: string;
  vigente_desde: FechaHora;
  vigente_hasta: FechaHora | null;
}

export interface FiltroAnimales {
  idLote?: Uuid | null;
  q?: string;
  conAlertasActivas?: boolean;
}

export type EstadoSesionCaptura = "activa" | "finalizada";

export interface SesionCaptura {
  id: Uuid;
  id_usuario: Uuid;
  fecha_inicio: FechaHora;
  fecha_fin: FechaHora | null;
  estado: EstadoSesionCaptura;
}

export type EstadoCaptura = "registrada" | "pendiente" | "procesando" | "procesada" | "fallida";

export interface Captura {
  id: Uuid;
  id_sesion: Uuid;
  id_animal: Uuid;
  fecha_captura: FechaHora;
  estado: EstadoCaptura;
  motivo_fallo: string | null;
  intentos: number;
  fecha_revision: FechaHora | null;
  id_evento_pesaje: Uuid | null;
}

export interface CapturaDeSesion {
  id: Uuid;
  id_animal: Uuid;
  animal_identificador: string;
  fecha_captura: FechaHora;
  estado: EstadoCaptura;
  motivo_fallo: string | null;
  id_evento_pesaje: Uuid | null;
}

export type TipoAlerta = "perdida_peso" | "estancamiento";
export type EstadoAlerta = "activa" | "resuelta";

/** Alert attached to a weighing event; `variacion` is the interval GMD in kg/day. */
export interface AlertaDePesaje {
  id: Uuid;
  id_evento: Uuid;
  tipo: TipoAlerta;
  /** 1 is the most urgent. */
  prioridad: number;
  variacion: number;
  gmd_esperada: number | null;
  version_regla: string;
  estado: EstadoAlerta;
  fecha_generacion: FechaHora;
}

export interface Alerta {
  id: Uuid;
  id_evento: Uuid;
  id_animal: Uuid;
  animal_identificador: string;
  tipo: TipoAlerta;
  prioridad: number;
  variacion: number;
  gmd_esperada: number | null;
  estado: EstadoAlerta;
  fecha_generacion: FechaHora;
}

export interface PesoPrevio {
  peso_kg: number;
  fecha_pesaje: FechaHora;
}

export interface Pesaje {
  id: Uuid;
  id_animal: Uuid;
  id_captura: Uuid;
  estado: string;
  peso_kg: number;
  fecha_pesaje: FechaHora;
  version_modelo: string;
  animal_identificador: string;
  lote_codigo: string | null;
  ultimo_peso_previo: PesoPrevio | null;
  alerta: AlertaDePesaje | null;
}

export interface PesajeHistorial {
  id: Uuid;
  peso_kg: number;
  fecha_pesaje: FechaHora;
  fecha_procesamiento: FechaHora;
  version_modelo: string;
  id_imagen_utilizada: Uuid;
  lote_codigo: string | null;
  /** GMD against the previous weighing; null for the first one or same-day weighings. */
  gmd_kg_dia: number | null;
}

export interface PuntoEvolucion {
  fecha: Fecha;
  peso_promedio_kg: number | null;
}

export interface Panel {
  cantidad_animales: number;
  peso_promedio_kg: number | null;
  gmd_promedio_kg_dia: number | null;
  animales_con_gmd: number;
  evolucion_peso_promedio: PuntoEvolucion[];
}

export interface Reporte {
  desde: Fecha;
  hasta: Fecha;
  cantidad_pesajes: number;
  cantidad_animales: number;
  peso_promedio_kg: number | null;
  gmd_promedio_kg_dia: number | null;
}
