import { Eye, PawPrint, Plus, X } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { crearAnimal, listarAnimales } from "../../api/animales";
import { mensajeDeError } from "../../api/client";
import type { Animal, Uuid } from "../../api/tipos";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { EmptyState, Loading, Notice } from "../../components/Feedback";
import Field, { Input, SearchInput, Select } from "../../components/Field";
import PageHeader from "../../components/PageHeader";
import { Cell, TableHeader, TableRow } from "../../components/Table";
import { formatearKg, formatearNumero } from "../../lib/formato";
import { usePuede } from "../auth/useSesion";
import CamposAnimal from "./CamposAnimal";
import { FORMULARIO_VACIO, type FormularioAnimal, nuevoAnimalDesde } from "./formularioAnimal";
import { useCatalogos } from "./useCatalogos";

const COLUMNAS = "md:grid-cols-[1.4fr_1fr_0.8fr_0.9fr_1.2fr_auto]";

export default function ListadoAnimalesPage() {
  const puedeGestionar = usePuede("rodeo_gestionar");
  const [busqueda, setBusqueda] = useState("");
  const [idLote, setIdLote] = useState<Uuid | null>(null);
  const [animales, setAnimales] = useState<Animal[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarAlta, setMostrarAlta] = useState(false);
  const [nuevoIdentificador, setNuevoIdentificador] = useState("");
  const [nuevosDatos, setNuevosDatos] = useState<FormularioAnimal>(FORMULARIO_VACIO);
  const [errorAlta, setErrorAlta] = useState<string | null>(null);
  const { razas, lotes } = useCatalogos();

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

  function abrirAlta() {
    // A new animal starts in the lot being viewed, if any.
    setNuevosDatos({ ...FORMULARIO_VACIO, idLote: idLote ?? "" });
    setErrorAlta(null);
    setMostrarAlta(true);
  }

  async function darDeAlta(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!nuevoIdentificador.trim()) return;
    setErrorAlta(null);
    try {
      const animal = await crearAnimal(nuevoAnimalDesde(nuevoIdentificador, nuevosDatos));
      setAnimales((actuales) => [animal, ...actuales]);
      setNuevoIdentificador("");
      setMostrarAlta(false);
    } catch (err) {
      setErrorAlta(mensajeDeError(err));
    }
  }

  const cabezas = animales.length;

  return (
    <section className="space-y-6">
      <PageHeader
        title="Rodeo"
        subtitle={`${formatearNumero(cabezas)} ${cabezas === 1 ? "cabeza" : "cabezas"}`}
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <SearchInput
          aria-label="Buscar por identificador"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por identificador…"
          className="md:max-w-sm md:flex-1"
        />
        <Select
          aria-label="Filtrar por lote"
          value={idLote ?? ""}
          onChange={(e) => setIdLote(e.target.value || null)}
          className="md:w-56"
        >
          <option value="">Todos los lotes</option>
          {lotes.map((lote) => (
            <option key={lote.id} value={lote.id}>
              Lote {lote.codigo}
            </option>
          ))}
        </Select>
        {puedeGestionar && (
          <Button
            icon={mostrarAlta ? X : Plus}
            onClick={() => (mostrarAlta ? setMostrarAlta(false) : abrirAlta())}
            aria-expanded={mostrarAlta}
            className="md:ml-auto"
          >
            {mostrarAlta ? "Cerrar" : "Nuevo animal"}
          </Button>
        )}
      </div>

      {puedeGestionar && mostrarAlta && (
        <Card className="md:p-6">
          <form onSubmit={darDeAlta} className="space-y-4">
            <Field label="Identificador del nuevo animal" className="sm:max-w-sm">
              <Input
                type="text"
                autoFocus
                required
                value={nuevoIdentificador}
                onChange={(e) => setNuevoIdentificador(e.target.value)}
                placeholder="Caravana o identificador"
              />
            </Field>
            <CamposAnimal valor={nuevosDatos} onChange={setNuevosDatos} razas={razas} lotes={lotes} />
            {errorAlta && <Notice tone="danger">{errorAlta}</Notice>}
            <Button type="submit">Agregar</Button>
          </form>
        </Card>
      )}

      {error && <Notice tone="danger">{error}</Notice>}
      {cargando && <Loading />}
      {!cargando && animales.length === 0 && (
        <EmptyState icon={PawPrint} title="No hay animales para mostrar">
          Probá con otra búsqueda o dá de alta un animal nuevo.
        </EmptyState>
      )}

      {animales.length > 0 && (
        <div className="space-y-2">
          <TableHeader
            columns={COLUMNAS}
            labels={["Identificador", "Raza", "Lote", "Último peso", "Estado", "Acciones"]}
          />
          {animales.map((animal) => (
            <TableRow key={animal.id} columns={COLUMNAS}>
              <span className="min-w-0 truncate text-sm font-bold text-neutral-800">
                {animal.identificador}
              </span>
              <Cell label="Raza">
                <span className="text-brown-600">{animal.raza ?? "Sin registrar"}</span>
              </Cell>
              <Cell label="Lote" muted>
                {animal.lote_codigo ?? "Sin lote"}
              </Cell>
              <Cell label="Último peso">
                <span className="font-semibold tabular-nums">
                  {animal.ultimo_peso_kg != null ? formatearKg(animal.ultimo_peso_kg, 1) : "Sin pesajes"}
                </span>
              </Cell>
              <span>
                {animal.alertas_activas > 0 ? (
                  <Badge tone="danger">
                    {animal.alertas_activas === 1
                      ? "1 alerta activa"
                      : `${formatearNumero(animal.alertas_activas)} alertas activas`}
                  </Badge>
                ) : (
                  <Badge tone="brand">Sin alertas</Badge>
                )}
              </span>
              <Link
                to={`/animales/${animal.id}`}
                className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-neutral-600 hover:text-green-800"
              >
                <Eye className="h-[18px] w-[18px]" />
                Ver ficha
              </Link>
            </TableRow>
          ))}
        </div>
      )}
    </section>
  );
}
