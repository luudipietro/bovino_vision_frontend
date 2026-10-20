import { ArrowRight, Camera, ImagePlus, RefreshCcw } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import type { Animal, Captura } from "../../../api/tipos";
import Button from "../../../components/Button";
import { Loading, Notice } from "../../../components/Feedback";

interface CapturarFotoProps {
  animal: Animal;
  captura: Captura | null;
  cargando: boolean;
  error: string | null;
  onSubirFoto: (archivo: File) => void;
  onReintentar: () => void;
  onProcesarPesaje: () => void;
}

const esquina = "absolute h-8 w-8 border-green-300";

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
      <h2 className="text-2xl font-medium text-neutral-800">
        Foto del <span className="font-bold">animal</span>
      </h2>
      <p className="mt-1 text-sm text-neutral-500">
        Caravana <span className="font-bold text-neutral-800">{animal.identificador}</span>
      </p>

      <div className="relative mx-auto mt-5 aspect-[4/5] max-h-[560px] w-full overflow-hidden rounded-[14px] bg-green-900">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Vista previa de la captura"
            className="h-full w-full object-cover"
          />
        ) : (
          <>
            <span className={`${esquina} left-5 top-5 rounded-tl-lg border-l-4 border-t-4`} />
            <span className={`${esquina} right-5 top-5 rounded-tr-lg border-r-4 border-t-4`} />
            <span className={`${esquina} bottom-5 left-5 rounded-bl-lg border-b-4 border-l-4`} />
            <span className={`${esquina} bottom-5 right-5 rounded-br-lg border-b-4 border-r-4`} />
            <span className="absolute inset-x-10 top-1/2 border-t-2 border-dashed border-green-300/70" />
            <span className="absolute left-1/2 top-6 -translate-x-1/2 whitespace-nowrap rounded-full bg-green-900/70 px-3 py-1 text-[11px] font-semibold tracking-wider text-green-300 ring-1 ring-green-300/30">
              ESPERANDO ANIMAL
            </span>
            <p className="absolute inset-x-0 bottom-10 text-center text-xs text-green-300">
              Alineá el animal con la guía
            </p>
          </>
        )}
      </div>

      {!captura && (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button
            size="lg"
            icon={Camera}
            disabled={cargando}
            onClick={() => inputCamara.current?.click()}
          >
            Usar cámara
          </Button>
          <Button
            variant="secondary"
            size="lg"
            icon={ImagePlus}
            disabled={cargando}
            onClick={() => inputGaleria.current?.click()}
          >
            Galería
          </Button>
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

      {cargando && <Loading>Subiendo foto…</Loading>}
      {error && captura && (
        <Notice tone="danger" className="mt-4">
          {error}
        </Notice>
      )}

      {error && !captura && (
        <Notice
          tone="warning"
          className="mt-4"
          action={
            <Button size="lg" icon={RefreshCcw} onClick={reintentar} className="w-full sm:w-auto">
              Sacar otra foto
            </Button>
          }
        >
          No se pudo registrar la foto: {error}
        </Notice>
      )}

      {captura && (
        <div className="mt-5 space-y-3">
          <Notice tone="success">
            <p className="font-semibold">Foto cargada. Lista para estimar el peso.</p>
          </Notice>
          <Button
            size="lg"
            iconRight={ArrowRight}
            disabled={cargando}
            onClick={onProcesarPesaje}
            className="w-full"
          >
            Procesar pesaje
          </Button>
        </div>
      )}
    </section>
  );
}
