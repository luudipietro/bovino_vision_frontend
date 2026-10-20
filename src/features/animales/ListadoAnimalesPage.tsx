import { PawPrint, Plus, Scale, Search } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { crearAnimal, listarAnimales } from "../../api/animales";
import { mensajeDeError } from "../../api/client";
import { listarLotes } from "../../api/lotes";
import type { Animal, Lote, Uuid } from "../../api/tipos";
import Badge from "../../components/Badge";
import StatCard from "../../components/StatCard";

export default function ListadoAnimalesPage() {
  const [busqueda, setBusqueda] = useState("");
  const [idLote, setIdLote] = useState<Uuid | null>(null);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [animales, setAnimales] = useState<Animal[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarAlta, setMostrarAlta] = useState(false);
  const [nuevoIdentificador, setNuevoIdentificador] = useState("");

  useEffect(() => {
    listarLotes()
      .then(setLotes)
      .catch(() => {});
  }, []);

  useEffect(() => {
    // A newer search or filter makes this response stale.
    let vigente = true;
    setCargando(true);
    listarAnimales({ q: busqueda, idLote })
      .then((encontrados) => vigente && setAnimales(encontrados))
      .catch((err: unknown) => vigente && setError(mensajeDeError(err)))
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, [busqueda, idLote]);

  async function altaRapida(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const identificador = nuevoIdentificador.trim();
    if (!identificador) return;
    try {
      const animal = await crearAnimal({ identificador });
      setAnimales((actuales) => [animal, ...actuales]);
      setNuevoIdentificador("");
      setMostrarAlta(false);
    } catch (err) {
      setError(mensajeDeError(err));
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-900">Rodeo</h1>
        <button
          type="button"
          onClick={() => setMostrarAlta((valor) => !valor)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-green-900 text-white shadow-sm hover:bg-green-800"
          aria-label="Dar de alta un animal"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {mostrarAlta && (
        <form onSubmit={altaRapida} className="mt-3 flex gap-2">
          <input
            type="text"
            autoFocus
            value={nuevoIdentificador}
            onChange={(e) => setNuevoIdentificador(e.target.value)}
            placeholder="Identificador del nuevo animal"
            className="flex-1 rounded-xl border border-stone-300 px-3 py-2 text-sm focus:border-green-700 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-green-900 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
          >
            Agregar
          </button>
        </form>
      )}

      <div className="mt-4">
        <StatCard icon={PawPrint} label="Total cabezas" value={animales.length} />
      </div>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por identificador…"
          className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-green-700 focus:outline-none"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setIdLote(null)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            idLote === null ? "bg-green-900 text-white" : "bg-stone-100 text-stone-600"
          }`}
        >
          Todos
        </button>
        {lotes.map((lote) => (
          <button
            key={lote.id}
            type="button"
            onClick={() => setIdLote(lote.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              idLote === lote.id ? "bg-green-900 text-white" : "bg-stone-100 text-stone-600"
            }`}
          >
            Lote {lote.codigo}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {cargando && <p className="mt-4 text-sm text-stone-400">Cargando…</p>}
      {!cargando && animales.length === 0 && (
        <p className="mt-4 text-sm text-stone-400">No hay animales registrados todavía.</p>
      )}

      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {animales.map((animal) => (
          <li key={animal.id}>
            <Link
              to={`/animales/${animal.id}`}
              className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-800">
                <PawPrint className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-bold text-stone-900">{animal.identificador}</p>
                  {animal.lote_codigo && <Badge tone="brand">Lote {animal.lote_codigo}</Badge>}
                </div>
                <p className="text-xs text-stone-400">{animal.raza ?? "Raza sin registrar"}</p>
                {animal.alertas_activas > 0 && (
                  <Badge tone="danger" className="mt-1">
                    {animal.alertas_activas === 1
                      ? "1 alerta activa"
                      : `${animal.alertas_activas} alertas activas`}
                  </Badge>
                )}
                <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-stone-700">
                  <Scale className="h-3.5 w-3.5 text-stone-400" />
                  {animal.ultimo_peso_kg != null ? `${animal.ultimo_peso_kg} kg` : "Sin pesajes"}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
