export default function EvolucionChart({ puntos }) {
  const validos = puntos.filter((p) => p.peso_promedio_kg != null);

  if (validos.length < 2) {
    return (
      <p className="text-sm text-gray-500">
        Todavía no hay suficientes datos para graficar la evolución.
      </p>
    );
  }

  const valores = validos.map((p) => p.peso_promedio_kg);
  const minimo = Math.min(...valores);
  const maximo = Math.max(...valores);
  const rango = maximo - minimo || 1;

  const ancho = 300;
  const alto = 100;
  const paso = ancho / (validos.length - 1);

  const coordenadas = validos.map((punto, indice) => ({
    x: indice * paso,
    y: alto - ((punto.peso_promedio_kg - minimo) / rango) * alto,
  }));

  const puntosSvg = coordenadas.map(({ x, y }) => `${x},${y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${ancho} ${alto}`} className="h-32 w-full" preserveAspectRatio="none">
      <polyline points={puntosSvg} fill="none" stroke="#059669" strokeWidth="2" />
      {coordenadas.map(({ x, y }, indice) => (
        <circle key={validos[indice].fecha} cx={x} cy={y} r="2.5" fill="#059669" />
      ))}
    </svg>
  );
}
