import { LoaderCircle, RefreshCcw } from "lucide-react";
import type { Animal, Captura } from "../../../api/tipos";
import Button from "../../../components/Button";
import { Notice } from "../../../components/Feedback";

interface EstimandoPesoProps {
  animal: Animal;
  captura: Captura | null;
  error: string | null;
  onReintentarConsulta: () => void;
}

export default function EstimandoPeso({
  animal,
  captura,
  error,
  onReintentarConsulta,
}: EstimandoPesoProps) {
  return (
    <section className="text-center">
      <p className="text-sm text-neutral-500">
        Caravana <span className="font-bold text-neutral-800">{animal.identificador}</span>
      </p>

      <div className="py-10">
        <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-green-500" />
        <h2 className="mt-5 text-2xl font-bold text-neutral-800">Estimando peso…</h2>
        <p className="mt-2 text-sm text-neutral-500">
          {captura?.estado === "procesando"
            ? `Procesando la foto (intento ${captura.intentos}).`
            : "La foto está en la cola de procesamiento."}
        </p>
        <p className="mt-1 text-xs text-neutral-400">No cierres la aplicación.</p>
      </div>

      {captura?.motivo_fallo && (
        <Notice tone="warning" className="text-left">
          Último intento: {captura.motivo_fallo}. Se reintenta automáticamente.
        </Notice>
      )}

      {error && (
        <Notice
          tone="danger"
          className="mt-4 text-left"
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
