import type { BadgeTone } from "../../components/Badge";
import type { TipoAlerta } from "../../api/tipos";
import { formatearNumero } from "../../lib/formato";

export const ETIQUETAS: Record<TipoAlerta, string> = {
  perdida_peso: "Pérdida de peso",
  estancamiento: "Estancamiento",
};

export type NivelPrioridad = "alta" | "media" | "baja";

/** Priority 1 is the most urgent; the API rules use 1 for weight loss and 2 for stagnation. */
export function nivelDePrioridad(prioridad: number): NivelPrioridad {
  if (prioridad <= 1) return "alta";
  if (prioridad === 2) return "media";
  return "baja";
}

export const TONO_POR_PRIORIDAD: Record<NivelPrioridad, BadgeTone> = {
  alta: "danger",
  media: "warning",
  baja: "neutral",
};

export function formatearGmd(gmd: number): string {
  return `${gmd > 0 ? "+" : ""}${formatearNumero(gmd, 2)} kg/día`;
}

/** One-line summary: type, interval GMD and, for stagnation, the lot target. */
export function describirAlerta(alerta: {
  tipo: TipoAlerta;
  variacion: number;
  gmd_esperada: number | null;
}): string {
  const objetivo =
    alerta.tipo === "estancamiento" && alerta.gmd_esperada != null
      ? ` (objetivo ${formatearGmd(alerta.gmd_esperada)})`
      : "";
  return `${ETIQUETAS[alerta.tipo]}: GMD ${formatearGmd(alerta.variacion)}${objetivo}`;
}
