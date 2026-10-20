import { ArrowLeft, Scale } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { listarAlertasDeAnimal } from "../../api/alertas";
import { historialDePesajes, obtenerAnimal } from "../../api/animales";
import { mensajeDeError } from "../../api/client";
import type { Alerta, Animal, PesajeHistorial } from "../../api/tipos";
import Card, { CardHeader } from "../../components/Card";
import { EmptyState, Loading, Notice } from "../../components/Feedback";
import KpiTile from "../../components/KpiTile";
import LineChart from "../../components/LineChart";
import PageHeader from "../../components/PageHeader";
import { formatearFecha, formatearFechaCorta, formatearKg, formatearNumero } from "../../lib/formato";
import { describirAlerta, formatearGmd, nivelDePrioridad } from "../alertas/textos";
import LineaDePesajes from "./LineaDePesajes";

export default function FichaAnimalPage() {
  const { id = "" } = useParams();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [pesajes, setPesajes] = useState<PesajeHistorial[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([obtenerAnimal(id), historialDePesajes(id), listarAlertasDeAnimal(id)])
      .then(([datosAnimal, historial, alertasAnimal]) => {
        setAnimal(datosAnimal);
        setPesajes(historial);
        setAlertas(alertasAnimal);
      })
      .catch((err: unknown) => setError(mensajeDeError(err)));
  }, [id]);

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

  const cronologico = [...pesajes].reverse();
  const metadatos = [
    animal.raza ?? "Raza sin registrar",
    animal.sexo ? (animal.sexo === "macho" ? "Macho" : "Hembra") : null,
    animal.lote_codigo ? `Lote ${animal.lote_codigo}` : "Sin lote asignado",
    animal.fecha_nacimiento ? `Nació el ${formatearFecha(animal.fecha_nacimiento)}` : null,
  ].filter((dato): dato is string => dato !== null);

  return (
    <section className="space-y-6">
      {volver}
      <PageHeader title={animal.identificador} subtitle={metadatos.join(" · ")} />

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

      {alertas.length > 0 && (
        <div className="space-y-2">
          {alertas.map((alerta) => {
            const nivel = nivelDePrioridad(alerta.prioridad);
            return (
              <Notice key={alerta.id} tone={nivel === "alta" ? "danger" : "warning"}>
                {describirAlerta(alerta)} · prioridad {nivel} ·{" "}
                {formatearFecha(alerta.fecha_generacion)}
              </Notice>
            );
          })}
        </div>
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
              <EmptyState icon={Scale} title="Todavía no tiene pesajes registrados" />
            ) : (
              <LineaDePesajes pesajes={pesajes} />
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}
