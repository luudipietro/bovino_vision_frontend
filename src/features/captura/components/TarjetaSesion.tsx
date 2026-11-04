import { Camera, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import type { SesionReciente } from "../../../api/tipos";
import Badge from "../../../components/Badge";
import Card from "../../../components/Card";
import { RUTA_HISTORIAL_SESIONES, rutaDeSesion } from "../rutaDeCaptura";
import { resumirSesion } from "../sesionesRecientes";

/** One capture session in a list; it opens the session detail. */
export default function TarjetaSesion({ sesion, ahora }: { sesion: SesionReciente; ahora: Date }) {
  const { detalle, cuando, enCurso } = resumirSesion(sesion, ahora);
  const { pathname } = useLocation();
  return (
    <Link
      to={rutaDeSesion(sesion.id)}
      state={{ desdeHistorial: pathname === RUTA_HISTORIAL_SESIONES }}
      className="block rounded-[14px] transition-colors [&>div]:hover:border-green-300 [&>div]:hover:bg-green-50"
    >
      <Card className="flex items-center gap-3 p-4 md:p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-green-100 text-green-600">
          <Camera className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
            Sesión de captura
            {enCurso && <Badge tone="warning">En curso</Badge>}
          </p>
          <p className="text-xs text-neutral-500">{detalle}</p>
        </div>
        <span className="shrink-0 text-xs font-medium text-neutral-500">{cuando}</span>
        <ChevronRight className="h-4 w-4 shrink-0 text-neutral-400" />
      </Card>
    </Link>
  );
}
