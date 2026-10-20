import type { ReactNode } from "react";
import Card from "../../components/Card";
import { Loading, Notice } from "../../components/Feedback";
import PageHeader from "../../components/PageHeader";
import Stepper from "../../components/Stepper";
import CapturarFoto from "./components/CapturarFoto";
import EstimandoPeso from "./components/EstimandoPeso";
import IdentificarAnimal from "./components/IdentificarAnimal";
import ResultadoPesaje from "./components/ResultadoPesaje";
import { useCaptura } from "./useCaptura";

const TOTAL_PASOS = 4;

function Encabezado() {
  return <PageHeader title="Nueva captura" subtitle="Registrá el peso de un animal con una foto." />;
}

export default function CapturaPage() {
  const captura = useCaptura();

  if (!captura.idSesion) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Encabezado />
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
        cargando={captura.cargando}
        error={captura.error}
        onConfirmar={captura.confirmarResultado}
        onPesarOtroAnimal={captura.pesarOtroAnimal}
      />
    );
  } else if (!captura.animal || captura.paso === "identificar") {
    paso = 1;
    contenido = <IdentificarAnimal onSeleccionar={captura.seleccionarAnimal} />;
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
        error={captura.error}
        onSubirFoto={captura.subirFoto}
        onReintentar={captura.reintentarFoto}
        onProcesarPesaje={captura.procesarPesaje}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Encabezado />
      <Card className="space-y-6">
        <Stepper step={paso} total={TOTAL_PASOS} />
        {contenido}
      </Card>
    </div>
  );
}
