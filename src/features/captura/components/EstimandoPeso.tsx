import { Circle, CircleCheck, LoaderCircle, RefreshCcw } from "lucide-react";
import type { Animal, Captura } from "../../../api/tipos";
import Button from "../../../components/Button";
import { Notice } from "../../../components/Feedback";
import { type EstadoDePaso, pasosDeEstimacion } from "../pasosDeEstimacion";

interface EstimandoPesoProps {
  animal: Animal;
  captura: Captura | null;
  error: string | null;
  onReintentarConsulta: () => void;
}

function IconoDePaso({ estado }: { estado: EstadoDePaso }) {
  if (estado === "hecho") return <CircleCheck className="h-5 w-5 text-green-500" />;
  if (estado === "en_curso") return <LoaderCircle className="h-5 w-5 animate-spin text-green-500" />;
  return <Circle className="h-5 w-5 text-neutral-300" />;
}

export default function EstimandoPeso({
  animal,
  captura,
  error,
  onReintentarConsulta,
}: EstimandoPesoProps) {
  return (
    <section>
      <p className="text-sm text-neutral-500">
        Caravana <span className="font-bold text-neutral-800">{animal.identificador}</span>
      </p>

      <h2 className="mt-4 text-2xl font-bold text-neutral-800">Estimando peso…</h2>
      <p className="mt-1 text-sm text-neutral-500">No cierres la aplicación.</p>

      <ol className="mt-6 space-y-3" aria-label="Avance de la estimación">
        {pasosDeEstimacion(captura).map(({ texto, estado }) => (
          <li
            key={texto}
            aria-current={estado === "en_curso" ? "step" : undefined}
            className={`flex items-center gap-3 text-sm ${estado === "pendiente" ? "text-neutral-400" : "text-neutral-800"} ${estado === "en_curso" ? "font-semibold" : ""}`}
          >
            <IconoDePaso estado={estado} />
            {texto}
          </li>
        ))}
      </ol>

      {captura?.motivo_fallo && (
        <Notice tone="warning" className="mt-6">
          Último intento: {captura.motivo_fallo}. Se reintenta automáticamente.
        </Notice>
      )}

      {error && (
        <Notice
          tone="danger"
          className="mt-4"
          action={
            <Button
              size="lg"
              icon={RefreshCcw}
              onClick={onReintentarConsulta}
              className="w-full sm:w-auto"
            >
              Volver a consultar
            </Button>
          }
        >
          No se pudo consultar el estado: {error}
        </Notice>
      )}
    </section>
  );
}
