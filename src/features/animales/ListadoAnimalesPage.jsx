import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarAnimales } from "../../api/animales";

export default function ListadoAnimalesPage() {
  const [busqueda, setBusqueda] = useState("");
  const [animales, setAnimales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCargando(true);
    listarAnimales({ q: busqueda || undefined })
      .then(setAnimales)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [busqueda]);

  return (
    <section>
      <h1 className="text-xl font-semibold text-gray-900">Rodeo</h1>

      <input
        type="text"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por identificador…"
        className="mt-4 w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
      />

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {cargando && <p className="mt-4 text-sm text-gray-500">Cargando…</p>}

      {!cargando && animales.length === 0 && (
        <p className="mt-4 text-sm text-gray-500">No hay animales registrados todavía.</p>
      )}

      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {animales.map((animal) => (
          <li key={animal.id}>
            <Link
              to={`/animales/${animal.id}`}
              className="block rounded-md border border-gray-200 bg-white p-4 hover:border-emerald-400 hover:shadow-sm"
            >
              <p className="font-medium text-gray-900">{animal.identificador}</p>
              <p className="text-sm text-gray-500">
                {animal.lote_id ? `Lote #${animal.lote_id}` : "Sin lote asignado"}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
