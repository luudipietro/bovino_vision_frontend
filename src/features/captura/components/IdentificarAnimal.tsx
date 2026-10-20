import { Plus, Tag } from "lucide-react";
import { useRef, useState } from "react";
import { crearAnimal, listarAnimales } from "../../../api/animales";
import { mensajeDeError } from "../../../api/client";
import type { Animal } from "../../../api/tipos";
import Button from "../../../components/Button";
import { Notice } from "../../../components/Feedback";
import { SearchInput } from "../../../components/Field";

export default function IdentificarAnimal({
  onSeleccionar,
}: {
  onSeleccionar: (animal: Animal) => void;
}) {
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState<Animal[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Responses can arrive out of order while typing; only the latest search is shown.
  const ultimaBusqueda = useRef(0);

  async function buscar(texto: string) {
    const busquedaActual = ++ultimaBusqueda.current;
    setBusqueda(texto);
    if (!texto.trim()) {
      setResultados([]);
      setBuscando(false);
      return;
    }
    setBuscando(true);
    try {
      const encontrados = await listarAnimales({ q: texto });
      if (busquedaActual === ultimaBusqueda.current) setResultados(encontrados);
    } catch (err) {
      if (busquedaActual === ultimaBusqueda.current) setError(mensajeDeError(err));
    } finally {
      if (busquedaActual === ultimaBusqueda.current) setBuscando(false);
    }
  }

  async function altaRapida() {
    setError(null);
    try {
      const nuevoAnimal = await crearAnimal({ identificador: busqueda.trim() });
      onSeleccionar(nuevoAnimal);
    } catch (err) {
      setError(mensajeDeError(err));
    }
  }

  const sinCoincidencias = busqueda.trim().length > 0 && !buscando && resultados.length === 0;

  return (
    <section>
      <h2 className="text-2xl font-medium text-neutral-800">
        Identificá el <span className="font-bold">animal</span>
      </h2>
      <p className="mt-1 text-sm text-neutral-500">
        Ingresá la caravana. Si no existe, la das de alta.
      </p>

      <SearchInput
        aria-label="Caravana del animal"
        type="text"
        value={busqueda}
        onChange={(e) => buscar(e.target.value)}
        placeholder="Ingresá la caravana…"
        autoComplete="off"
        className="mt-5 min-w-0 [&_input]:h-12 [&_input]:min-w-0"
      />

      {error && (
        <Notice tone="danger" className="mt-4">
          {error}
        </Notice>
      )}

      {resultados.length > 0 && (
        <ul className="mt-4 space-y-2">
          {resultados.map((animal) => {
            const detalle = [animal.raza, animal.lote_codigo && `Lote ${animal.lote_codigo}`]
              .filter(Boolean)
              .join(" · ");
            return (
              <li key={animal.id}>
                <button
                  type="button"
                  onClick={() => onSeleccionar(animal)}
                  className="flex min-h-16 w-full items-center gap-4 rounded-[12px] border border-neutral-200 bg-white px-4 py-3 text-left transition-colors duration-150 ease-standard hover:border-green-500 hover:bg-green-50"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-green-100 text-green-600">
                    <Tag className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-neutral-800">
                      {animal.identificador}
                    </span>
                    {detalle && (
                      <span className="block truncate text-xs text-neutral-500">{detalle}</span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {sinCoincidencias && (
        <Notice
          className="mt-4"
          action={
            <Button size="lg" icon={Plus} onClick={altaRapida} className="w-full sm:w-auto">
              Dar de alta “{busqueda.trim()}”
            </Button>
          }
        >
          No hay ningún animal con la caravana “{busqueda.trim()}”.
        </Notice>
      )}
    </section>
  );
}
