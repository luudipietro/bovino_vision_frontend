import { AlertTriangle, ArrowDown, ArrowUp, CheckCircle2, Scale } from "lucide-react";
import Badge from "../../../components/Badge";
import { describirAlerta } from "../../alertas/textos";
import type { ResultadoCaptura } from "../useCaptura";

interface ResultadoPesajeProps {
  resultado: ResultadoCaptura;
  cargando: boolean;
  error: string | null;
  onConfirmar: () => void;
  onPesarOtroAnimal: () => void;
}

export default function ResultadoPesaje({
  resultado,
  cargando,
  error,
  onConfirmar,
  onPesarOtroAnimal,
}: ResultadoPesajeProps) {
  return (
    <section>
      {resultado.tipo === "estimado" ? (
        <PesoEstimado
          resultado={resultado}
          cargando={cargando}
          error={error}
          onConfirmar={onConfirmar}
        />
      ) : (
        <div className="mt-4 rounded-3xl border border-red-300 bg-red-50 p-8 text-center text-red-800">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white">
            <AlertTriangle className="h-7 w-7" />
          </span>
          <p className="mt-3 font-semibold">No se pudo estimar el peso</p>
          <p className="mt-1 text-sm">{resultado.captura.motivo_fallo}</p>
          <p className="mt-2 text-xs">Registrá una nueva captura para volver a intentarlo.</p>
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

function PesoEstimado({
  resultado,
  cargando,
  error,
  onConfirmar,
}: Omit<ResultadoPesajeProps, "resultado" | "onPesarOtroAnimal"> & {
  resultado: Extract<ResultadoCaptura, { tipo: "estimado" }>;
}) {
  const { pesaje, captura } = resultado;
  const diferencia = pesaje.ultimo_peso_previo
    ? pesaje.peso_kg - pesaje.ultimo_peso_previo.peso_kg
    : null;

  return (
    <>
      <h1 className="text-xl font-bold text-stone-900">Resultado — {pesaje.animal_identificador}</h1>

      <div className="mt-4 rounded-3xl border border-lime-300 bg-lime-50 p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-900 text-white">
          <Scale className="h-7 w-7" />
        </span>
        <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-green-800">
          Peso estimado
        </p>
        <p className="mt-1 text-5xl font-bold text-green-900">{pesaje.peso_kg} kg</p>
        {pesaje.lote_codigo && (
          <p className="mt-2 text-sm text-green-800">Lote {pesaje.lote_codigo}</p>
        )}
        {pesaje.alerta ? (
          <Badge tone="danger" className="mt-3">
            {describirAlerta(pesaje.alerta)}
          </Badge>
        ) : (
          diferencia != null && (
            <Badge tone="brand" className="mt-3 gap-1">
              {diferencia >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {diferencia >= 0 ? "+" : ""}
              {diferencia.toFixed(1)} kg vs. anterior
            </Badge>
          )
        )}
      </div>

      {captura.fecha_revision ? (
        <p className="mt-4 flex items-center justify-center gap-1.5 text-sm font-semibold text-green-800">
          <CheckCircle2 className="h-4 w-4" /> Resultado confirmado
        </p>
      ) : (
        <button
          type="button"
          disabled={cargando}
          onClick={onConfirmar}
          className="mt-4 w-full rounded-xl border border-green-900 px-4 py-3 text-sm font-semibold text-green-900 hover:bg-lime-50 disabled:opacity-50"
        >
          Confirmar resultado
        </button>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </>
  );
}
