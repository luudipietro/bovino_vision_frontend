import CapturarFoto from "./components/CapturarFoto";
import EstimandoPeso from "./components/EstimandoPeso";
import IdentificarAnimal from "./components/IdentificarAnimal";
import ResultadoPesaje from "./components/ResultadoPesaje";
import { useCaptura } from "./useCaptura";

export default function CapturaPage() {
  const captura = useCaptura();

  if (!captura.idSesion) {
    return captura.error ? (
      <p className="text-sm text-red-600">{captura.error}</p>
    ) : (
      <p className="text-sm text-stone-400">Iniciando sesión de captura…</p>
    );
  }

  if (captura.paso === "resultado" && captura.resultado) {
    return (
      <ResultadoPesaje
        resultado={captura.resultado}
        cargando={captura.cargando}
        error={captura.error}
        onConfirmar={captura.confirmarResultado}
        onPesarOtroAnimal={captura.pesarOtroAnimal}
      />
    );
  }

  if (!captura.animal || captura.paso === "identificar") {
    return <IdentificarAnimal onSeleccionar={captura.seleccionarAnimal} />;
  }

  if (captura.paso === "procesando") {
    return (
      <EstimandoPeso
        animal={captura.animal}
        captura={captura.captura}
        error={captura.error}
        onReintentarConsulta={captura.reintentarConsulta}
      />
    );
  }

  return (
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
