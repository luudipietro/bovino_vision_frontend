import CapturarFoto from "./components/CapturarFoto";
import IdentificarAnimal from "./components/IdentificarAnimal";
import ResultadoPesaje from "./components/ResultadoPesaje";
import { useCaptura } from "./useCaptura";

export default function CapturaPage() {
  const captura = useCaptura();

  if (!captura.sesionId) {
    return <p className="text-sm text-stone-400">Iniciando sesión de captura…</p>;
  }

  if (captura.paso === "identificar") {
    return <IdentificarAnimal onSeleccionar={captura.seleccionarAnimal} />;
  }

  if (captura.paso === "foto") {
    return (
      <CapturarFoto
        animal={captura.animal}
        captura={captura.captura}
        cargando={captura.cargando}
        error={captura.error}
        onSubirFoto={captura.subirFoto}
        onReintentar={captura.reintentarFoto}
        onConfirmarPesaje={captura.confirmarPesaje}
      />
    );
  }

  return (
    <ResultadoPesaje resultado={captura.resultado} onPesarOtroAnimal={captura.pesarOtroAnimal} />
  );
}
