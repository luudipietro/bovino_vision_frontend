import { Camera, CircleCheck, RotateCcw, Send } from "lucide-react";
import type { Animal } from "../../../api/tipos";
import Badge from "../../../components/Badge";
import Button from "../../../components/Button";
import { Notice } from "../../../components/Feedback";
import FotoCaptura from "../../../components/FotoCaptura";
import { formatearNumero } from "../../../lib/formato";
import { describirAlerta } from "../../alertas/textos";
import { type FilaDeFicha, fichaDelResultado, resumirPesaje } from "../resumenDePesaje";
import type { ResultadoCaptura } from "../useCaptura";

interface ResultadoPesajeProps {
  resultado: ResultadoCaptura;
  /** The weighed animal, for the breed, sex and age that the weighing itself does not carry. */
  animal: Animal | null;
  cargando: boolean;
  error: string | null;
  onConfirmar: () => void;
  /** "Tomar otra": leaves the animal and starts the next capture of the session. Absent when the result is only consulted. */
  onPesarOtroAnimal?: () => void;
  /** "Tomar otra foto": goes back to the photo step of the same animal (weighings are immutable, nothing is discarded). Absent when the result is only consulted. */
  onDescartar?: () => void;
}

export default function ResultadoPesaje({
  resultado,
  animal,
  cargando,
  error,
  onConfirmar,
  onPesarOtroAnimal,
  onDescartar,
}: ResultadoPesajeProps) {
  if (resultado.tipo === "estimado") {
    return (
      <PesoEstimado
        resultado={resultado}
        animal={animal}
        cargando={cargando}
        error={error}
        onConfirmar={onConfirmar}
        onPesarOtroAnimal={onPesarOtroAnimal}
        onDescartar={onDescartar}
      />
    );
  }

  return (
    <section>
      <Notice tone="danger">
        <p className="text-sm font-semibold">No se pudo estimar el peso</p>
        <p className="mt-1">{resultado.captura.motivo_fallo}</p>
        <p className="mt-1">Registrá una nueva captura para volver a intentarlo.</p>
      </Notice>
      {onPesarOtroAnimal && (
        <Button size="lg" onClick={onPesarOtroAnimal} className="mt-6 w-full">
          Pesar otro animal
        </Button>
      )}
    </section>
  );
}

const tonoDelValor: Record<NonNullable<FilaDeFicha["tono"]>, string> = {
  positivo: "text-green-600",
  negativo: "text-danger-text",
};

function PesoEstimado({
  resultado,
  animal,
  cargando,
  error,
  onConfirmar,
  onPesarOtroAnimal,
  onDescartar,
}: Omit<ResultadoPesajeProps, "resultado"> & {
  resultado: Extract<ResultadoCaptura, { tipo: "estimado" }>;
}) {
  const { pesaje, captura } = resultado;
  const decimales = Number.isInteger(pesaje.peso_kg) ? 0 : 1;
  const ficha = fichaDelResultado(pesaje, animal);
  const { primerPesaje } = resumirPesaje(pesaje, animal);
  const confirmado = captura.fecha_revision !== null;

  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-neutral-800">Resultado del pesaje</h2>
        <Badge tone="brand">{confirmado ? "Confirmado" : "Listo"}</Badge>
      </div>

      {/* Desktop: photo and weight on the left, the data sheet and actions on the right. */}
      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
        <div>
          <div className="mt-4 aspect-[4/3] w-full overflow-hidden rounded-[14px] bg-green-900">
            <FotoCaptura
              idImagen={pesaje.id_imagen}
              alt={`Foto de ${pesaje.animal_identificador}`}
              iconoGrande
            />
          </div>

          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-green-600">
              Peso estimado
            </p>
            <p className="flex items-baseline gap-2 text-neutral-800">
              <span className="text-6xl font-bold tracking-tight">
                {formatearNumero(pesaje.peso_kg, decimales)}
              </span>
              <span className="text-xl font-medium text-neutral-500">kg</span>
            </p>
          </div>
        </div>
        <div>
          <dl className="mt-4 space-y-2 border-t border-neutral-200 pt-4 lg:mt-4 lg:border-t-0 lg:pt-0">
            {ficha.map(({ etiqueta, valor, tono }) => (
              <div key={etiqueta} className="flex justify-between gap-4">
                <dt className="text-xs text-neutral-500">{etiqueta}</dt>
                <dd
                  className={`min-w-0 text-right text-sm font-semibold ${tono ? tonoDelValor[tono] : "text-neutral-800"}`}
                >
                  {valor}
                </dd>
              </div>
            ))}
          </dl>

          {primerPesaje && (
            <Notice className="mt-4">
              Es el primer pesaje de este animal: todavía no hay un peso anterior para comparar.
            </Notice>
          )}

          {pesaje.alerta && (
            <Notice tone="danger" className="mt-4">
              {describirAlerta(pesaje.alerta)}
            </Notice>
          )}

          <div className="mt-6 space-y-3">
            {confirmado ? (
              <p className="flex items-center justify-center gap-2 text-sm font-semibold text-green-600">
                <CircleCheck className="h-5 w-5" /> Resultado confirmado
              </p>
            ) : (
              <Button size="lg" icon={Send} disabled={cargando} onClick={onConfirmar} className="w-full">
                Confirmar y enviar
              </Button>
            )}
            {onPesarOtroAnimal && (
              <Button
                variant="secondary"
                size="lg"
                icon={Camera}
                disabled={cargando}
                onClick={onPesarOtroAnimal}
                className="w-full"
              >
                Tomar otra
              </Button>
            )}
            {error && <Notice tone="danger">{error}</Notice>}
            <Notice tone="success">
              La medición ya está guardada en el historial del animal. Confirmarla solo registra tu
              revisión.
            </Notice>
            {!confirmado && onDescartar && (
              <Button
                variant="ghost"
                icon={RotateCcw}
                disabled={cargando}
                onClick={onDescartar}
                className="w-full"
              >
                Tomar otra foto
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
