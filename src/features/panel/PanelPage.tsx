import { Layers } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { listarAlertasDelRodeo } from "../../api/alertas";
import { generarReporte, obtenerPanel } from "../../api/analitica";
import { mensajeDeError } from "../../api/client";
import { listarLotes } from "../../api/lotes";
import type { Lote, Panel, Reporte } from "../../api/tipos";
import Button from "../../components/Button";
import Card, { CardHeader, LinkStrip } from "../../components/Card";
import Field, { Input } from "../../components/Field";
import { Loading, Notice } from "../../components/Feedback";
import KpiTile from "../../components/KpiTile";
import LineChart from "../../components/LineChart";
import PageHeader from "../../components/PageHeader";
import ProgressBar from "../../components/ProgressBar";
import { formatearFechaCorta, formatearKg, formatearNumero, formatearPorcentaje } from "../../lib/formato";

const SIN_DATO = "—";
const kg = (valor: number | null) => (valor != null ? formatearKg(valor, 1) : SIN_DATO);
const gmd = (valor: number | null) => (valor != null ? `${formatearNumero(valor, 2)} kg/día` : SIN_DATO);

interface FilaLote {
  clave: string;
  nombre: string;
  animales: number;
  objetivo: number | null;
}

function DistribucionPorLote({ lotes, total }: { lotes: Lote[]; total: number }) {
  const filas: FilaLote[] = lotes.map((lote) => ({
    clave: lote.id,
    nombre: lote.nombre ? `${lote.codigo} · ${lote.nombre}` : lote.codigo,
    animales: lote.cantidad_animales,
    objetivo: lote.gmd_objetivo,
  }));
  const sinLote = total - lotes.reduce((suma, lote) => suma + lote.cantidad_animales, 0);
  if (sinLote > 0) filas.push({ clave: "sin-lote", nombre: "Sin lote", animales: sinLote, objetivo: null });

  if (total === 0 || filas.length === 0) {
    return <p className="text-sm text-neutral-500">Todavía no hay animales para repartir por lote.</p>;
  }

  return (
    <div>
      <div className="space-y-4">
        {filas.map((fila) => (
          <ProgressBar
            key={fila.clave}
            value={fila.animales / total}
            label={fila.nombre}
            valueLabel={formatearPorcentaje(fila.animales / total)}
            tone={fila.clave === "sin-lote" ? "earth" : "brand"}
          />
        ))}
      </div>
      <table className="mt-5 w-full text-left text-sm">
        <thead>
          <tr className="text-[11px] font-medium uppercase text-neutral-400">
            <th className="pb-2 font-medium">Lote</th>
            <th className="pb-2 text-right font-medium">Animales</th>
            <th className="pb-2 text-right font-medium">%</th>
            <th className="pb-2 text-right font-medium">GMD objetivo</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => (
            <tr key={fila.clave} className="border-t border-neutral-200 tabular-nums">
              <td className="py-2 pr-2 text-neutral-800">{fila.nombre}</td>
              <td className="py-2 text-right font-semibold text-neutral-800">{formatearNumero(fila.animales)}</td>
              <td className="whitespace-nowrap py-2 pl-2 text-right text-neutral-600">{formatearPorcentaje(fila.animales / total)}</td>
              <td className="whitespace-nowrap py-2 pl-2 text-right text-neutral-600">{gmd(fila.objetivo)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PanelPage() {
  const [panel, setPanel] = useState<Panel | null>(null);
  const [cantidadAlertas, setCantidadAlertas] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lotes, setLotes] = useState<Lote[] | null>(null);
  const [errorLotes, setErrorLotes] = useState<string | null>(null);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [reporte, setReporte] = useState<Reporte | null>(null);
  const [errorReporte, setErrorReporte] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([obtenerPanel(), listarAlertasDelRodeo()])
      .then(([datosPanel, alertas]) => {
        setPanel(datosPanel);
        setCantidadAlertas(alertas.length);
      })
      .catch((err: unknown) => setError(mensajeDeError(err)));
    listarLotes()
      .then(setLotes)
      .catch((err: unknown) => setErrorLotes(mensajeDeError(err)));
  }, []);

  async function consultarReporte(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorReporte(null);
    try {
      setReporte(await generarReporte({ desde, hasta }));
    } catch (err) {
      setErrorReporte(mensajeDeError(err));
    }
  }

  if (error) return <Notice tone="danger">{error}</Notice>;
  if (!panel) return <Loading />;

  const puntos = panel.evolucion_peso_promedio.filter((punto) => punto.peso_promedio_kg != null);
  const cobertura = panel.cantidad_animales > 0 ? panel.animales_con_gmd / panel.cantidad_animales : 0;

  return (
    <section className="min-w-0 space-y-6">
      <PageHeader
        title="Panel del rodeo"
        subtitle="Peso, ganancia diaria y alertas de todo el rodeo en un vistazo."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <KpiTile label="Animales" value={formatearNumero(panel.cantidad_animales)} />
        <KpiTile label="Peso promedio" value={kg(panel.peso_promedio_kg)} />
        <KpiTile label="GMD promedio" value={gmd(panel.gmd_promedio_kg_dia)} />
        <KpiTile label="Animales con GMD" value={formatearNumero(panel.animales_con_gmd)} />
        <KpiTile
          label="Alertas activas"
          value={formatearNumero(cantidadAlertas)}
          tone={cantidadAlertas > 0 ? "danger" : "default"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="flex min-w-0 flex-col gap-5">
          <CardHeader title="Evolución del peso promedio" subtitle="Promedio del rodeo en cada fecha de pesaje" />
          <LineChart
            labels={puntos.map((punto) => formatearFechaCorta(punto.fecha))}
            series={[{ name: "Peso promedio", values: puntos.map((punto) => punto.peso_promedio_kg) }]}
            formatValue={(valor) => formatearKg(valor, 1)}
            formatAxis={(valor) => formatearKg(valor)}
            ariaLabel="Evolución del peso promedio del rodeo"
          />
          <div className="mt-auto">
            <LinkStrip to="/animales">Ver animales del rodeo</LinkStrip>
          </div>
        </Card>

        <Card className="flex min-w-0 flex-col gap-5">
          <CardHeader title="Composición del rodeo" subtitle="Cobertura de GMD y reparto por lote" />
          <ProgressBar
            value={cobertura}
            label={`${formatearNumero(panel.animales_con_gmd)} de ${formatearNumero(panel.cantidad_animales)} animales con GMD`}
            valueLabel={formatearPorcentaje(cobertura)}
          />
          <div className="border-t border-neutral-200 pt-5">
            <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-neutral-800">
              <Layers className="h-[18px] w-[18px] text-green-600" /> Animales por lote
            </p>
            {errorLotes && <Notice tone="warning">No pudimos cargar los lotes. {errorLotes}</Notice>}
            {!errorLotes && !lotes && <Loading />}
            {lotes && <DistribucionPorLote lotes={lotes} total={panel.cantidad_animales} />}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Reporte por período" subtitle="Pesajes y ganancia de peso entre dos fechas" />
        <form onSubmit={consultarReporte} className="mt-5 flex flex-wrap items-end gap-4">
          <Field label="Desde" className="w-full sm:w-52">
            <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} required />
          </Field>
          <Field label="Hasta" className="w-full sm:w-52">
            <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} required />
          </Field>
          <Button type="submit" className="min-h-11 w-full sm:w-auto">
            Generar
          </Button>
        </form>

        {errorReporte && (
          <Notice tone="danger" className="mt-4">
            {errorReporte}
          </Notice>
        )}

        {reporte && (
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiTile label="Pesajes en el período" value={formatearNumero(reporte.cantidad_pesajes)} />
            <KpiTile label="Animales pesados" value={formatearNumero(reporte.cantidad_animales)} />
            <KpiTile label="Peso promedio" value={kg(reporte.peso_promedio_kg)} />
            <KpiTile label="GMD promedio" value={gmd(reporte.gmd_promedio_kg_dia)} />
          </div>
        )}
      </Card>
    </section>
  );
}
