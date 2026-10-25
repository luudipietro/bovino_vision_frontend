import { ChevronRight, Check, Minus, TrendingDown } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { resolverAlerta } from "../../api/alertas";
import { ApiError, mensajeDeError } from "../../api/client";
import type { Alerta } from "../../api/tipos";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import { formatearHace } from "../../lib/formato";
import { describirAlerta, nivelDePrioridad, type NivelPrioridad, TONO_POR_PRIORIDAD } from "./textos";

const iconoPorTipo = { perdida_peso: TrendingDown, estancamiento: Minus } as const;

const estiloIconoPorNivel: Record<NivelPrioridad, string> = {
  alta: "bg-danger-bg text-danger-text",
  media: "bg-warning-bg text-warning-text",
  baja: "bg-neutral-100 text-neutral-600",
};

const HTTP_CONFLICTO = 409;

interface AlertaCardProps {
  alerta: Alerta;
  /** Shows the resolve action; the parent decides it from the session permissions. */
  puedeResolver: boolean;
  /** Called once the alert is resolved, so the parent can drop the card. */
  onResuelta: (idAlerta: string) => void;
}

/** Alert card: type icon, animal, time, description, link to the animal and resolve action. */
export default function AlertaCard({ alerta, puedeResolver, onResuelta }: AlertaCardProps) {
  const [resolviendo, setResolviendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nivel = nivelDePrioridad(alerta.prioridad);
  const Icono = iconoPorTipo[alerta.tipo];

  async function resolver() {
    setResolviendo(true);
    setError(null);
    try {
      await resolverAlerta(alerta.id);
      onResuelta(alerta.id);
    } catch (err) {
      // 409: someone else already resolved it, so the card has nothing left to show.
      if (err instanceof ApiError && err.status === HTTP_CONFLICTO) return onResuelta(alerta.id);
      setError(mensajeDeError(err));
      setResolviendo(false);
    }
  }

  return (
    <li className="flex min-w-0 flex-col gap-3 rounded-[10px] border border-neutral-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] ${estiloIconoPorNivel[nivel]}`}
        >
          <Icono className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center justify-between gap-x-2 text-sm font-semibold text-neutral-800">
            <span className="tabular-nums">{alerta.animal_identificador}</span>
            <span className="text-xs font-normal text-neutral-500">{formatearHace(alerta.fecha_generacion)}</span>
          </p>
          <p className="mt-1 text-xs leading-5 text-neutral-600">{describirAlerta(alerta)}</p>
        </div>
        <Badge tone={TONO_POR_PRIORIDAD[nivel]} className="capitalize">
          {nivel}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <Link
          to={`/animales/${alerta.id_animal}`}
          className="flex min-h-11 items-center gap-1 text-xs font-medium text-neutral-500 hover:text-green-600"
        >
          Ver ficha
          <ChevronRight className="h-[18px] w-[18px]" />
        </Link>
        {puedeResolver && (
          <Button
            variant="secondary"
            icon={Check}
            onClick={resolver}
            disabled={resolviendo}
            className="ml-auto min-h-11"
          >
            {resolviendo ? "Resolviendo…" : "Resolver"}
          </Button>
        )}
      </div>

      {error && (
        <p role="alert" className="text-xs text-danger-text">
          No pudimos resolver la alerta. {error}
        </p>
      )}
    </li>
  );
}
