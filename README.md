# BovinoVision — Frontend

Interfaz web de BovinoVision, construida con **React + Vite + Tailwind CSS** en
**TypeScript estricto**. Consume la API .NET del repo `../bovino_vision_backend`.

## Estructura

- `src/api/` — cliente HTTP (`client.ts`, con los errores ProblemDetails de la API), funciones
  por recurso y los tipos del contrato en `tipos.ts`.
- `src/features/` — una carpeta por funcionalidad (`captura`, `animales`, `lotes`, …), cada
  una con sus páginas y componentes propios.
- `src/components/` — componentes de UI compartidos entre features.
- `src/lib/formato.ts` — formato argentino de números y fechas.

El diseño visual (Montserrat, iconos Lucide, paleta del design system de BovinoVision
definida como tokens en `src/index.css`) está descripto en `context.md`.

## Requisitos

- Node.js 24+

## Cómo correrlo localmente

```bash
npm install
npm run dev
```

Por defecto espera el backend en `http://localhost:8000` (ver `.env.example` →
`VITE_API_URL`).

## Verificación

```bash
npm run typecheck   # tsc --noEmit, modo estricto
npm run test        # Vitest (npm run test:watch para modo interactivo)
npm run lint        # oxlint
npm run build       # chequea tipos y genera dist/
```

Los tests (`*.test.ts` junto al código) corren en Node y cubren la lógica sin interfaz: el
cliente HTTP, los textos de alertas y la espera del pesaje (`esperarResultado`). Los
componentes React todavía no tienen tests porque requieren un DOM simulado
(`@testing-library/react` + `jsdom`); los cambios de pantalla se validan con un recorrido en
el navegador contra la API local.

## Contrato con el backend

- Los ids son UUID (`string`) y los campos van en snake_case en español (`id_lote`,
  `id_raza`, `id_animal`). La raza sale del catálogo `GET /razas`.
- El pesaje es asíncrono: `POST /capturas` registra la foto (422 si la imagen no es
  válida), `POST /pesajes` responde 202 y la pantalla consulta `GET /capturas/{id}` cada
  segundo hasta `procesada` o `fallida`. Confirmar el resultado llama a
  `POST /capturas/{id}/confirmar`. En el paso de la foto, "Quitar foto" (o volver al paso
  anterior con la foto ya cargada) llama a `DELETE /capturas/{id}`, que solo acepta capturas
  `registrada`.
- Las alertas son `perdida_peso` o `estancamiento`, con la GMD del intervalo en `variacion`
  (kg/día) y prioridad numérica (1 es la más urgente).
