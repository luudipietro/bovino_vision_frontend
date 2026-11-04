import { ArrowLeft } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import GaleriaSesion from "./components/GaleriaSesion";
import { RUTA_HISTORIAL_SESIONES } from "./rutaDeCaptura";

const SIN_VISTAS_PREVIAS = {};

/** Detail of a recent capture session: its photos with their state and weighing result. */
export default function SesionCapturaPage() {
  const { id } = useParams<{ id: string }>();
  const ubicacion = useLocation();
  const desdeHistorial = ubicacion.state?.desdeHistorial === true;
  if (!id) return null;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Link
          to={desdeHistorial ? RUTA_HISTORIAL_SESIONES : "/captura"}
          className="-ml-3 inline-flex items-center gap-2 rounded-[10px] px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-100"
        >
          <ArrowLeft className="h-4 w-4" />
          {desdeHistorial ? "Volver al historial" : "Inicio de captura"}
        </Link>
        <PageHeader title="Sesión de captura" subtitle="Las fotos que se tomaron en esta sesión. Tocá una para ver su resultado." />
      </div>
      <GaleriaSesion idSesion={id} version={0} vistasPrevias={SIN_VISTAS_PREVIAS} consulta />
    </div>
  );
}
