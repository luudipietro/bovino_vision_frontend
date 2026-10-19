export default function ResultadoPesaje({ resultado, onPesarOtroAnimal }) {
  const exitoso = resultado.estado === "estimado";
  const diferencia =
    exitoso && resultado.ultimo_peso_previo
      ? resultado.peso_kg - resultado.ultimo_peso_previo.peso_kg
      : null;

  return (
    <section>
      <h1 className="text-xl font-semibold text-gray-900">
        Resultado — {resultado.animal_identificador}
      </h1>

      {exitoso ? (
        <div className="mt-4 rounded-md border border-emerald-300 bg-emerald-50 p-6 text-center">
          <p className="text-sm text-emerald-700">Peso estimado</p>
          <p className="text-4xl font-bold text-emerald-900">{resultado.peso_kg} kg</p>
          {resultado.lote_codigo && (
            <p className="mt-1 text-sm text-emerald-700">Lote {resultado.lote_codigo}</p>
          )}
          {resultado.ultimo_peso_previo && (
            <p className="mt-2 text-sm text-emerald-700">
              Pesaje anterior: {resultado.ultimo_peso_previo.peso_kg} kg (
              {diferencia >= 0 ? "+" : ""}
              {diferencia.toFixed(1)} kg)
            </p>
          )}
        </div>
      ) : (
        <div className="mt-4 rounded-md border border-red-300 bg-red-50 p-6 text-center text-red-800">
          <p className="font-medium">No se pudo estimar el peso</p>
          <p className="mt-1 text-sm">{resultado.motivo_error}</p>
        </div>
      )}

      <button
        type="button"
        onClick={onPesarOtroAnimal}
        className="mt-6 w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        Pesar otro animal
      </button>
    </section>
  );
}
