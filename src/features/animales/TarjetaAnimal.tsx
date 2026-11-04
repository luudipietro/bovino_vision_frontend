import { ChevronRight, PawPrint } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Animal, Lote } from "../../api/tipos";
import Badge from "../../components/Badge";
import FotoCaptura from "../../components/FotoCaptura";
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

/** Herd list item: photo of the latest weighing with the lot on top, SENASA ID, breed, last weight, GMD (with its share of the lot target) and alerts. */
export default function TarjetaAnimal({ animal, lote }: { animal: Animal; lote: Lote | null }) {
  const objetivo = porcentajeDeObjetivo(animal.gmd_kg_dia, lote?.gmd_objetivo ?? null);
  const alertas = animal.alertas_activas;

  return (
    <Link
      to={`/animales/${animal.id}`}
      className="group flex flex-col overflow-hidden rounded-[14px] border border-neutral-200 bg-white shadow-xs transition-colors hover:border-green-300"
    >
      <div className="relative h-36 shrink-0 overflow-hidden bg-green-900">
        {animal.id_imagen_ultimo_pesaje ? (
          <FotoCaptura idImagen={animal.id_imagen_ultimo_pesaje} alt={`Foto de ${animal.identificador}`} iconoGrande />
        ) : (
          <span
            role="img"
            aria-label="Sin foto: todavía no se pesó"
            className="flex h-full w-full items-center justify-center text-green-300/60"
          >
            <PawPrint className="h-10 w-10" />
          </span>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-green-900/80 px-3 py-0.5 text-xs font-semibold text-white ring-1 ring-white/20">
          {animal.lote_codigo ? `Lote ${animal.lote_codigo}` : "Sin lote"}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase text-neutral-400">ID SENASA</p>
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
      </div>
    </Link>
  );
}
