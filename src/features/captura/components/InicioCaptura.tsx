import { useState } from "react";
import { Camera, ChevronRight, History, RefreshCcw, Wifi, WifiOff } from "lucide-react";
import Badge from "../../../components/Badge";
import Button from "../../../components/Button";
import Card from "../../../components/Card";
import { EmptyState, Loading, Notice } from "../../../components/Feedback";
import { etiquetaDeConexion, useEnLinea } from "../conexion";
import { resumirSesion, saludoSegunHora } from "../sesionesRecientes";
import { useSesionesRecientes } from "../useSesionesRecientes";

interface InicioCapturaProps {
  /** Full name of the user in the session, for the greeting. */
  nombre: string;
  onNuevaCaptura: () => void;
}

/** Capture home: greeting, connection pill, the big "Nueva captura" button and the recent sessions. */
export default function InicioCaptura({ nombre, onNuevaCaptura }: InicioCapturaProps) {
  const enLinea = useEnLinea();
  const [ahora] = useState(() => new Date());

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-neutral-500">{saludoSegunHora(ahora)},</p>
          <h1 className="truncate text-2xl font-bold tracking-tight text-neutral-800">{nombre}</h1>
        </div>
        <Badge tone={enLinea ? "brand" : "warning"} className="shrink-0 gap-1.5 py-1">
          {enLinea ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {etiquetaDeConexion(enLinea)}
        </Badge>
      </header>

      <button
        type="button"
        onClick={onNuevaCaptura}
        className="flex min-h-[92px] w-full items-center gap-4 rounded-[14px] bg-linear-to-br from-green-600 to-green-800 p-5 text-left text-white shadow-md transition-opacity hover:opacity-95"
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] bg-white/15">
          <Camera className="h-7 w-7" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-xl font-bold leading-tight tracking-tight">Nueva captura</span>
          <span className="text-sm text-white/80">Pesá sin arrear: 4 tomas y listo</span>
        </span>
        <ChevronRight className="h-6 w-6 shrink-0 text-white/85" />
      </button>

      <SesionesRecientes ahora={ahora} />
    </div>
  );
}

function SesionesRecientes({ ahora }: { ahora: Date }) {
  const { sesiones, recargar } = useSesionesRecientes();

  return (
    <section aria-labelledby="sesiones-recientes">
      <h2 id="sesiones-recientes" className="text-lg font-bold text-neutral-800">
        Sesiones recientes
      </h2>

      <div className="mt-3">
        {sesiones.estado === "cargando" && <Loading>Cargando sesiones…</Loading>}

        {sesiones.estado === "error" && (
          <Notice
            tone="danger"
            action={
              <Button variant="secondary" icon={RefreshCcw} onClick={recargar}>
                Reintentar
              </Button>
            }
          >
            No pudimos cargar las sesiones recientes: {sesiones.mensaje}
          </Notice>
        )}

        {sesiones.estado === "listo" && sesiones.sesiones.length === 0 && (
          <EmptyState icon={History} title="Todavía no hiciste capturas">
            Las sesiones que empieces van a aparecer acá.
          </EmptyState>
        )}

        {sesiones.estado === "listo" && sesiones.sesiones.length > 0 && (
          <ul className="space-y-2">
            {sesiones.sesiones.map((sesion) => {
              const { detalle, cuando, enCurso } = resumirSesion(sesion, ahora);
              return (
                <li key={sesion.id}>
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
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
