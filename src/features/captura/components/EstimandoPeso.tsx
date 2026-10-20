import { Loader2, RefreshCcw } from "lucide-react";
import type { Animal, Captura } from "../../../api/tipos";

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
    <section>
      <h1 className="text-xl font-bold text-stone-900">Captura — {animal.identificador}</h1>

      <div className="mt-4 rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-green-800" />
        <p className="mt-3 font-semibold text-stone-900">Estimando el peso…</p>
        <p className="mt-1 text-sm text-stone-500">
          {captura?.estado === "procesando"
            ? `Procesando la foto (intento ${captura.intentos}).`
            : "La foto está en la cola de procesamiento."}
        </p>
        {captura?.motivo_fallo && (
          <p className="mt-2 text-xs text-amber-700">
            Último intento: {captura.motivo_fallo}. Se reintenta automáticamente.
          </p>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          <p>No se pudo consultar el estado: {error}</p>
          <button
            type="button"
            onClick={onReintentarConsulta}
            className="mt-2 flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            <RefreshCcw className="h-4 w-4" />
            Volver a consultar
          </button>
        </div>
      )}
    </section>
  );
}
