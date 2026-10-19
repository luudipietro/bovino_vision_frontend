import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarAlertasDelRodeo } from "../../api/alertas";

const estiloPorPrioridad = {
  alta: "border-red-300 bg-red-50 text-red-800",
  media: "border-amber-300 bg-amber-50 text-amber-800",
  baja: "border-gray-300 bg-gray-50 text-gray-700",
};

export default function AlertasPage() {
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    listarAlertasDelRodeo()
      .then(setAlertas)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  return (
    <section>
      <h1 className="text-xl font-semibold text-gray-900">Alertas del rodeo</h1>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {cargando && <p className="mt-4 text-sm text-gray-500">Cargando…</p>}
      {!cargando && alertas.length === 0 && (
        <p className="mt-4 text-sm text-gray-500">No hay alertas activas.</p>
      )}

      <ul className="mt-4 space-y-2">
        {alertas.map((alerta) => (
          <li
            key={alerta.id}
            className={`rounded-md border p-4 text-sm ${
              estiloPorPrioridad[alerta.prioridad] ?? estiloPorPrioridad.baja
            }`}
          >
            <div className="flex items-center justify-between">
              <Link to={`/animales/${alerta.animal_id}`} className="font-medium hover:underline">
                {alerta.animal_identificador}
              </Link>
              <span className="text-xs uppercase">{alerta.prioridad}</span>
            </div>
            <p className="mt-1">
              Variación de {alerta.variacion_pct > 0 ? "+" : ""}
              {alerta.variacion_pct}% respecto al pesaje anterior
            </p>
            <p className="mt-1 text-xs opacity-75">
              {new Date(alerta.fecha_generacion).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
