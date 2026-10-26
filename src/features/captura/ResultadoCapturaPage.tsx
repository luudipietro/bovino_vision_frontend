import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { obtenerAnimal } from "../../api/animales";
import { confirmarCaptura, obtenerCaptura } from "../../api/capturas";
import { mensajeDeError } from "../../api/client";
import { obtenerPesaje } from "../../api/pesajes";
import type { Animal, Captura } from "../../api/tipos";
import Card from "../../components/Card";
import { Loading, Notice } from "../../components/Feedback";
import PageHeader from "../../components/PageHeader";
import { formatearFechaHora } from "../../lib/formato";
import ResultadoPesaje from "./components/ResultadoPesaje";
import { esperarResultado, type ResultadoCaptura } from "./esperarResultado";
import { rutaDeSesion } from "./rutaDeCaptura";

const INTERVALO_CONSULTA_MS = 1000;

const esperar = () => new Promise<void>((resolve) => setTimeout(resolve, INTERVALO_CONSULTA_MS));

/** Result screen of a past capture, opened from its session: the last step of the capture flow, without its actions. */
export default function ResultadoCapturaPage() {
  const { id } = useParams<{ id: string }>();
  const [captura, setCaptura] = useState<Captura | null>(null);
  const [resultado, setResultado] = useState<ResultadoCaptura | null>(null);
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [errorConfirmar, setErrorConfirmar] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let vigente = true;
    let animalPedido = false;
    // A capture still being estimated is polled until it ends, as in the capture flow.
    esperarResultado(id, {
      obtenerCaptura,
      obtenerPesaje,
      esperar,
      sigueVigente: () => vigente,
      alActualizar: (actual) => {
        setCaptura(actual);
        if (animalPedido) return;
        animalPedido = true;
        obtenerAnimal(actual.id_animal)
          .then((encontrado) => vigente && setAnimal(encontrado))
          // The breed, sex and age rows show a dash without the animal.
          .catch(() => {});
      },
    })
      .then((final) => vigente && final && setResultado(final))
      .catch((err: unknown) => vigente && setError(mensajeDeError(err)));
    return () => {
      vigente = false;
    };
  }, [id]);

  async function confirmar() {
    if (resultado?.tipo !== "estimado") return;
    setConfirmando(true);
    setErrorConfirmar(null);
    try {
      const confirmada = await confirmarCaptura(resultado.captura.id);
      setResultado({ ...resultado, captura: confirmada });
    } catch (err) {
      setErrorConfirmar(mensajeDeError(err));
    } finally {
      setConfirmando(false);
    }
  }

  let contenido;
  if (error) {
    contenido = <Notice tone="danger">No pudimos abrir el pesaje. {error}</Notice>;
  } else if (resultado) {
    contenido = (
      <ResultadoPesaje
        resultado={resultado}
        animal={animal}
        cargando={confirmando}
        error={errorConfirmar}
        onConfirmar={() => void confirmar()}
      />
    );
  } else if (captura) {
    contenido = <Loading>Estimando el peso: el resultado aparece acá en cuanto esté listo…</Loading>;
  } else {
    contenido = <Loading>Cargando el pesaje…</Loading>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Link
          to={captura ? rutaDeSesion(captura.id_sesion) : "/captura"}
          className="-ml-3 inline-flex items-center gap-2 rounded-[10px] px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-100"
        >
          <ArrowLeft className="h-4 w-4" />
          {captura ? "Volver a la sesión" : "Inicio de captura"}
        </Link>
        <PageHeader
          title={animal ? `Pesaje de ${animal.identificador}` : "Pesaje"}
          subtitle={captura ? `Foto del ${formatearFechaHora(captura.fecha_captura)}` : undefined}
        />
      </div>
      <Card className="md:p-8">{contenido}</Card>
    </div>
  );
}
