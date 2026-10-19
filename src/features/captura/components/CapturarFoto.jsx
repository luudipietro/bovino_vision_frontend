import { useRef, useState } from "react";

export default function CapturarFoto({
  animal,
  captura,
  cargando,
  error,
  onSubirFoto,
  onReintentar,
  onConfirmarPesaje,
}) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const inputCamara = useRef(null);
  const inputGaleria = useRef(null);

  function manejarArchivo(event) {
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
      <h1 className="text-xl font-semibold text-gray-900">
        Captura — {animal.identificador}
      </h1>

      {previewUrl && (
        <img
          src={previewUrl}
          alt="Vista previa de la captura"
          className="mt-4 h-48 w-full rounded-md object-cover"
        />
      )}

      {!captura && (
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            disabled={cargando}
            onClick={() => inputCamara.current?.click()}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Usar cámara
          </button>
          <button
            type="button"
            disabled={cargando}
            onClick={() => inputGaleria.current?.click()}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Elegir de galería
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

      {cargando && <p className="mt-4 text-sm text-gray-500">Subiendo foto…</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {captura && !captura.validada && (
        <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <p>La foto no pasó la validación: {captura.motivo_invalidez}</p>
          <button
            type="button"
            onClick={reintentar}
            className="mt-2 rounded-md bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            Sacar otra foto
          </button>
        </div>
      )}

      {captura && captura.validada && (
        <div className="mt-4 rounded-md border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800">
          <p>Foto válida. Lista para estimar el peso.</p>
          <button
            type="button"
            disabled={cargando}
            onClick={onConfirmarPesaje}
            className="mt-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Procesar pesaje
          </button>
        </div>
      )}
    </section>
  );
}
