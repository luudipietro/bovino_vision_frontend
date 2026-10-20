import { formatearFechaCorta, formatearKg } from "../lib/formato";
import LineChart from "./LineChart";

export interface PuntoGrafico {
  fecha: string;
  peso_promedio_kg: number | null;
}

/** Temporary adapter over LineChart until every screen uses it directly. */
export default function EvolucionChart({ puntos }: { puntos: PuntoGrafico[] }) {
  return (
    <LineChart
      labels={puntos.map((p) => formatearFechaCorta(p.fecha))}
      series={[{ name: "Peso promedio", values: puntos.map((p) => p.peso_promedio_kg) }]}
      formatValue={(valor) => formatearKg(valor, 1)}
      formatAxis={(valor) => formatearKg(valor)}
      ariaLabel="Evolución del peso promedio"
    />
  );
}
