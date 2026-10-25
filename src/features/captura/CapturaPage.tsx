import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { Loading, Notice } from "../../components/Feedback";
import PageHeader from "../../components/PageHeader";
import Stepper from "../../components/Stepper";
import { useSesion } from "../auth/useSesion";
import AnimalEnCaptura from "./components/AnimalEnCaptura";
import CapturarFoto from "./components/CapturarFoto";
import EstimandoPeso from "./components/EstimandoPeso";
import GaleriaSesion from "./components/GaleriaSesion";
import IdentificarAnimal from "./components/IdentificarAnimal";
import InicioCaptura from "./components/InicioCaptura";
import ResultadoPesaje from "./components/ResultadoPesaje";
import { useCaptura } from "./useCaptura";

const ETAPAS = ["Animal", "Foto", "Estimación", "Resultado"];

function Encabezado({ deshabilitado, onVolver }: { deshabilitado: boolean; onVolver: () => void }) {
  return (
    <div className="space-y-3">
      <Button variant="ghost" icon={ArrowLeft} disabled={deshabilitado} onClick={onVolver} className="-ml-3">
        Inicio de captura
      </Button>
      <PageHeader title="Nueva captura" subtitle="Registrá el peso de un animal con una foto." />
    </div>
  );
}

/** "Paso 2 de 4" bars on mobile; the four named stages from md up. */
function Etapas({ paso }: { paso: number }) {
  return (
    <>
      <div className="md:hidden">
        <Stepper step={paso} total={ETAPAS.length} />
      </div>
      <ol className="hidden grid-cols-4 gap-3 md:grid" aria-label={`Paso ${paso} de ${ETAPAS.length}`}>
        {ETAPAS.map((etapa, indice) => {
          const numero = indice + 1;
          const actual = numero === paso;
          return (
            <li key={etapa} aria-current={actual ? "step" : undefined} className="space-y-2">
              <span
                className={`block h-1 rounded-full ${numero <= paso ? "bg-green-500" : "bg-neutral-200"}`}
              />
              <span
                className={`flex items-center gap-2 text-xs ${actual ? "font-bold text-neutral-800" : "text-neutral-500"}`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                    numero <= paso ? "bg-green-800 text-white" : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {numero}
                </span>
                {etapa}
              </span>
            </li>
          );
        })}
      </ol>
    </>
  );
}

export default function CapturaPage() {
  const captura = useCaptura();
  const { sesion } = useSesion();

  if (!captura.sesionPedida) {
    return <InicioCaptura nombre={sesion?.usuario.nombre ?? ""} onNuevaCaptura={captura.iniciar} />;
  }

  const encabezado = (
    <Encabezado deshabilitado={captura.cargando} onVolver={() => void captura.volverAlInicio()} />
  );

  if (!captura.idSesion) {
    return (
      <div className="space-y-6">
        {encabezado}
        {captura.error ? (
          <Notice tone="danger">{captura.error}</Notice>
        ) : (
          <Loading>Iniciando sesión de captura…</Loading>
        )}
      </div>
    );
  }

  let paso = 2;
  let contenido: ReactNode;

  if (captura.paso === "resultado" && captura.resultado) {
    paso = 4;
    contenido = (
      <ResultadoPesaje
        resultado={captura.resultado}
        animal={captura.animal}
        cargando={captura.cargando}
        error={captura.error}
        onConfirmar={captura.confirmarResultado}
        onPesarOtroAnimal={captura.pesarOtroAnimal}
        onDescartar={() => void captura.volver()}
      />
    );
  } else if (!captura.animal || captura.paso === "identificar") {
    paso = 1;
    contenido = captura.abriendoAnimal ? (
      <Loading>Abriendo el animal…</Loading>
    ) : (
      <>
        <IdentificarAnimal onSeleccionar={captura.seleccionarAnimal} />
        {captura.error && (
          <Notice tone="danger" className="mt-4">
            {captura.error}
          </Notice>
        )}
      </>
    );
  } else if (captura.paso === "procesando") {
    paso = 3;
    contenido = (
      <EstimandoPeso
        animal={captura.animal}
        captura={captura.captura}
        error={captura.error}
        onReintentarConsulta={captura.reintentarConsulta}
      />
    );
  } else {
    contenido = (
      <CapturarFoto
        animal={captura.animal}
        captura={captura.captura}
        cargando={captura.cargando}
        quitandoFoto={captura.quitandoFoto}
        aviso={captura.aviso}
        error={captura.error}
        onSubirFoto={captura.subirFoto}
        onReintentar={captura.reintentarFoto}
        onQuitarFoto={captura.quitarFoto}
        onProcesarPesaje={captura.procesarPesaje}
      />
    );
  }

  // An estimated result brings its own "Tomar otra" and "Descartar" actions.
  const retroceso = paso === 4 && captura.resultado?.tipo === "estimado" ? null : captura.retroceso;

  return (
    <div className="space-y-6">
      {encabezado}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="space-y-6 md:p-8">
          <Etapas paso={paso} />
          {contenido}
          {retroceso && (
            <Button
              variant="ghost"
              icon={ArrowLeft}
              disabled={captura.cargando}
              onClick={() => void captura.volver()}
            >
              {retroceso.etiqueta}
            </Button>
          )}
        </Card>
        <aside className="space-y-6 lg:sticky lg:top-6">
          <div className="hidden lg:block">
            <AnimalEnCaptura animal={captura.animal} />
          </div>
          <GaleriaSesion
            idSesion={captura.idSesion}
            version={captura.versionGaleria}
            vistasPrevias={captura.vistasPrevias}
          />
        </aside>
      </div>
    </div>
  );
}
