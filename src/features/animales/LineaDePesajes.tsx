import type { PesajeHistorial } from "../../api/tipos";
import Badge from "../../components/Badge";
import FotoCaptura from "../../components/FotoCaptura";
import { formatearFechaHora, formatearKg } from "../../lib/formato";
import { formatearGmd } from "../alertas/textos";

/** Vertical timeline of weighings (newest first): date on the left, weight and lot on the right. */
export default function LineaDePesajes({ pesajes }: { pesajes: PesajeHistorial[] }) {
  return (
    <ol className="relative">
      {pesajes.map((pesaje, indice) => {
        const [fecha, hora] = formatearFechaHora(pesaje.fecha_pesaje).split(", ");
        const esUltimo = indice === pesajes.length - 1;
        return (
          <li key={pesaje.id} className="relative grid grid-cols-[72px_1fr] gap-4 pb-6 last:pb-0">
            {!esUltimo && (
              <span
                aria-hidden="true"
                className="absolute left-[88px] top-3 bottom-0 w-px -translate-x-1/2 bg-green-200"
              />
            )}
            <div className="pt-0.5 text-right">
              <p className="text-xs font-semibold text-neutral-800">{fecha}</p>
              {hora && <p className="text-[11px] text-neutral-500">{hora}</p>}
            </div>
            <div className="relative flex min-w-0 items-start justify-between gap-3 pl-6">
              <span
                aria-hidden="true"
                className="absolute left-0 top-1.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-green-500 ring-4 ring-green-100"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold tabular-nums text-neutral-800">
                    {formatearKg(pesaje.peso_kg, 1)}
                  </p>
                  {pesaje.gmd_kg_dia != null && (
                    <Badge tone={pesaje.gmd_kg_dia >= 0 ? "brand" : "danger"}>
                      GMD {formatearGmd(pesaje.gmd_kg_dia)}
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {pesaje.lote_codigo ? `Lote ${pesaje.lote_codigo}` : "Sin lote"}
                </p>
              </div>
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[8px] bg-green-900">
                <FotoCaptura
                  idImagen={pesaje.id_imagen_utilizada}
                  alt={`Foto del pesaje del ${fecha}`}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
