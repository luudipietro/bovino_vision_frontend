import { useEffect, useState } from "react";
import { crearLote, listarLotes } from "../../api/lotes";

export default function ListadoLotesPage() {
  const [lotes, setLotes] = useState([]);
  const [codigoNuevo, setCodigoNuevo] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  function recargar() {
    setCargando(true);
    listarLotes()
      .then(setLotes)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }

  useEffect(recargar, []);

  async function agregarLote(event) {
    event.preventDefault();
    if (!codigoNuevo.trim()) return;
    setError(null);
    try {
      await crearLote(codigoNuevo.trim());
      setCodigoNuevo("");
      recargar();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <h1 className="text-xl font-semibold text-gray-900">Lotes</h1>

      <form onSubmit={agregarLote} className="mt-4 flex max-w-sm gap-2">
        <input
          type="text"
          value={codigoNuevo}
          onChange={(e) => setCodigoNuevo(e.target.value)}
          placeholder="Código de lote"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Crear
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {cargando && <p className="mt-4 text-sm text-gray-500">Cargando…</p>}

      {!cargando && lotes.length === 0 && (
        <p className="mt-4 text-sm text-gray-500">No hay lotes creados todavía.</p>
      )}

      <ul className="mt-4 divide-y divide-gray-200 rounded-md border border-gray-200">
        {lotes.map((lote) => (
          <li key={lote.id} className="px-4 py-3 text-sm text-gray-900">
            {lote.codigo}
          </li>
        ))}
      </ul>
    </section>
  );
}
