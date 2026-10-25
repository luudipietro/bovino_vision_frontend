import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { obtenerAnimal } from "../../api/animales";
import {
  confirmarCaptura,
  descartarCaptura,
  iniciarSesionCaptura,
  obtenerCaptura,
  subirCaptura,
} from "../../api/capturas";
import { ApiError, mensajeDeError } from "../../api/client";
import { obtenerPesaje, solicitarPesaje } from "../../api/pesajes";
import type { Animal, Captura, Uuid } from "../../api/tipos";
import { esperarResultado, type ResultadoCaptura } from "./esperarResultado";
import { type PasoCaptura, retrocesoDesde } from "./navegacion";
import { reducirFoto } from "./reducirFoto";
import { idAnimalDeConsulta } from "./rutaDeCaptura";

const INTERVALO_CONSULTA_MS = 1000;

export type { PasoCaptura, ResultadoCaptura };

const esperar = () => new Promise<void>((resolve) => setTimeout(resolve, INTERVALO_CONSULTA_MS));

export function useCaptura() {
  // The capture home comes first: the session starts when the operator taps "Nueva captura".
  const [iniciada, setIniciada] = useState(false);
  const [idSesion, setIdSesion] = useState<Uuid | null>(null);
  const [paso, setPaso] = useState<PasoCaptura>("identificar");
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [captura, setCaptura] = useState<Captura | null>(null);
  const [resultado, setResultado] = useState<ResultadoCaptura | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Object URLs of the photos taken in this tab: the gallery shows them while it has them and
  // falls back to the API image (after a reload, or for photos from another device).
  const [vistasPrevias, setVistasPrevias] = useState<Record<Uuid, string>>({});
  const [quitandoFoto, setQuitandoFoto] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [versionGaleria, setVersionGaleria] = useState(0);
  // Polling stops when the page unmounts or the operator moves on.
  const consultaVigente = useRef(0);
  const urlsCreadas = useRef<string[]>([]);

  // "Pesar este animal" links here with `?animal=<id>`: that animal starts already identified.
  const [parametros, setParametros] = useSearchParams();
  const idAnimalPedido = idAnimalDeConsulta(parametros);
  const [idAnimalResuelto, setIdAnimalResuelto] = useState<Uuid | null>(null);
  const abriendoAnimal = idAnimalPedido !== null && idAnimalResuelto !== idAnimalPedido;
  // A link for a given animal skips the home.
  const sesionPedida = iniciada || idAnimalPedido !== null;

  useEffect(() => {
    if (!idAnimalPedido) return;
    let vigente = true;
    obtenerAnimal(idAnimalPedido)
      .then((encontrado) => {
        if (!vigente) return;
        seleccionarAnimal(encontrado);
        setIdAnimalResuelto(idAnimalPedido);
      })
      .catch((err: unknown) => {
        if (!vigente) return;
        // Identifying the animal by hand is still possible.
        setError(`No pudimos abrir el animal elegido. ${mensajeDeError(err)}`);
        setIdAnimalResuelto(idAnimalPedido);
      });
    return () => {
      vigente = false;
    };
  }, [idAnimalPedido]);

  // Going back to the home and tapping "Nueva captura" again resumes the open session.
  const sesionAbierta = useRef(false);

  useEffect(() => {
    if (!sesionPedida) return;
    const consultas = consultaVigente;
    const urls = urlsCreadas;
    if (!sesionAbierta.current) {
      sesionAbierta.current = true;
      iniciarSesionCaptura()
        .then((sesion) => setIdSesion(sesion.id))
        .catch((err: unknown) => {
          sesionAbierta.current = false;
          setError(mensajeDeError(err));
        });
    }
    return () => {
      consultas.current++;
      urls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [sesionPedida]);

  function seleccionarAnimal(animalSeleccionado: Animal) {
    setAnimal(animalSeleccionado);
    setCaptura(null);
    setResultado(null);
    setError(null);
    setAviso(null);
    setPaso("foto");
  }

  async function subirFoto(archivo: File) {
    if (!idSesion || !animal) return;
    setCargando(true);
    setError(null);
    setAviso(null);
    try {
      // The photo is shrunk right before the upload; the local preview keeps the original.
      const reducida = await reducirFoto(archivo);
      const nueva = await subirCaptura({ idSesion, idAnimal: animal.id, archivo: reducida });
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
    setAviso(null);
    setPaso("identificar");
  }

  function reintentarFoto() {
    setCaptura(null);
    setError(null);
  }

  function liberarVistaPrevia(idCaptura: Uuid) {
    const url = vistasPrevias[idCaptura];
    if (!url) return;
    URL.revokeObjectURL(url);
    urlsCreadas.current = urlsCreadas.current.filter((creada) => creada !== url);
    setVistasPrevias(({ [idCaptura]: _descartada, ...restantes }) => restantes);
  }

  /** Drops the registered photo in the API so no unprocessed capture is left behind. */
  async function quitarFoto(): Promise<boolean> {
    if (!captura) return true;
    setCargando(true);
    setQuitandoFoto(true);
    setError(null);
    try {
      await descartarCaptura(captura.id);
    } catch (err) {
      // Already gone: the goal of the operator is met.
      if (!(err instanceof ApiError && err.status === 404)) {
        setError(mensajeDeError(err));
        return false;
      }
    } finally {
      setCargando(false);
      setQuitandoFoto(false);
    }
    liberarVistaPrevia(captura.id);
    setCaptura(null);
    setVersionGaleria((version) => version + 1);
    return true;
  }

  const retroceso = animal ? retrocesoDesde(paso, captura !== null) : null;

  async function volver() {
    if (!retroceso) return;
    if (retroceso.descartarFoto && !(await quitarFoto())) return;
    // Stops the polling of an estimation that keeps running on the server.
    consultaVigente.current++;
    setCaptura(null);
    setResultado(null);
    setError(null);
    setAviso(
      retroceso.avisarSegundoPlano
        ? "La estimación sigue en curso: vas a ver su resultado en las fotos de la sesión."
        : null,
    );
    if (retroceso.destino === "identificar") setAnimal(null);
    setPaso(retroceso.destino);
  }

  /** Leaves the flow for the capture home; a registered, unprocessed photo is discarded first. */
  async function volverAlInicio() {
    if (paso === "foto" && !(await quitarFoto())) return;
    // An estimation in progress keeps running on the server and shows up in the session photos.
    consultaVigente.current++;
    setAnimal(null);
    setCaptura(null);
    setResultado(null);
    setError(null);
    setAviso(null);
    setPaso("identificar");
    // Leaving revokes the local previews; the gallery falls back to the API photos.
    setVistasPrevias({});
    setIniciada(false);
    if (idAnimalPedido) setParametros({}, { replace: true });
  }

  return {
    sesionPedida,
    iniciar: () => setIniciada(true),
    volverAlInicio,
    idSesion,
    vistasPrevias,
    versionGaleria,
    paso,
    animal,
    abriendoAnimal,
    captura,
    resultado,
    cargando,
    quitandoFoto,
    aviso,
    error,
    retroceso,
    seleccionarAnimal,
    subirFoto,
    procesarPesaje,
    reintentarConsulta,
    confirmarResultado,
    pesarOtroAnimal,
    reintentarFoto,
    quitarFoto,
    volver,
  };
}
