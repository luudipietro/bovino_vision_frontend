import { ArrowLeft, Pencil, Scale } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { listarAlertasDeAnimal } from "../../api/alertas";
import { historialDeLotes, historialDePesajes, modificarAnimal, obtenerAnimal } from "../../api/animales";
import { mensajeDeError } from "../../api/client";
import type { Alerta, Animal, AsignacionLote, PesajeHistorial } from "../../api/tipos";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import Card, { CardHeader } from "../../components/Card";
import { EmptyState, Loading, Notice } from "../../components/Feedback";
import KpiTile from "../../components/KpiTile";
import LineChart from "../../components/LineChart";
import PageHeader from "../../components/PageHeader";
import { formatearFecha, formatearFechaCorta, formatearKg, formatearNumero } from "../../lib/formato";
import { describirAlerta, formatearGmd, nivelDePrioridad } from "../alertas/textos";
import { usePuede } from "../auth/useSesion";
import CamposAnimal from "./CamposAnimal";
import {
  cambiosDeAnimal,
  etiquetaDeSexo,
  type FormularioAnimal,
  formularioDesde,
} from "./formularioAnimal";
import LineaDePesajes from "./LineaDePesajes";
import PesarAnimal from "./PesarAnimal";
import { useCatalogos } from "./useCatalogos";

