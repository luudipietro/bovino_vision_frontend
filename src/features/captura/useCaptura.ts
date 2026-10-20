import { useEffect, useRef, useState } from "react";
import {
  confirmarCaptura,
  iniciarSesionCaptura,
  obtenerCaptura,
  subirCaptura,
} from "../../api/capturas";
import { mensajeDeError } from "../../api/client";
import { obtenerPesaje, solicitarPesaje } from "../../api/pesajes";
import type { Animal, Captura, Pesaje, Uuid } from "../../api/tipos";

const INTERVALO_CONSULTA_MS = 1000;

export type PasoCaptura = "identificar" | "foto" | "procesando" | "resultado";

export type ResultadoCaptura =
  | { tipo: "estimado"; captura: Captura; pesaje: Pesaje }
  | { tipo: "fallido"; captura: Captura };

const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useCaptura() {
  const [idSesion, setIdSesion] = useState<Uuid | null>(null);
  const [paso, setPaso] = useState<PasoCaptura>("identificar");
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [captura, setCaptura] = useState<Captura | null>(null);
  const [resultado, setResultado] = useState<ResultadoCaptura | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Polling stops when the page unmounts or the operator moves on.
  const consultaVigente = useRef(0);

  useEffect(() => {
    const consultas = consultaVigente;
    iniciarSesionCaptura()
      .then((sesion) => setIdSesion(sesion.id))
      .catch((err: unknown) => setError(mensajeDeError(err)));
    return () => {
      consultas.current++;
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
      setCaptura(await subirCaptura({ idSesion, idAnimal: animal.id, archivo }));
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }

  /** Polls the capture until the background estimation finishes. */
  async function esperarResultado(idCaptura: Uuid) {
    const consulta = ++consultaVigente.current;
    setError(null);
    try {
      for (;;) {
        const actual = await obtenerCaptura(idCaptura);
        if (consulta !== consultaVigente.current) return;
        setCaptura(actual);
        if (actual.estado === "fallida") {
          setResultado({ tipo: "fallido", captura: actual });
          setPaso("resultado");
          return;
        }
        if (actual.estado === "procesada" && actual.id_evento_pesaje) {
          const pesaje = await obtenerPesaje(actual.id_evento_pesaje);
          if (consulta !== consultaVigente.current) return;
          setResultado({ tipo: "estimado", captura: actual, pesaje });
          setPaso("resultado");
          return;
        }
        await esperar(INTERVALO_CONSULTA_MS);
        if (consulta !== consultaVigente.current) return;
      }
    } catch (err) {
      if (consulta === consultaVigente.current) setError(mensajeDeError(err));
    }
  }

  async function procesarPesaje() {
    if (!captura) return;
    setCargando(true);
    setError(null);
    try {
      await solicitarPesaje(captura.id);
      setPaso("procesando");
    } catch (err) {
      setError(mensajeDeError(err));
      return;
    } finally {
      setCargando(false);
    }
    await esperarResultado(captura.id);
  }

  function reintentarConsulta() {
    if (captura) void esperarResultado(captura.id);
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
