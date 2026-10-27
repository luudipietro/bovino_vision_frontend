import { ArrowLeft, History, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarSesionesRecientes } from "../../api/capturas";
import { mensajeDeError } from "../../api/client";
import type { SesionReciente } from "../../api/tipos";
import Button from "../../components/Button";
import { EmptyState, Loading, Notice } from "../../components/Feedback";
import PageHeader from "../../components/PageHeader";
import TarjetaSesion from "./components/TarjetaSesion";
import { agregarPagina, type HistorialDeSesiones } from "./historialSesiones";

/** The API maximum for one page. */
const TAMANO_PAGINA = 20;

/** Every capture session of the user, newest first, loaded a page at a time. */
export default function HistorialSesionesPage() {
  const [ahora] = useState(() => new Date());
  const [sesiones, setSesiones] = useState<SesionReciente[]>([]);
  const [hayMas, setHayMas] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function mostrar({ sesiones: todas, hayMas: quedan }: HistorialDeSesiones) {
    setSesiones(todas);
    setHayMas(quedan);
  }

  useEffect(() => {
    let vigente = true;
    listarSesionesRecientes(TAMANO_PAGINA, 0)
      .then((pagina) => vigente && mostrar(agregarPagina([], pagina, TAMANO_PAGINA)))
      .catch((err: unknown) => vigente && setError(mensajeDeError(err)))
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, []);

  /** "Cargar más" and "Reintentar": asks for the page after the sessions already shown. */
  async function cargarPagina(actuales: SesionReciente[]) {
    setCargando(true);
    setError(null);
    try {
      const pagina = await listarSesionesRecientes(TAMANO_PAGINA, actuales.length);
      mostrar(agregarPagina(actuales, pagina, TAMANO_PAGINA));
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Link
          to="/captura"
          className="-ml-3 inline-flex items-center gap-2 rounded-[10px] px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Inicio de captura
        </Link>
        <PageHeader
          title="Historial de sesiones"
          subtitle="Todas tus sesiones de captura, de la más nueva a la más vieja."
        />
      </div>

      {sesiones.length > 0 && (
        <ul className="grid gap-2 lg:grid-cols-2">
          {sesiones.map((sesion) => (
            <li key={sesion.id}>
              <TarjetaSesion sesion={sesion} ahora={ahora} />
            </li>
          ))}
        </ul>
      )}

      {!cargando && !error && sesiones.length === 0 && (
        <EmptyState icon={History} title="Todavía no hiciste capturas">
          Las sesiones que empieces van a aparecer acá.
        </EmptyState>
      )}

      {error && (
        <Notice
          tone="danger"
          action={
            <Button variant="secondary" icon={RefreshCcw} onClick={() => void cargarPagina(sesiones)}>
              Reintentar
            </Button>
          }
        >
          No pudimos cargar las sesiones: {error}
        </Notice>
      )}

      {cargando && <Loading>Cargando sesiones…</Loading>}

      {!cargando && !error && hayMas && (
        <Button variant="secondary" onClick={() => void cargarPagina(sesiones)} className="w-full">
          Cargar más
        </Button>
      )}
    </div>
  );
}
