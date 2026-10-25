import { useEffect, useState } from "react";
import { listarCapturasDeSesion } from "../../../api/capturas";
import { mensajeDeError } from "../../../api/client";
import type { CapturaDeSesion, Uuid } from "../../../api/tipos";
import Badge from "../../../components/Badge";
import Card, { CardHeader } from "../../../components/Card";
import { Notice } from "../../../components/Feedback";
import FotoCaptura from "../../../components/FotoCaptura";
import { formatearFechaHora } from "../../../lib/formato";
import { estadoDeCaptura } from "../estadoCaptura";

interface GaleriaSesionProps {
  idSesion: Uuid;
  /** Changes whenever a capture is added or finishes, to reload the list. */
  version: number;
  /** Local previews by capture id (photos taken in this tab); the rest use the API thumbnail. */
  vistasPrevias: Record<Uuid, string>;
}

/** Photos of the current capture session (CU-13). */
export default function GaleriaSesion({ idSesion, version, vistasPrevias }: GaleriaSesionProps) {
  const [capturas, setCapturas] = useState<CapturaDeSesion[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    listarCapturasDeSesion(idSesion)
      .then((lista) => {
        if (!vigente) return;
        setCapturas(lista);
        setError(null);
      })
      .catch((err: unknown) => vigente && setError(mensajeDeError(err)));
    return () => {
      vigente = false;
    };
  }, [idSesion, version]);

  if (capturas.length === 0 && !error) return null;

  // Newest first, as the operator remembers them.
  const recientes = [...capturas].reverse();

  return (
    <Card className="md:p-6">
      <CardHeader
        title="Fotos de esta sesión"
        subtitle={`${capturas.length} ${capturas.length === 1 ? "captura" : "capturas"}`}
      />
      {error && (
        <Notice tone="warning" className="mt-4">
          No pudimos actualizar las fotos de la sesión. {error}
        </Notice>
      )}
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
        {recientes.map((captura) => {
          const estado = estadoDeCaptura(captura.estado);
          const vista = vistasPrevias[captura.id];
          return (
            <li key={captura.id} className="overflow-hidden rounded-[10px] border border-neutral-200 bg-white">
              <div className="flex aspect-[4/3] items-center justify-center bg-green-900">
                {vista ? (
                  <img
                    src={vista}
                    alt={`Foto de ${captura.animal_identificador}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FotoCaptura
                    idImagen={captura.id_imagen}
                    alt={`Foto de ${captura.animal_identificador}`}
                    iconoGrande
                  />
                )}
              </div>
              <div className="space-y-1 px-3 py-2">
                <p className="truncate text-sm font-bold text-neutral-800">{captura.animal_identificador}</p>
                <p className="text-[11px] text-neutral-500">{formatearFechaHora(captura.fecha_captura)}</p>
                <Badge tone={estado.tono}>{estado.texto}</Badge>
                {captura.estado === "fallida" && captura.motivo_fallo && (
                  <p className="text-[11px] text-danger-text">{captura.motivo_fallo}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