export default function FichaAnimalPage() {
  const puedeGestionar = usePuede("rodeo_gestionar");
  const puedePesar = usePuede("capturas_registrar");
  const { id = "" } = useParams();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [pesajes, setPesajes] = useState<PesajeHistorial[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [lotesDelAnimal, setLotesDelAnimal] = useState<AsignacionLote[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [edicion, setEdicion] = useState<FormularioAnimal | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorEdicion, setErrorEdicion] = useState<string | null>(null);
  const { razas, lotes } = useCatalogos();

  useEffect(() => {
    Promise.all([
      obtenerAnimal(id),
      historialDePesajes(id),
      listarAlertasDeAnimal(id),
      historialDeLotes(id),
    ])
      .then(([datosAnimal, historial, alertasAnimal, asignaciones]) => {
        setAnimal(datosAnimal);
        setPesajes(historial);
        setAlertas(alertasAnimal);
        setLotesDelAnimal(asignaciones);
      })
      .catch((err: unknown) => setError(mensajeDeError(err)));
  }, [id]);

  async function guardarEdicion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!animal || !edicion) return;
    const cambios = cambiosDeAnimal(animal, edicion);
    if (Object.keys(cambios).length === 0) {
      setEdicion(null);
      return;
    }
    setGuardando(true);
    setErrorEdicion(null);
    try {
      setAnimal(await modificarAnimal(animal.id, cambios));
      if (cambios.id_lote) setLotesDelAnimal(await historialDeLotes(animal.id));
      setEdicion(null);
    } catch (err) {
      setErrorEdicion(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  }

  const volver = (
    <Link
      to="/animales"
      className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-neutral-600 hover:text-green-800"
    >
      <ArrowLeft className="h-[18px] w-[18px]" />
      Rodeo
    </Link>
  );

  if (error) {
    return (
      <section className="space-y-4">
        {volver}
        <Notice tone="danger">{error}</Notice>
      </section>
    );
  }
  if (!animal) return <Loading />;

  // The history only holds weighing events (failed estimations never create one), newest first.
  const ultimoPesaje = pesajes[0] ?? null;
  const pesajeAnterior = pesajes[1] ?? null;
  const delta =
    ultimoPesaje && pesajeAnterior ? ultimoPesaje.peso_kg - pesajeAnterior.peso_kg : null;

  // The API also returns resolved alerts; only the active ones are shown as such.
  const alertasActivas = alertas.filter((alerta) => alerta.estado === "activa");

  const cronologico = [...pesajes].reverse();
  const metadatos = [
    animal.raza ?? "Raza sin registrar",
    animal.sexo ? etiquetaDeSexo(animal.sexo) : null,
    animal.lote_codigo ? `Lote ${animal.lote_codigo}` : "Sin lote asignado",
    animal.fecha_nacimiento ? `Nació el ${formatearFecha(animal.fecha_nacimiento)}` : null,
  ].filter((dato): dato is string => dato !== null);

  return (
    <section className="space-y-6">
      {volver}
      <PageHeader
        title={animal.identificador}
        subtitle={metadatos.join(" · ")}
        actions={
          (puedePesar || (puedeGestionar && !edicion)) && (
            <>
              {puedePesar && <PesarAnimal idAnimal={animal.id} />}
              {puedeGestionar && !edicion && (
                <Button
                  variant="secondary"
                  icon={Pencil}
                  onClick={() => {
                    setErrorEdicion(null);
                    setEdicion(formularioDesde(animal));
                  }}
                >
                  Editar datos
                </Button>
              )}
            </>
          )
        }
      />

      {edicion && (
        <Card className="md:p-6">
          <form onSubmit={guardarEdicion} className="space-y-4">
            <CardHeader
              title="Editar datos del animal"
              subtitle="Un dato ya cargado se puede cambiar, pero no dejar vacío."
            />
            <CamposAnimal
              valor={edicion}
              onChange={setEdicion}
              razas={razas}
              lotes={lotes}
              original={formularioDesde(animal)}
            />
            {errorEdicion && <Notice tone="danger">{errorEdicion}</Notice>}
            <div className="flex gap-2">
              <Button type="submit" disabled={guardando}>
                {guardando ? "Guardando…" : "Guardar cambios"}
              </Button>
              <Button variant="ghost" onClick={() => setEdicion(null)} disabled={guardando}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile
          label="Último pesaje"
          value={ultimoPesaje ? formatearKg(ultimoPesaje.peso_kg, 1) : "—"}
        />
        <KpiTile
          label="Variación vs. anterior"
          value={
            delta != null ? `${delta > 0 ? "+" : ""}${formatearKg(delta, 1)}` : "—"
          }
          tone={delta != null && delta < 0 ? "danger" : "default"}
        />
        <KpiTile
          label="GMD del último intervalo"
          value={ultimoPesaje?.gmd_kg_dia != null ? formatearGmd(ultimoPesaje.gmd_kg_dia) : "—"}
          tone={ultimoPesaje?.gmd_kg_dia != null && ultimoPesaje.gmd_kg_dia < 0 ? "danger" : "default"}
        />
        <KpiTile label="Pesajes" value={formatearNumero(pesajes.length)} />
      </div>

      {alertasActivas.length > 0 ? (
        <div className="space-y-2">
          {alertasActivas.map((alerta) => {
            const nivel = nivelDePrioridad(alerta.prioridad);
            return (
              <Notice key={alerta.id} tone={nivel === "alta" ? "danger" : "warning"}>
                {describirAlerta(alerta)} · prioridad {nivel} ·{" "}
                {formatearFecha(alerta.fecha_generacion)}
              </Notice>
            );
          })}
        </div>
      ) : (
        <Notice tone="success">Este animal no tiene alertas activas.</Notice>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Curva de crecimiento" subtitle="Peso estimado en cada pesaje" />
          <div className="mt-4">
            <LineChart
              labels={cronologico.map((p) => formatearFechaCorta(p.fecha_pesaje))}
              series={[{ name: "Peso", values: cronologico.map((p) => p.peso_kg) }]}
              formatValue={(valor) => formatearKg(valor, 1)}
              formatAxis={(valor) => formatearKg(valor)}
              ariaLabel="Curva de crecimiento del animal"
            />
          </div>
        </Card>

        <Card>
          <CardHeader title="Registro cronológico de pesajes" subtitle="Del más reciente al más antiguo" />
          <div className="mt-5">
            {pesajes.length === 0 ? (
              <EmptyState
                icon={Scale}
                title="Todavía no tiene pesajes registrados"
                action={puedePesar && <PesarAnimal idAnimal={animal.id} />}
              />
            ) : (
              <LineaDePesajes pesajes={pesajes} />
            )}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Historial de lotes" subtitle="Cada pesaje se asocia al lote vigente en su fecha" />
        {lotesDelAnimal.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">Nunca estuvo asignado a un lote.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {lotesDelAnimal.map((asignacion) => (
              <li
                key={`${asignacion.id_lote}-${asignacion.vigente_desde}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-neutral-200 px-4 py-3 text-sm"
              >
                <span className="font-semibold text-neutral-800">Lote {asignacion.lote_codigo}</span>
                <span className="flex items-center gap-2 text-xs text-neutral-500">
                  {formatearFecha(asignacion.vigente_desde)} –{" "}
                  {asignacion.vigente_hasta ? formatearFecha(asignacion.vigente_hasta) : "hoy"}
                  {!asignacion.vigente_hasta && <Badge tone="brand">Vigente</Badge>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}
