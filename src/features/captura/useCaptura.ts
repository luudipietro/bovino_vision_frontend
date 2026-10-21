import { useEffect, useRef, useState } from "react";
import {
  confirmarCaptura,
  iniciarSesionCaptura,
  obtenerCaptura,
  subirCaptura,
} from "../../api/capturas";
import { mensajeDeError } from "../../api/client";
import { obtenerPesaje, solicitarPesaje } from "../../api/pesajes";
import type { Animal, Captura, Uuid } from "../../api/tipos";
import { esperarResultado, type ResultadoCaptura } from "./esperarResultado";

const INTERVALO_CONSULTA_MS = 1000;

export type PasoCaptura = "identificar" | "foto" | "procesando" | "resultado";

export type { ResultadoCaptura };

const esperar = () => new Promise<void>((resolve) => setTimeout(resolve, INTERVALO_CONSULTA_MS));

export function useCaptura() {
  const [idSesion, setIdSesion] = useState<Uuid | null>(null);
  const [paso, setPaso] = useState<PasoCaptura>("identificar");
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [captura, setCaptura] = useState<Captura | null>(null);
  const [resultado, setResultado] = useState<ResultadoCaptura | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The API does not serve images: the session gallery shows the photos taken in this tab.
  const [vistasPrevias, setVistasPrevias] = useState<Record<Uuid, string>>({});
  const [versionGaleria, setVersionGaleria] = useState(0);
  // Polling stops when the page unmounts or the operator moves on.
  const consultaVigente = useRef(0);
  const urlsCreadas = useRef<string[]>([]);

  useEffect(() => {
    const consultas = consultaVigente;
    const urls = urlsCreadas;
    iniciarSesionCaptura()
      .then((sesion) => setIdSesion(sesion.id))
      .catch((err: unknown) => setError(mensajeDeError(err)));
    return () => {
      consultas.current++;
      urls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function seleccionarAnimal(animalSeleccionado: Animal) {
    setAnimal(animalSeleccionado);
    setCaptura(null);
    setResultado(null);
    setError(null);
    setPaso("foto");
  }

  async function subirFoto(archivo: File) {
    if (!idSesion || !animal) return;
    setCargando(true);
    setError(null);
    try {
      const nueva = await subirCaptura({ idSesion, idAnimal: animal.id, archivo });
      const url = URL.createObjectURL(archivo);
      urlsCreadas.current.push(url);
      setCaptura(nueva);
      setVistasPrevias((actuales) => ({ ...actuales, [nueva.id]: url }));
      setVersionGaleria((version) => version + 1);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }

  async function consultarHastaTerminar(idCaptura: Uuid) {
    const consulta = ++consultaVigente.current;
    const sigueVigente = () => consulta === consultaVigente.current;
    setError(null);
    try {
      const final = await esperarResultado(idCaptura, {
        obtenerCaptura,
        obtenerPesaje,
        esperar,
        sigueVigente,
        alActualizar: setCaptura,
      });
      if (!final) return;
      setResultado(final);
      setPaso("resultado");
      setVersionGaleria((version) => version + 1);
    } catch (err) {
      if (sigueVigente()) setError(mensajeDeError(err));
    }
  }

  async function procesarPesaje() {
    if (!captura) return;
    const consulta = consultaVigente.current;
    setCargando(true);
    setError(null);
    try {
      await solicitarPesaje(captura.id);
      // The operator may have left the page while the request was in flight.
      if (consulta !== consultaVigente.current) return;
      setPaso("procesando");
    } catch (err) {
      setError(mensajeDeError(err));
      return;
    } finally {
      setCargando(false);
    }
    await consultarHastaTerminar(captura.id);
  }

  function reintentarConsulta() {
    if (captura) void consultarHastaTerminar(captura.id);
  }

  async function confirmarResultado() {
    if (resultado?.tipo !== "estimado") return;
    setCargando(true);
    setError(null);
    try {
      const confirmada = await confirmarCaptura(resultado.captura.id);
      setResultado({ ...resultado, captura: confirmada });
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }

  function pesarOtroAnimal() {
    consultaVigente.current++;
    setAnimal(null);
    setCaptura(null);
    setResultado(null);
    setError(null);
    setPaso("identificar");
  }

  function reintentarFoto() {
    setCaptura(null);
    setError(null);
  }

  return {
    idSesion,
    vistasPrevias,
    versionGaleria,
    paso,
    animal,
    captura,
    resultado,
    cargando,
    error,
    seleccionarAnimal,
    subirFoto,
    procesarPesaje,
    reintentarConsulta,
    confirmarResultado,
    pesarOtroAnimal,
    reintentarFoto,
  };
}
