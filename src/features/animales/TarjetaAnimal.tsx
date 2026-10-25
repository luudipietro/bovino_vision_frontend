import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Animal, Lote } from "../../api/tipos";
import Badge from "../../components/Badge";
import { formatearKg, formatearNumero, formatearPorcentaje } from "../../lib/formato";
import { formatearGmd } from "../alertas/textos";
import { porcentajeDeObjetivo } from "./rodeo";

function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-medium uppercase text-neutral-400">{etiqueta}</dt>
      <dd className="mt-0.5 truncate text-sm font-semibold tabular-nums text-neutral-800">{children}</dd>
    </div>
  );
}

/** Herd list item: lot, SENASA ID, breed, last weight, GMD (with its share of the lot target) and alerts. */
export default function TarjetaAnimal({ animal, lote }: { animal: Animal; lote: Lote | null }) {
  const objetivo = porcentajeDeObjetivo(animal.gmd_kg_dia, lote?.gmd_objetivo ?? null);
  const alertas = animal.alertas_activas;

  return (
    <Link
      to={`/animales/${animal.id}`}
      className="group flex flex-col gap-4 rounded-[14px] border border-neutral-200 bg-white p-5 shadow-xs transition-colors hover:border-green-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Badge tone="earth">{animal.lote_codigo ? `Lote ${animal.lote_codigo}` : "Sin lote"}</Badge>
          <p className="mt-3 text-[10px] font-medium uppercase text-neutral-400">ID SENASA</p>
          <p className="truncate text-base font-bold text-neutral-800">{animal.identificador}</p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-neutral-400 transition-colors group-hover:text-green-800" />
      </div>

      <dl className="grid grid-cols-3 gap-3">
        <Dato etiqueta="Raza">
          <span className="font-medium text-brown-600">{animal.raza ?? "Sin registrar"}</span>
        </Dato>
        <Dato etiqueta="Último peso">
          {animal.ultimo_peso_kg != null ? formatearKg(animal.ultimo_peso_kg, 1) : "Sin pesajes"}
        </Dato>
        <Dato etiqueta="GMD">{animal.gmd_kg_dia != null ? formatearGmd(animal.gmd_kg_dia) : "—"}</Dato>
      </dl>

      <div className="flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3">
        {alertas > 0 ? (
          <Badge tone="danger">
            {alertas === 1 ? "1 alerta activa" : `${formatearNumero(alertas)} alertas activas`}
          </Badge>
        ) : (
          <Badge tone="brand">Sin alertas activas</Badge>
        )}
        {objetivo != null && (
          <span className="text-xs text-neutral-500">{formatearPorcentaje(objetivo)} del objetivo</span>
        )}
      </div>
    </Link>
  );
}
