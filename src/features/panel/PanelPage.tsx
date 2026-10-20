import { AlertTriangle, PawPrint, Scale, TrendingUp } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { listarAlertasDelRodeo } from "../../api/alertas";
import { generarReporte, obtenerPanel } from "../../api/analitica";
import { mensajeDeError } from "../../api/client";
import type { Panel, Reporte } from "../../api/tipos";
import EvolucionChart from "../../components/EvolucionChart";
import StatCard from "../../components/StatCard";

export default function PanelPage() {
  const [panel, setPanel] = useState<Panel | null>(null);
  const [cantidadAlertas, setCantidadAlertas] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [reporte, setReporte] = useState<Reporte | null>(null);
  const [errorReporte, setErrorReporte] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([obtenerPanel(), listarAlertasDelRodeo()])
      .then(([datosPanel, alertas]) => {
        setPanel(datosPanel);
        setCantidadAlertas(alertas.length);
      })
      .catch((err: unknown) => setError(mensajeDeError(err)));
  }, []);

  async function consultarReporte(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorReporte(null);
    try {
      setReporte(await generarReporte({ desde, hasta }));
    } catch (err) {
      setErrorReporte(mensajeDeError(err));
    }
  }

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!panel) return <p className="text-sm text-stone-400">Cargando…</p>;

  return (
    <section>
      <h1 className="text-xl font-bold text-stone-900">Panel del rodeo</h1>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={PawPrint} label="Animales" value={panel.cantidad_animales} />
        <StatCard
          icon={Scale}
          label="Peso promedio"
          value={panel.peso_promedio_kg != null ? `${panel.peso_promedio_kg} kg` : "—"}
        />
        <StatCard
          icon={TrendingUp}
          label="GMD promedio"
          value={panel.gmd_promedio_kg_dia != null ? `${panel.gmd_promedio_kg_dia} kg/día` : "—"}
        />
        <StatCard
          icon={AlertTriangle}
          label="Alertas activas"
          value={cantidadAlertas}
          tone={cantidadAlertas > 0 ? "danger" : "neutral"}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-stone-700">
          <TrendingUp className="h-4 w-4" /> Evolución del peso promedio
        </p>
        <div className="mt-3">
          <EvolucionChart puntos={panel.evolucion_peso_promedio} />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-stone-700">Reporte por lapso de tiempo</p>
        <form onSubmit={consultarReporte} className="mt-3 flex flex-wrap items-end gap-2">
          <label className="text-sm text-stone-500">
            Desde
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              required
              className="mt-1 block rounded-xl border border-stone-300 px-2 py-1.5 text-sm focus:border-green-700 focus:outline-none"
            />
          </label>
          <label className="text-sm text-stone-500">
            Hasta
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              required
              className="mt-1 block rounded-xl border border-stone-300 px-2 py-1.5 text-sm focus:border-green-700 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="rounded-xl bg-green-900 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
          >
            Generar
          </button>
        </form>

        {errorReporte && <p className="mt-2 text-sm text-red-600">{errorReporte}</p>}

        {reporte && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Pesajes en el período" value={reporte.cantidad_pesajes} />
            <StatCard icon={PawPrint} label="Animales pesados" value={reporte.cantidad_animales} />
            <StatCard
              icon={Scale}
              label="Peso promedio"
              value={reporte.peso_promedio_kg != null ? `${reporte.peso_promedio_kg} kg` : "—"}
            />
            <StatCard
              icon={TrendingUp}
              label="GMD promedio"
              value={
                reporte.gmd_promedio_kg_dia != null
                  ? `${reporte.gmd_promedio_kg_dia} kg/día`
                  : "—"
              }
            />
          </div>
        )}
      </div>
    </section>
  );
}
