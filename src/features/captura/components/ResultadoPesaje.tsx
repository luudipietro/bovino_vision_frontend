import { ArrowDown, ArrowUp, CircleCheck } from "lucide-react";
import Badge from "../../../components/Badge";
import Button from "../../../components/Button";
import { Notice } from "../../../components/Feedback";
import { formatearNumero } from "../../../lib/formato";
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
        <Notice tone="danger">
          <p className="text-sm font-semibold">No se pudo estimar el peso</p>
          <p className="mt-1">{resultado.captura.motivo_fallo}</p>
          <p className="mt-1">Registrá una nueva captura para volver a intentarlo.</p>
        </Notice>
      )}

      <Button size="lg" onClick={onPesarOtroAnimal} className="mt-6 w-full">
        Pesar otro animal
      </Button>
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
  const decimales = Number.isInteger(pesaje.peso_kg) ? 0 : 1;

  return (
    <>
      <p className="text-sm text-neutral-500">
        Caravana <span className="font-bold text-neutral-800">{pesaje.animal_identificador}</span>
      </p>

      <div className="mt-4 rounded-[14px] bg-green-50 px-6 py-8 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-green-600">
          PESO ESTIMADO
        </p>
        <p className="mt-2 flex items-baseline justify-center gap-2 text-neutral-800">
          <span className="text-6xl font-bold tracking-tight">
            {formatearNumero(pesaje.peso_kg, decimales)}
          </span>
          <span className="text-xl font-medium text-neutral-500">kg</span>
        </p>
        {pesaje.lote_codigo && (
          <p className="mt-3 text-sm text-neutral-600">Lote {pesaje.lote_codigo}</p>
        )}
        {!pesaje.alerta && diferencia != null && (
          <Badge tone="brand" className="mt-3 gap-1">
            {diferencia >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {diferencia >= 0 ? "+" : "-"}
            {formatearNumero(Math.abs(diferencia), 1)} kg vs. anterior
          </Badge>
        )}
      </div>

      {pesaje.alerta && (
        <Notice tone="danger" className="mt-4">
          {describirAlerta(pesaje.alerta)}
        </Notice>
      )}

      {captura.fecha_revision ? (
        <p className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-green-600">
          <CircleCheck className="h-5 w-5" /> Resultado confirmado
        </p>
      ) : (
        <Button
          variant="secondary"
          size="lg"
          disabled={cargando}
          onClick={onConfirmar}
          className="mt-4 w-full"
        >
          Confirmar resultado
        </Button>
      )}
      {error && (
        <Notice tone="danger" className="mt-3">
          {error}
        </Notice>
      )}
    </>
  );
}
