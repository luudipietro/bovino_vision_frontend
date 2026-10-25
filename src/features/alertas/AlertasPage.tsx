import { BellRing } from "lucide-react";
import { useEffect, useState } from "react";
import { listarAlertasDelRodeo } from "../../api/alertas";
import { mensajeDeError } from "../../api/client";
import type { Alerta } from "../../api/tipos";
import Badge from "../../components/Badge";
import Card from "../../components/Card";
import { EmptyState, Loading, Notice } from "../../components/Feedback";
import PageHeader from "../../components/PageHeader";
import { usePermisos } from "../auth/useSesion";
import AlertaCard from "./AlertaCard";
import { puedeResolverAlertas } from "./tarjetas";
import { type NivelPrioridad, nivelDePrioridad, TONO_POR_PRIORIDAD } from "./textos";

const NIVELES: NivelPrioridad[] = ["alta", "media", "baja"];

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const puedeResolver = puedeResolverAlertas(usePermisos());

  useEffect(() => {
    listarAlertasDelRodeo()
      .then(setAlertas)
      .catch((err: unknown) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false));
  }, []);

  const porNivel = (nivel: NivelPrioridad) =>
    alertas.filter((alerta) => nivelDePrioridad(alerta.prioridad) === nivel).length;

  return (
    <section className="min-w-0 space-y-6">
      <PageHeader
        title="Alertas del rodeo"
        subtitle="Animales con pérdida de peso o GMD por debajo del objetivo de su lote."
      />

      {error && <Notice tone="danger">{error}</Notice>}
      {cargando && <Loading />}
      {!cargando && !error && alertas.length === 0 && (
        <EmptyState icon={BellRing} title="No hay alertas activas">
          El rodeo está dentro de los objetivos de ganancia de peso.
        </EmptyState>
      )}

      {alertas.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2">
            {NIVELES.map((nivel) => (
              <Badge key={nivel} tone={TONO_POR_PRIORIDAD[nivel]}>
                {porNivel(nivel)} de prioridad {nivel}
              </Badge>
            ))}
          </div>

          <Card>
            <h2 className="text-lg font-semibold text-neutral-800">Actividad reciente</h2>
            <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {alertas.map((alerta) => (
                <AlertaCard
                  key={alerta.id}
                  alerta={alerta}
                  puedeResolver={puedeResolver}
                  onResuelta={(id) => setAlertas((actuales) => actuales.filter((a) => a.id !== id))}
                />
              ))}
            </ul>
          </Card>
        </>
      )}
    </section>
  );
}
