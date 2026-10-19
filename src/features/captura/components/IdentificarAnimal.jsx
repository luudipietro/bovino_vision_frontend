import { useState } from "react";
import { crearAnimal, listarAnimales } from "../../../api/animales";

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

  const sinCoincidencias =
    busqueda.trim().length > 0 && !buscando && resultados.length === 0;

  return (
    <section>
      <h1 className="text-xl font-semibold text-gray-900">Identificar animal</h1>
      <p className="mt-1 text-sm text-gray-500">
        Buscá por identificador (caravana). Si no existe, podés darlo de alta.
      </p>

      <input
        type="text"
        value={busqueda}
        onChange={(e) => buscar(e.target.value)}
        placeholder="Identificador del animal"
        className="mt-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
      />

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {resultados.length > 0 && (
        <ul className="mt-4 divide-y divide-gray-200 rounded-md border border-gray-200">
          {resultados.map((animal) => (
            <li key={animal.id}>
              <button
                type="button"
                onClick={() => onSeleccionar(animal)}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50"
              >
                <span className="font-medium text-gray-900">{animal.identificador}</span>
                {animal.lote_id && (
                  <span className="ml-2 text-gray-500">Lote #{animal.lote_id}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {sinCoincidencias && (
        <div className="mt-4 rounded-md border border-dashed border-gray-300 p-4 text-sm">
          <p className="text-gray-600">
            No hay ningún animal con identificador “{busqueda.trim()}”.
          </p>
          <button
            type="button"
            onClick={altaRapida}
            className="mt-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Dar de alta “{busqueda.trim()}”
          </button>
        </div>
      )}
    </section>
  );
}
