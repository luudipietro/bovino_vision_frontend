import { LayoutGrid, Plus } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { mensajeDeError } from "../../api/client";
import { crearLote, listarLotes } from "../../api/lotes";
import type { Lote } from "../../api/tipos";

export default function ListadoLotesPage() {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [codigoNuevo, setCodigoNuevo] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function recargar() {
    setCargando(true);
    listarLotes()
      .then(setLotes)
      .catch((err: unknown) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false));
  }

  useEffect(recargar, []);

  async function agregarLote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!codigoNuevo.trim()) return;
    setError(null);
    try {
      await crearLote({ codigo: codigoNuevo.trim() });
      setCodigoNuevo("");
      recargar();
    } catch (err) {
      setError(mensajeDeError(err));
    }
  }

  return (
    <section>
      <h1 className="text-xl font-bold text-stone-900">Lotes</h1>

      <form onSubmit={agregarLote} className="mt-4 flex max-w-sm gap-2">
        <input
          type="text"
          value={codigoNuevo}
          onChange={(e) => setCodigoNuevo(e.target.value)}
          placeholder="Código de lote"
          className="flex-1 rounded-xl border border-stone-300 px-3 py-2 text-sm focus:border-green-700 focus:outline-none"
        />
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-xl bg-green-900 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
        >
          <Plus className="h-4 w-4" />
          Crear
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {cargando && <p className="mt-4 text-sm text-stone-400">Cargando…</p>}

      {!cargando && lotes.length === 0 && (
        <p className="mt-4 text-sm text-stone-400">No hay lotes creados todavía.</p>
      )}

      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {lotes.map((lote) => (
          <li
            key={lote.id}
            className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-800">
              <LayoutGrid className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="font-bold text-stone-900">
                Lote {lote.codigo}
                {lote.nombre && <span className="font-normal text-stone-500"> · {lote.nombre}</span>}
              </p>
              <p className="text-xs text-stone-400">
                {lote.cantidad_animales === 1 ? "1 animal" : `${lote.cantidad_animales} animales`}
                {lote.gmd_objetivo != null && ` · GMD objetivo ${lote.gmd_objetivo} kg/día`}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
