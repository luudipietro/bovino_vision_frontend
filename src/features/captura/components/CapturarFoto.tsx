import { Camera, ImagePlus, RefreshCcw, ScanLine } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import type { Animal, Captura } from "../../../api/tipos";

interface CapturarFotoProps {
  animal: Animal;
  captura: Captura | null;
  cargando: boolean;
  error: string | null;
  onSubirFoto: (archivo: File) => void;
  onReintentar: () => void;
  onProcesarPesaje: () => void;
}

export default function CapturarFoto({
  animal,
  captura,
  cargando,
  error,
  onSubirFoto,
  onReintentar,
  onProcesarPesaje,
}: CapturarFotoProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputCamara = useRef<HTMLInputElement>(null);
  const inputGaleria = useRef<HTMLInputElement>(null);

  function manejarArchivo(event: ChangeEvent<HTMLInputElement>) {
    const archivo = event.target.files?.[0];
    event.target.value = "";
    if (!archivo) return;

    setPreviewUrl(URL.createObjectURL(archivo));
    onSubirFoto(archivo);
  }

  function reintentar() {
    setPreviewUrl(null);
    onReintentar();
  }

  return (
    <section>
      <h1 className="text-xl font-bold text-stone-900">Captura — {animal.identificador}</h1>

      <div className="relative mt-4 flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-3xl bg-stone-900">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Vista previa de la captura"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-stone-400">
            <ScanLine className="h-12 w-12" />
            <p className="text-sm">Alineá el animal con la guía</p>
          </div>
        )}
        {!previewUrl && (
          <span className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
            ESPERANDO ANIMAL
          </span>
        )}
      </div>

      {!captura && (
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            disabled={cargando}
            onClick={() => inputCamara.current?.click()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-900 px-4 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
          >
            <Camera className="h-4 w-4" />
            Usar cámara
          </button>
          <button
            type="button"
            disabled={cargando}
            onClick={() => inputGaleria.current?.click()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50"
          >
            <ImagePlus className="h-4 w-4" />
            Galería
          </button>
          <input
            ref={inputCamara}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={manejarArchivo}
            className="hidden"
          />
          <input
            ref={inputGaleria}
            type="file"
            accept="image/*"
            onChange={manejarArchivo}
            className="hidden"
          />
        </div>
      )}

      {cargando && <p className="mt-4 text-sm text-stone-500">Subiendo foto…</p>}
      {error && captura && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {error && !captura && (
        <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <p>No se pudo registrar la foto: {error}</p>
          <button
            type="button"
            onClick={reintentar}
            className="mt-2 flex items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-700"
          >
            <RefreshCcw className="h-4 w-4" />
            Sacar otra foto
          </button>
        </div>
      )}

      {captura && (
        <div className="mt-4 rounded-2xl border border-lime-300 bg-lime-50 p-4 text-sm text-green-900">
          <p className="font-semibold">Foto cargada. Lista para estimar el peso.</p>
          <button
            type="button"
            disabled={cargando}
            onClick={onProcesarPesaje}
            className="mt-2 rounded-xl bg-green-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
          >
            Procesar pesaje
          </button>
        </div>
      )}
    </section>
  );
}
