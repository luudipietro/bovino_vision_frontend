import { ArrowDown, ArrowUp, Calendar, Dna, LayoutGrid, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { listarAlertasDeAnimal } from "../../api/alertas";
import { historialDePesajes, obtenerAnimal } from "../../api/animales";
import { mensajeDeError } from "../../api/client";
import type { Alerta, Animal, PesajeHistorial } from "../../api/tipos";
import Badge from "../../components/Badge";
import EvolucionChart from "../../components/EvolucionChart";
import { describirAlerta, formatearGmd, nivelDePrioridad } from "../alertas/textos";

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

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!animal) return <p className="text-sm text-stone-400">Cargando…</p>;

  // The history only holds weighing events (failed estimations never create one), newest first.
  const ultimoPesaje = pesajes[0] ?? null;
  const pesajeAnterior = pesajes[1] ?? null;
  const delta =
    ultimoPesaje && pesajeAnterior ? ultimoPesaje.peso_kg - pesajeAnterior.peso_kg : null;

  const puntosEvolucion = [...pesajes]
    .reverse()
    .map((p) => ({ fecha: p.fecha_pesaje.slice(0, 10), peso_promedio_kg: p.peso_kg }));

  return (
    <section>
      <Link to="/animales" className="text-sm font-semibold text-green-800 hover:underline">
        ← Volver al rodeo
      </Link>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold text-stone-900">{animal.identificador}</h1>
        {animal.sexo && <Badge tone="brand">{animal.sexo}</Badge>}
      </div>

      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500">
        <span className="flex items-center gap-1.5">
          <Dna className="h-4 w-4" /> {animal.raza ?? "Raza sin registrar"}
        </span>
        <span className="flex items-center gap-1.5">
          <LayoutGrid className="h-4 w-4" />
          {animal.lote_codigo ? `Lote ${animal.lote_codigo}` : "Sin lote asignado"}
        </span>
        {animal.fecha_nacimiento && (
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" /> Nació {animal.fecha_nacimiento}
          </span>
        )}
      </div>

      {alertas.length > 0 && (
        <div className="mt-4 space-y-2">
          {alertas.map((alerta) => (
            <div
              key={alerta.id}
              className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              {describirAlerta(alerta)} · prioridad {nivelDePrioridad(alerta.prioridad)} ·{" "}
              {new Date(alerta.fecha_generacion).toLocaleDateString()}
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,260px)_1fr]">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
            Último pesaje
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-4xl font-bold text-green-900">
              {ultimoPesaje ? ultimoPesaje.peso_kg : "—"}
            </p>
            {ultimoPesaje && <span className="text-lg text-stone-400">kg</span>}
          </div>
          {delta != null && (
            <Badge tone={delta >= 0 ? "brand" : "danger"} className="mt-2 gap-1">
              {delta >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {delta >= 0 ? "+" : ""}
              {delta.toFixed(1)} kg
            </Badge>
          )}
          {ultimoPesaje && (
            <p className="mt-3 text-xs text-stone-400">
              {new Date(ultimoPesaje.fecha_pesaje).toLocaleString()}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-stone-700">
            <TrendingUp className="h-4 w-4" /> Curva de crecimiento
          </p>
          <div className="mt-3">
            <EvolucionChart puntos={puntosEvolucion} />
          </div>
        </div>
      </div>

      <h2 className="mt-6 text-sm font-semibold text-stone-700">
        Registro cronológico de pesajes
      </h2>

      {pesajes.length === 0 ? (
        <p className="mt-2 text-sm text-stone-400">Todavía no tiene pesajes registrados.</p>
      ) : (
        <ul className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pesajes.map((pesaje) => (
            <li
              key={pesaje.id}
              className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
            >
              <p className="text-lg font-bold text-stone-900">{pesaje.peso_kg} kg</p>
              {pesaje.gmd_kg_dia != null && (
                <Badge tone={pesaje.gmd_kg_dia >= 0 ? "brand" : "danger"} className="mt-1">
                  GMD {formatearGmd(pesaje.gmd_kg_dia)}
                </Badge>
              )}
              <p className="mt-2 text-xs text-stone-400">
                {new Date(pesaje.fecha_pesaje).toLocaleString()}
                {pesaje.lote_codigo && ` · Lote ${pesaje.lote_codigo}`}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
