import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarCapturasDeSesion } from "../../../api/capturas";
import { mensajeDeError } from "../../../api/client";
import type { CapturaDeSesion, Uuid } from "../../../api/tipos";
import Badge from "../../../components/Badge";
import Card, { CardHeader } from "../../../components/Card";
import { Camera } from "lucide-react";
import { EmptyState, Loading, Notice } from "../../../components/Feedback";
import FotoCaptura from "../../../components/FotoCaptura";
import { formatearFechaHora } from "../../../lib/formato";
import { estadoDeCaptura } from "../estadoCaptura";
import { rutaDeResultado } from "../rutaDeCaptura";

interface GaleriaSesionProps {
  idSesion: Uuid;
  /** Changes whenever a capture is added or finishes, to reload the list. */
  version: number;
  /** Local previews by capture id (photos taken in this tab); the rest use the API thumbnail. */
  vistasPrevias: Record<Uuid, string>;
  /** Session detail page: shows the loading and empty states, links each photo to its result and uses a wider grid. */
  consulta?: boolean;
}

/** Photos of a capture session (CU-13). */
export default function GaleriaSesion({ idSesion, version, vistasPrevias, consulta = false }: GaleriaSesionProps) {
  const [capturas, setCapturas] = useState<CapturaDeSesion[] | null>(null);
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

  if (!error && (capturas === null || capturas.length === 0)) {
    if (!consulta) return null;
    if (capturas === null) return <Loading>Cargando fotos…</Loading>;
    return (
      <EmptyState icon={Camera} title="Sesión sin fotos">
        En esta sesión no se registró ninguna captura.
      </EmptyState>
    );
  }

  const lista = capturas ?? [];
  // Newest first, as the operator remembers them.
  const recientes = [...lista].reverse();

  return (
    <Card className="md:p-6">
      <CardHeader
        title="Fotos de esta sesión"
        subtitle={`${lista.length} ${lista.length === 1 ? "captura" : "capturas"}`}
      />
      {error && (
        <Notice tone="warning" className="mt-4">
          No pudimos actualizar las fotos de la sesión. {error}
        </Notice>
      )}
      <ul
        className={`mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 ${consulta ? "lg:grid-cols-4 xl:grid-cols-5" : "lg:grid-cols-2"}`}
      >
        {recientes.map((captura) => {
          const estado = estadoDeCaptura(captura.estado);
          const vista = vistasPrevias[captura.id];
          const contenido = (
            <>
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
            </>
          );
          return (
            <li key={captura.id} className="overflow-hidden rounded-[10px] border border-neutral-200 bg-white">
              {consulta ? (
                <Link
                  to={rutaDeResultado(captura.id)}
                  className="block h-full transition-colors hover:bg-green-50"
                >
                  {contenido}
                </Link>
              ) : (
                contenido
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
