import { PawPrint } from "lucide-react";
import { useState } from "react";
import type { Animal } from "../../../api/tipos";
import Badge from "../../../components/Badge";
import Card from "../../../components/Card";
import { formatearKg, formatearNumero } from "../../../lib/formato";
import { chipsDeFicha } from "../../animales/rodeo";

/** Desktop side card: the animal being weighed, or a hint while none is chosen. */
export default function AnimalEnCaptura({ animal }: { animal: Animal | null }) {
  const [hoy] = useState(() => new Date());

  if (!animal) {
    return (
      <Card className="flex items-center gap-3 md:p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-green-100 text-green-600">
          <PawPrint className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-neutral-800">Todavía no elegiste el animal</p>
          <p className="text-xs text-neutral-500">Buscalo por su caravana para empezar.</p>
        </div>
      </Card>
    );
  }

  const datos = [
    { etiqueta: "Último peso", valor: animal.ultimo_peso_kg == null ? "—" : formatearKg(animal.ultimo_peso_kg, 1) },
    { etiqueta: "GMD", valor: animal.gmd_kg_dia == null ? "—" : `${formatearNumero(animal.gmd_kg_dia, 2)} kg/día` },
  ];

  return (
    <Card className="md:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Animal en captura</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-neutral-800">{animal.identificador}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {chipsDeFicha(animal, hoy).map((chip) => (
          <Badge key={chip} tone="earth">
            {chip}
          </Badge>
        ))}
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-neutral-200 pt-4">
        {datos.map(({ etiqueta, valor }) => (
          <div key={etiqueta}>
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">{etiqueta}</dt>
            <dd className="mt-0.5 text-base font-bold tabular-nums text-neutral-800">{valor}</dd>
          </div>
        ))}
      </dl>
      {animal.alertas_activas > 0 && (
        <Badge tone="danger" className="mt-4">
          {animal.alertas_activas === 1 ? "1 alerta activa" : `${animal.alertas_activas} alertas activas`}
        </Badge>
      )}
    </Card>
  );
}
