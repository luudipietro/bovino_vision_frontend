import { useEffect, useState } from "react";
import { generarReporte, obtenerPanel } from "../../api/analitica";
import EvolucionChart from "../../components/EvolucionChart";

export default function PanelPage() {
  const [panel, setPanel] = useState(null);
  const [error, setError] = useState(null);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [reporte, setReporte] = useState(null);
  const [errorReporte, setErrorReporte] = useState(null);

  useEffect(() => {
    obtenerPanel()
      .then(setPanel)
      .catch((err) => setError(err.message));
  }, []);

  async function consultarReporte(event) {
    event.preventDefault();
    setErrorReporte(null);
    try {
      setReporte(await generarReporte({ desde, hasta }));
    } catch (err) {
      setErrorReporte(err.message);
    }
  }

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!panel) return <p className="text-sm text-gray-500">Cargando…</p>;

  return (
    <section>
      <h1 className="text-xl font-semibold text-gray-900">Panel del rodeo</h1>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Animales con pesajes" value={panel.cantidad_animales} />
        <StatCard
          label="Peso promedio"
          value={panel.peso_promedio_kg != null ? `${panel.peso_promedio_kg} kg` : "—"}
        />
        <StatCard
          label="GMD promedio"
          value={panel.gmd_promedio_kg_dia != null ? `${panel.gmd_promedio_kg_dia} kg/día` : "—"}
        />
      </div>

      <h2 className="mt-6 text-sm font-semibold text-gray-700">Evolución del peso promedio</h2>
      <div className="mt-2 rounded-md border border-gray-200 bg-white p-4">
        <EvolucionChart puntos={panel.evolucion_peso_promedio} />
      </div>

      <h2 className="mt-6 text-sm font-semibold text-gray-700">Reporte por lapso de tiempo</h2>
      <form onSubmit={consultarReporte} className="mt-2 flex flex-wrap items-end gap-2">
        <label className="text-sm text-gray-600">
          Desde
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            required
            className="mt-1 block rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </label>
        <label className="text-sm text-gray-600">
          Hasta
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            required
            className="mt-1 block rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Generar
        </button>
      </form>

      {errorReporte && <p className="mt-2 text-sm text-red-600">{errorReporte}</p>}

      {reporte && (
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Pesajes en el período" value={reporte.cantidad_pesajes} />
          <StatCard
            label="Peso promedio"
            value={reporte.peso_promedio_kg != null ? `${reporte.peso_promedio_kg} kg` : "—"}
          />
          <StatCard
            label="GMD promedio"
            value={
              reporte.gmd_promedio_kg_dia != null ? `${reporte.gmd_promedio_kg_dia} kg/día` : "—"
            }
          />
        </div>
      )}
    </section>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}
