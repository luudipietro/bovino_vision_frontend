import { PlusCircle, Search } from "lucide-react";
import { useState } from "react";
import { crearAnimal, listarAnimales } from "../../../api/animales";
import Badge from "../../../components/Badge";

export default function IdentificarAnimal({ onSeleccionar }) {
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState(null);

  async function buscar(texto) {
    setBusqueda(texto);
    if (!texto.trim()) {
      setResultados([]);
      return;
    }
    setBuscando(true);
    try {
      setResultados(await listarAnimales({ q: texto }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBuscando(false);
    }
  }

  async function altaRapida() {
    setError(null);
    try {
      const nuevoAnimal = await crearAnimal({ identificador: busqueda.trim() });
      onSeleccionar(nuevoAnimal);
    } catch (err) {
      setError(err.message);
    }
  }

  const sinCoincidencias = busqueda.trim().length > 0 && !buscando && resultados.length === 0;

  return (
    <section>
      <h1 className="text-xl font-bold text-stone-900">Identificación del animal</h1>
      <p className="mt-1 text-sm text-stone-500">
        Ingresá el identificador (caravana). Si no existe, lo das de alta.
      </p>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => buscar(e.target.value)}
          placeholder="Ingrese ID…"
          className="w-full rounded-xl border border-stone-300 bg-white py-3 pl-9 pr-3 text-sm focus:border-green-700 focus:outline-none"
        />
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {resultados.length > 0 && (
        <ul className="mt-4 space-y-2">
          {resultados.map((animal) => (
            <li key={animal.id}>
              <button
                type="button"
                onClick={() => onSeleccionar(animal)}
                className="flex w-full items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-left shadow-sm hover:border-green-700"
              >
                <span className="font-bold text-stone-900">{animal.identificador}</span>
                {animal.lote_codigo && <Badge tone="brand">Lote {animal.lote_codigo}</Badge>}
              </button>
            </li>
          ))}
        </ul>
      )}

      {sinCoincidencias && (
        <div className="mt-4 rounded-2xl border border-dashed border-stone-300 p-4 text-sm">
          <p className="text-stone-600">
            No hay ningún animal con identificador “{busqueda.trim()}”.
          </p>
          <button
            type="button"
            onClick={altaRapida}
            className="mt-3 flex items-center gap-1.5 rounded-xl bg-green-900 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800"
          >
            <PlusCircle className="h-4 w-4" />
            Dar de alta “{busqueda.trim()}”
          </button>
        </div>
      )}
    </section>
  );
}
