import { ArrowLeft, ChevronLeft, ChevronRight, History, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { mensajeDeError } from "../../api/client";
import type { SesionReciente } from "../../api/tipos";
import Button from "../../components/Button";
import { EmptyState, Loading, Notice } from "../../components/Feedback";
import Field, { Input } from "../../components/Field";
import PageHeader from "../../components/PageHeader";
import TarjetaSesion from "./components/TarjetaSesion";
import { cargarPaginaSesiones, TAMANO_PAGINA, type ConsultaHistorial } from "./paginaSesiones";

const CONSULTA_INICIAL: ConsultaHistorial = { pagina: 1, desde: "", hasta: "" };

/** Historial paginado del usuario, filtrado por fecha de inicio en su zona horaria. */
export default function HistorialSesionesPage() {
  const [ahora] = useState(() => new Date());
  const [consulta, setConsulta] = useState(CONSULTA_INICIAL);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [resultado, setResultado] = useState<{
    consulta: ConsultaHistorial;
    sesiones: SesionReciente[];
    hayMas: boolean;
    error: string | null;
  } | null>(null);

  const cargando = resultado?.consulta !== consulta;
  const sesiones = cargando ? [] : resultado.sesiones;
  const hayMas = !cargando && resultado.hayMas;
  const error = !cargando ? resultado.error : null;
  const rangoInvalido = Boolean(desde && hasta && desde > hasta);
  const filtrado = Boolean(consulta.desde || consulta.hasta);

  function cambiarFechas(nuevoDesde: string, nuevoHasta: string) {
    setDesde(nuevoDesde);
    setHasta(nuevoHasta);
    if (!nuevoDesde || !nuevoHasta || nuevoDesde <= nuevoHasta) {
      setConsulta({ pagina: 1, desde: nuevoDesde, hasta: nuevoHasta });
    }
  }

  useEffect(() => {
    let vigente = true;
    cargarPaginaSesiones(consulta)
      .then((pagina) => {
        if (vigente) setResultado({ consulta, ...pagina, error: null });
      })
      .catch((err: unknown) => {
        if (vigente) setResultado({ consulta, sesiones: [], hayMas: false, error: mensajeDeError(err) });
      });
    return () => { vigente = false; };
  }, [consulta]);

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

      <form
        className="flex flex-wrap items-end gap-3 rounded-[14px] border border-neutral-200 bg-white p-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!rangoInvalido) setConsulta({ pagina: 1, desde, hasta });
        }}
      >
        <Field label="Desde" className="w-full sm:w-48">
          <Input type="date" value={desde} max={hasta || undefined} onChange={(e) => cambiarFechas(e.target.value, hasta)} />
        </Field>
        <Field label="Hasta" className="w-full sm:w-48">
          <Input type="date" value={hasta} min={desde || undefined} onChange={(e) => cambiarFechas(desde, e.target.value)} />
        </Field>
        <Button type="submit" disabled={rangoInvalido}>Filtrar</Button>
        <Button variant="secondary" onClick={() => {
          setDesde("");
          setHasta("");
          setConsulta({ ...CONSULTA_INICIAL });
        }}>Limpiar filtros</Button>
        {rangoInvalido && (
          <p role="alert" className="w-full text-sm text-danger-600">La fecha Desde no puede ser posterior a Hasta.</p>
        )}
      </form>

      <section aria-label="Sesiones de captura" aria-busy={cargando} className="space-y-4">
        {sesiones.length > 0 && (
          <ul className="grid gap-2 lg:grid-cols-2">
            {sesiones.map((sesion) => (
              <li key={sesion.id}><TarjetaSesion sesion={sesion} ahora={ahora} /></li>
            ))}
          </ul>
        )}

        {!cargando && !error && sesiones.length === 0 && (
          <EmptyState icon={History} title={filtrado ? "No hay sesiones en este rango" : "No hay sesiones para mostrar"}>
            {filtrado ? "Probá con otras fechas o limpiá los filtros." : "Las sesiones que empieces van a aparecer acá."}
          </EmptyState>
        )}

        {error && (
          <Notice tone="danger" action={
            <Button variant="secondary" icon={RefreshCcw} onClick={() => setConsulta({ ...consulta })}>Reintentar</Button>
          }>
            No pudimos cargar las sesiones: {error}
          </Notice>
        )}

        {cargando && <Loading>Cargando sesiones…</Loading>}

        <nav aria-label="Paginación del historial" className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-neutral-600" role="status">
            Página {consulta.pagina}
            {!cargando && !error && sesiones.length > 0 && (
              <> · Sesiones {(consulta.pagina - 1) * TAMANO_PAGINA + 1}–{(consulta.pagina - 1) * TAMANO_PAGINA + sesiones.length}</>
            )}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" icon={ChevronLeft} disabled={cargando || consulta.pagina === 1}
              onClick={() => setConsulta({ ...consulta, pagina: consulta.pagina - 1 })}>Anterior</Button>
            <Button variant="secondary" iconRight={ChevronRight} disabled={cargando || !hayMas}
              onClick={() => setConsulta({ ...consulta, pagina: consulta.pagina + 1 })}>Siguiente</Button>
          </div>
        </nav>
      </section>
    </div>
  );
}
