import type { Lote } from "../../api/tipos";
import type { ChipRodeo } from "./rodeo";

interface ChipsDeFiltroProps {
  activo: ChipRodeo;
  lotes: Lote[];
  onChange: (chip: ChipRodeo) => void;
}

function esElMismo(a: ChipRodeo, b: ChipRodeo): boolean {
  if (a.tipo !== b.tipo) return false;
  return a.tipo !== "lote" || (b.tipo === "lote" && a.idLote === b.idLote);
}

/** "Todos", one chip per lot and "Alertas"; scrolls sideways when the lots do not fit. */
export default function ChipsDeFiltro({ activo, lotes, onChange }: ChipsDeFiltroProps) {
  const chips: { chip: ChipRodeo; etiqueta: string; clave: string }[] = [
    { chip: { tipo: "todos" }, etiqueta: "Todos", clave: "todos" },
    ...lotes.map((lote) => ({
      chip: { tipo: "lote", idLote: lote.id } as ChipRodeo,
      etiqueta: `Lote ${lote.codigo}`,
      clave: lote.id,
    })),
    { chip: { tipo: "alertas" }, etiqueta: "Alertas", clave: "alertas" },
  ];

  return (
    <div role="group" aria-label="Filtrar el rodeo" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {chips.map(({ chip, etiqueta, clave }) => {
        const seleccionado = esElMismo(activo, chip);
        return (
          <button
            key={clave}
            type="button"
            aria-pressed={seleccionado}
            onClick={() => onChange(chip)}
            className={`min-h-9 shrink-0 whitespace-nowrap rounded-full border px-4 text-[13px] font-medium transition-colors ${
              seleccionado
                ? "border-green-800 bg-green-800 text-white"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-green-300 hover:text-green-800"
            }`}
          >
            {etiqueta}
          </button>
        );
      })}
    </div>
  );
}
