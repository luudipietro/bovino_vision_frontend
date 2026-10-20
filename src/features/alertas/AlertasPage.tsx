import { BellRing, ChevronRight, Minus, TrendingDown } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarAlertasDelRodeo } from "../../api/alertas";
import { mensajeDeError } from "../../api/client";
import type { Alerta } from "../../api/tipos";
import Badge from "../../components/Badge";
import Card from "../../components/Card";
import { EmptyState, Loading, Notice } from "../../components/Feedback";
import PageHeader from "../../components/PageHeader";
import { formatearHace } from "../../lib/formato";
import { ETIQUETAS, formatearGmd, type NivelPrioridad, nivelDePrioridad, TONO_POR_PRIORIDAD } from "./textos";

const NIVELES: NivelPrioridad[] = ["alta", "media", "baja"];

const iconoPorTipo = { perdida_peso: TrendingDown, estancamiento: Minus } as const;

const estiloIconoPorNivel: Record<NivelPrioridad, string> = {
  alta: "bg-danger-bg text-danger-text",
  media: "bg-warning-bg text-warning-text",
  baja: "bg-neutral-100 text-neutral-600",
};

function Dato({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase text-neutral-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-neutral-800">{children}</p>
    </div>
  );
}

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
            <ul className="mt-4 space-y-3">
              {alertas.map((alerta) => {
                const nivel = nivelDePrioridad(alerta.prioridad);
                const Icono = iconoPorTipo[alerta.tipo];
                return (
                  <li
                    key={alerta.id}
                    className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[10px] border border-neutral-200 bg-white px-4 py-4 md:px-6"
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px] ${estiloIconoPorNivel[nivel]}`}
                    >
                      <Icono className="h-[22px] w-[22px]" />
                    </span>
                    <div className="min-w-0 flex-1 basis-40">
                      <p className="text-sm font-semibold text-neutral-800">{ETIQUETAS[alerta.tipo]}</p>
                      <p className="mt-0.5 text-xs text-neutral-500">{formatearHace(alerta.fecha_generacion)}</p>
                    </div>
                    <div className="flex flex-wrap gap-x-8 gap-y-2">
                      <Dato label="Animal">
                        <Link to={`/animales/${alerta.id_animal}`} className="hover:underline">
                          {alerta.animal_identificador}
                        </Link>
                      </Dato>
                      <Dato label="GMD del intervalo">{formatearGmd(alerta.variacion)}</Dato>
                      {alerta.tipo === "estancamiento" && alerta.gmd_esperada != null && (
                        <Dato label="Objetivo">{formatearGmd(alerta.gmd_esperada)}</Dato>
                      )}
                    </div>
                    <Badge tone={TONO_POR_PRIORIDAD[nivel]} className="capitalize">
                      {nivel}
                    </Badge>
                    <Link
                      to={`/animales/${alerta.id_animal}`}
                      className="flex min-h-11 items-center gap-1 text-xs font-medium text-neutral-500 hover:text-green-600"
                    >
                      Ver ficha
                      <ChevronRight className="h-[18px] w-[18px]" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
        </>
      )}
    </section>
  );
}
