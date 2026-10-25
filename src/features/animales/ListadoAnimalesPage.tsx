import { PawPrint, Plus, X } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { crearAnimal, listarAnimales } from "../../api/animales";
import { mensajeDeError } from "../../api/client";
import type { Animal } from "../../api/tipos";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { EmptyState, Loading, Notice } from "../../components/Feedback";
import Field, { Input, SearchInput } from "../../components/Field";
import KpiTile from "../../components/KpiTile";
import PageHeader from "../../components/PageHeader";
import { formatearNumero } from "../../lib/formato";
import { usePuede } from "../auth/useSesion";
import CamposAnimal from "./CamposAnimal";
import ChipsDeFiltro from "./ChipsDeFiltro";
import { FORMULARIO_VACIO, type FormularioAnimal, nuevoAnimalDesde } from "./formularioAnimal";
import { motivoDeListadoVacio } from "./listadoVacio";
import { type ChipRodeo, filtrosDeChip, resumenDelRodeo } from "./rodeo";
import TarjetaAnimal from "./TarjetaAnimal";
import { useCatalogos } from "./useCatalogos";

export default function ListadoAnimalesPage() {
  const puedeGestionar = usePuede("rodeo_gestionar");
  const [busqueda, setBusqueda] = useState("");
  const [chip, setChip] = useState<ChipRodeo>({ tipo: "todos" });
  const [animales, setAnimales] = useState<Animal[]>([]);
  // The whole herd, unfiltered: feeds the "Total cabezas" counter whatever chip is active.
  const [rodeoCompleto, setRodeoCompleto] = useState<Animal[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarAlta, setMostrarAlta] = useState(false);
  const [nuevoIdentificador, setNuevoIdentificador] = useState("");
  const [nuevosDatos, setNuevosDatos] = useState<FormularioAnimal>(FORMULARIO_VACIO);
  const [errorAlta, setErrorAlta] = useState<string | null>(null);
  const { razas, lotes } = useCatalogos();

  const { idLote, conAlertasActivas: soloConAlertas } = filtrosDeChip(chip);

  useEffect(() => {
    // The counter is a nicety: if it fails the list still works.
    listarAnimales()
      .then(setRodeoCompleto)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    // A newer search or filter makes this response stale.
    let vigente = true;
    setCargando(true);
    listarAnimales({ q: busqueda, idLote, conAlertasActivas: soloConAlertas })
      .then((encontrados) => {
        if (!vigente) return;
        setAnimales(encontrados);
        setError(null);
      })
      .catch((err: unknown) => vigente && setError(mensajeDeError(err)))
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, [busqueda, idLote, soloConAlertas]);

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
      setRodeoCompleto((actuales) => [animal, ...actuales]);
      setNuevoIdentificador("");
      setMostrarAlta(false);
    } catch (err) {
      setErrorAlta(mensajeDeError(err));
    }
  }

  const cabezas = animales.length;
  const resumen = resumenDelRodeo(rodeoCompleto);
  const lotePorId = new Map(lotes.map((lote) => [lote.id, lote]));
  const filtros = { busqueda, idLote, conAlertasActivas: soloConAlertas };

  function quitarFiltros() {
    setBusqueda("");
    setChip({ tipo: "todos" });
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Rodeo"
        subtitle={`${formatearNumero(cabezas)} ${cabezas === 1 ? "resultado" : "resultados"}`}
      />

      <div className="max-w-sm">
        <KpiTile
          label="Total cabezas"
          value={formatearNumero(resumen.cabezas)}
          detail={`${formatearNumero(lotes.length)} ${lotes.length === 1 ? "lote" : "lotes"} · ${formatearNumero(resumen.conAlertas)} ${resumen.conAlertas === 1 ? "alerta" : "alertas"}`}
        />
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <SearchInput
          aria-label="Buscar por identificador"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por identificador…"
          className="md:max-w-sm md:flex-1"
        />
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

      <ChipsDeFiltro activo={chip} lotes={lotes} onChange={setChip} />

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
      {!cargando && !error && animales.length === 0 && (
        motivoDeListadoVacio(filtros) === "con_filtros" ? (
          <EmptyState
            icon={PawPrint}
            title="Ningún animal coincide con los filtros"
            action={
              <Button variant="secondary" icon={X} onClick={quitarFiltros}>
                Quitar filtros
              </Button>
            }
          >
            Probá con otra búsqueda o quitá los filtros para ver todo el rodeo.
          </EmptyState>
        ) : (
          <EmptyState
            icon={PawPrint}
            title="Todavía no hay animales cargados"
            action={
              puedeGestionar && (
                <Button icon={Plus} onClick={abrirAlta}>
                  Dar de alta un animal
                </Button>
              )
            }
          >
            {puedeGestionar
              ? "Dá de alta el primero para empezar a registrar sus pesajes."
              : "Cuando se den de alta animales, van a aparecer acá."}
          </EmptyState>
        )
      )}

      {animales.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {animales.map((animal) => (
            <TarjetaAnimal
              key={animal.id}
              animal={animal}
              lote={animal.id_lote ? (lotePorId.get(animal.id_lote) ?? null) : null}
            />
          ))}
        </div>
      )}
    </section>
  );
}
