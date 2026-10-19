import { AlertTriangle, ArrowDown, ArrowUp, Scale } from "lucide-react";
import Badge from "../../../components/Badge";

export default function ResultadoPesaje({ resultado, onPesarOtroAnimal }) {
  const exitoso = resultado.estado === "estimado";
  const diferencia =
    exitoso && resultado.ultimo_peso_previo
      ? resultado.peso_kg - resultado.ultimo_peso_previo.peso_kg
      : null;

  return (
    <section>
      <h1 className="text-xl font-bold text-stone-900">
        Resultado — {resultado.animal_identificador}
      </h1>

      {exitoso ? (
        <div className="mt-4 rounded-3xl border border-lime-300 bg-lime-50 p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-900 text-white">
            <Scale className="h-7 w-7" />
          </span>
          <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-green-800">
            Peso estimado
          </p>
          <p className="mt-1 text-5xl font-bold text-green-900">{resultado.peso_kg} kg</p>
          {resultado.lote_codigo && (
            <p className="mt-2 text-sm text-green-800">Lote {resultado.lote_codigo}</p>
          )}
          {resultado.alerta ? (
            <Badge tone="danger" className="mt-3">
              Variación inusual: {resultado.alerta.variacion_pct > 0 ? "+" : ""}
              {resultado.alerta.variacion_pct}%
            </Badge>
          ) : (
            diferencia != null && (
              <Badge tone="brand" className="mt-3 gap-1">
                {diferencia >= 0 ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                )}
                {diferencia >= 0 ? "+" : ""}
                {diferencia.toFixed(1)} kg vs. anterior
              </Badge>
            )
          )}
        </div>
      ) : (
        <div className="mt-4 rounded-3xl border border-red-300 bg-red-50 p-8 text-center text-red-800">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white">
            <AlertTriangle className="h-7 w-7" />
          </span>
          <p className="mt-3 font-semibold">No se pudo estimar el peso</p>
          <p className="mt-1 text-sm">{resultado.motivo_error}</p>
        </div>
      )}

      <button
        type="button"
        onClick={onPesarOtroAnimal}
        className="mt-6 w-full rounded-xl bg-green-900 px-4 py-3 text-sm font-semibold text-white hover:bg-green-800"
      >
        Pesar otro animal
      </button>
    </section>
  );
}
