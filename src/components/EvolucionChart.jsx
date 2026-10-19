export default function EvolucionChart({ puntos }) {
  const validos = puntos.filter((p) => p.peso_promedio_kg != null);

  if (validos.length < 2) {
    return (
      <p className="text-sm text-stone-400">
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
  const margen = 8;
  const paso = ancho / (validos.length - 1);

  const coordenadas = validos.map((punto, indice) => ({
    x: indice * paso,
    y:
      alto -
      margen -
      ((punto.peso_promedio_kg - minimo) / rango) * (alto - margen * 2),
  }));

  const puntosSvg = coordenadas.map(({ x, y }) => `${x},${y}`).join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${ancho} ${alto}`} className="h-32 w-full" preserveAspectRatio="none">
        {[0.2, 0.5, 0.8].map((fraccion) => (
          <line
            key={fraccion}
            x1={0}
            x2={ancho}
            y1={alto * fraccion}
            y2={alto * fraccion}
            stroke="#e7e5e4"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}
        <polyline points={puntosSvg} fill="none" stroke="#14532d" strokeWidth="2.5" />
        {coordenadas.map(({ x, y }, indice) => (
          // eslint-disable-next-line react/no-array-index-key -- el orden es estable y la fecha puede repetirse en el mismo día
          <circle key={indice} cx={x} cy={y} r="3" fill="#14532d" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[11px] text-stone-400">
        <span>{validos[0].fecha}</span>
        <span>{validos[validos.length - 1].fecha}</span>
      </div>
    </div>
  );
}
