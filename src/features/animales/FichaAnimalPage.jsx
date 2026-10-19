import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { historialDePesajes, obtenerAnimal } from "../../api/animales";
import { listarAlertasDeAnimal } from "../../api/alertas";

export default function FichaAnimalPage() {
  const { id } = useParams();
  const [animal, setAnimal] = useState(null);
  const [pesajes, setPesajes] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([obtenerAnimal(id), historialDePesajes(id), listarAlertasDeAnimal(id)])
      .then(([datosAnimal, historial, alertasAnimal]) => {
        setAnimal(datosAnimal);
        setPesajes(historial);
        setAlertas(alertasAnimal);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!animal) return <p className="text-sm text-gray-500">Cargando…</p>;

  return (
    <section>
      <Link to="/animales" className="text-sm text-emerald-700 hover:underline">
        ← Volver al rodeo
      </Link>

      <h1 className="mt-2 text-xl font-semibold text-gray-900">{animal.identificador}</h1>
      <p className="text-sm text-gray-500">
        {animal.lote_id ? `Lote #${animal.lote_id}` : "Sin lote asignado"}
        {animal.raza && ` · ${animal.raza}`}
        {animal.sexo && ` · ${animal.sexo}`}
      </p>

      {alertas.length > 0 && (
        <div className="mt-4 space-y-2">
          {alertas.map((alerta) => (
            <div
              key={alerta.id}
              className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800"
            >
              Variación de {alerta.variacion_pct > 0 ? "+" : ""}
              {alerta.variacion_pct}% ({alerta.prioridad}) el{" "}
              {new Date(alerta.fecha_generacion).toLocaleDateString()}
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-6 text-sm font-semibold text-gray-700">Historial de pesajes</h2>

      {pesajes.length === 0 ? (
        <p className="mt-2 text-sm text-gray-500">Todavía no tiene pesajes registrados.</p>
      ) : (
        <ul className="mt-2 divide-y divide-gray-200 rounded-md border border-gray-200">
          {pesajes.map((pesaje) => (
            <li key={pesaje.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-gray-500">
                {new Date(pesaje.fecha_pesaje).toLocaleString()}
              </span>
              {pesaje.estado === "estimado" ? (
                <span className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{pesaje.peso_kg} kg</span>
                  {pesaje.gmd_kg_dia != null && (
                    <span className="text-xs text-gray-500">
                      GMD {pesaje.gmd_kg_dia > 0 ? "+" : ""}
                      {pesaje.gmd_kg_dia} kg/día
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-red-600">Error en la estimación</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
