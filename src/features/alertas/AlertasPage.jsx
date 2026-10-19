import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarAlertasDelRodeo } from "../../api/alertas";
import Badge from "../../components/Badge";

const tonoPorPrioridad = {
  alta: "danger",
  media: "warning",
  baja: "neutral",
};

const estiloContenedorPorPrioridad = {
  alta: "border-red-200 bg-red-50",
  media: "border-amber-200 bg-amber-50",
  baja: "border-stone-200 bg-white",
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
      <h1 className="text-xl font-bold text-stone-900">Alertas del rodeo</h1>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {cargando && <p className="mt-4 text-sm text-stone-400">Cargando…</p>}
      {!cargando && alertas.length === 0 && (
        <p className="mt-4 text-sm text-stone-400">No hay alertas activas.</p>
      )}

      <ul className="mt-4 space-y-3">
        {alertas.map((alerta) => (
          <li
            key={alerta.id}
            className={`flex items-start gap-3 rounded-2xl border p-4 shadow-sm ${
              estiloContenedorPorPrioridad[alerta.prioridad] ?? estiloContenedorPorPrioridad.baja
            }`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-red-600 shadow-sm">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <Link
                  to={`/animales/${alerta.animal_id}`}
                  className="font-bold text-stone-900 hover:underline"
                >
                  {alerta.animal_identificador}
                </Link>
                <Badge tone={tonoPorPrioridad[alerta.prioridad] ?? "neutral"}>
                  {alerta.prioridad}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-stone-600">
                Variación de {alerta.variacion_pct > 0 ? "+" : ""}
                {alerta.variacion_pct}% respecto al pesaje anterior
              </p>
              <p className="mt-1 text-xs text-stone-400">
                {new Date(alerta.fecha_generacion).toLocaleString()}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
