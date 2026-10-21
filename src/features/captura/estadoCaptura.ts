import type { EstadoCaptura } from "../../api/tipos";
import type { BadgeTone } from "../../components/Badge";

const ESTADOS: Record<EstadoCaptura, { texto: string; tono: BadgeTone }> = {
  registrada: { texto: "Sin procesar", tono: "neutral" },
  pendiente: { texto: "Estimando", tono: "warning" },
  procesando: { texto: "Estimando", tono: "warning" },
  procesada: { texto: "Pesada", tono: "brand" },
  fallida: { texto: "Falló", tono: "danger" },
};

/** Label shown for a capture of the session; queued and in-progress read the same to the operator. */
export function estadoDeCaptura(estado: EstadoCaptura): { texto: string; tono: BadgeTone } {
  return ESTADOS[estado];
}
