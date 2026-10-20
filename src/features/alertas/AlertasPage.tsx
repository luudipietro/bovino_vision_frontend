import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarAlertasDelRodeo } from "../../api/alertas";
import { mensajeDeError } from "../../api/client";
import type { Alerta } from "../../api/tipos";
import Badge from "../../components/Badge";
import { describirAlerta, type NivelPrioridad, nivelDePrioridad, TONO_POR_PRIORIDAD } from "./textos";

const estiloContenedorPorPrioridad: Record<NivelPrioridad, string> = {
  alta: "border-red-200 bg-red-50",
  media: "border-amber-200 bg-amber-50",
  baja: "border-stone-200 bg-white",
};

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listarAlertasDelRodeo()
      .then(setAlertas)
      .catch((err: unknown) => setError(mensajeDeError(err)))
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
        {alertas.map((alerta) => {
          const nivel = nivelDePrioridad(alerta.prioridad);
          return (
          <li
            key={alerta.id}
            className={`flex items-start gap-3 rounded-2xl border p-4 shadow-sm ${estiloContenedorPorPrioridad[nivel]}`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-red-600 shadow-sm">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <Link
                  to={`/animales/${alerta.id_animal}`}
                  className="font-bold text-stone-900 hover:underline"
                >
                  {alerta.animal_identificador}
                </Link>
                <Badge tone={TONO_POR_PRIORIDAD[nivel]}>{nivel}</Badge>
              </div>
              <p className="mt-1 text-sm text-stone-600">{describirAlerta(alerta)}</p>
              <p className="mt-1 text-xs text-stone-400">
                {new Date(alerta.fecha_generacion).toLocaleString()}
              </p>
            </div>
          </li>
          );
        })}
      </ul>
    </section>
  );
}
