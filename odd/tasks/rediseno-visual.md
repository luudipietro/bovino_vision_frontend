# Feature: rediseno-visual

Objetivo: rediseñar visualmente el frontend copiando el lenguaje del Figma de ZOCO (tipografía, iconos, gráficos, tablas, tarjetas) con la paleta del design system de BovinoVision en Claude Design. Rama `feat/rediseno-visual` (worktree `../bovino_vision_frontend-rediseno`, base `1ff3d42`); un commit por unidad de trabajo, sin push, PR ni merge.
Verificación: `npm run typecheck`, `npm run lint`, `npm run test` y `npm run build` por tarea; cierre con recorrido real en el navegador contra la API local.

## Specs

- **S1. Referencia de estilo.** Usuario: "podes usar como referencia este diseño de figma https://www.figma.com/design/CsaLpPcrnM9EbXagAavF4P/ZOCO?node-id=0-1 que es de otro sistema diferente a este, pero trata de copiar los estilos, las fuentes, forma de los iconos, graficos, etc." Relevado del Figma: Montserrat (400/500/600/700) en toda la interfaz; iconos Lucide de trazo 2 px con puntas redondeadas (los SVG del Figma son paths de Lucide); sidebar blanco con ítems de 45 px, texto SemiBold 14 px, usuario abajo; título de página SemiBold 20 px con subtítulo 12 px; pastilla de fecha y hora arriba a la derecha; botón primario oscuro de radio 10 px con icono; KPI en tiles oscuros (cifra Bold 22 px, etiqueta SemiBold 11 px en mayúsculas); pestañas subrayadas en mayúsculas; filtros en tarjeta con label arriba e inputs de borde oscuro de 40 px; tablas con encabezado gris redondeado en mayúsculas y filas como tarjetas con borde; badges pastilla con fondo suave; gráfico de líneas suavizadas con grilla horizontal, línea vertical punteada y tooltip oscuro en hover, leyenda de segmentos cortos; barras de composición gruesas redondeadas; timeline vertical con puntos; stepper "Paso 1 de 3" con barras segmentadas; avisos grises con icono; tarjeta seleccionada en fondo oscuro.
- **S2. Paleta.** Usuario: "usando la paleta de colores que se define en el design system de BovinoVision en Claude Design https://claude.ai/design/p/dc270f40-3c58-4417-b434-14460761eeb2?via=share". Se usan exclusivamente los colores de `tokens/colors.css` del design system: el gris carbón del Figma (`#2d3035`) pasa a verde profundo (`green-800`/`green-900`), el lima (`#b1c20e`) a verde de marca (`green-500`/`green-600`, y `green-300` sobre fondos oscuros), el gris de la serie comparativa a marrón (`brown-400`), fondo de página crema y tarjetas blancas; semánticos de peligro, advertencia e info del design system. Sombras tintadas en verde del design system.
- **S3. Sin cambios funcionales.** Se conservan rutas, contrato de API, flujo de captura asíncrono y comportamiento existente (incluida la búsqueda que descarta respuestas fuera de orden). Solo se agregan presentaciones derivadas de datos que la API ya devuelve (por ejemplo, distribución del rodeo por lote o cobertura de GMD). Sin dependencias nuevas.
- **S4. Usuario:** "podes usar ODD y subagentes si queres, y si es mejor para optimizar tokens y calidad".

## Tasks

| ID | Specs | Ruta | Estado | Evidencia / commit |
| --- | --- | --- | --- | --- |
| T1 | S1, S2, S3 | inline | hecha | Tokens del design system en `@theme` (sin colores de Tailwind por defecto), Montserrat, layout con sidebar y pastilla de fecha, componentes `Button`, `Badge`, `PageHeader`, `Card`, `KpiTile`, `StatCard`, `Tabs`, `Field`, `Table`, `Feedback`, `ProgressBar`, `Stepper`, `LineChart` y formato argentino (`lib/formato.ts`, 5 tests). typecheck 0, lint con los 2 warnings previos, 19 tests verdes. |
| T2 | S1-S3 | delegada (paralelo) | hecha | Panel con tiles KPI, curva, cobertura de GMD y distribución por lote; alertas en filas tarjeta; `formatearGmd` en formato argentino (RED 3 tests, GREEN). typecheck 0, lint 2 previos, 19 tests, build OK. |
| T3 | S1-S3 | delegada (paralelo) | hecha | Rodeo en tabla con búsqueda y filtro de lote, ficha con tiles, curva y timeline (`LineaDePesajes`), lotes con participación. typecheck 0, lint 2 previos, 19 tests, build OK. |
| T4 | S1-S3 | delegada (paralelo) | hecha | Asistente de 4 pasos con `Stepper`, visor con encuadre, estimación y resultado. Pasos 2-4 revisados por código (headless solo captura el paso 1). typecheck 0, lint 2 previos, 19 tests, build OK. |
| T5 | S1-S3 | inline | pendiente | Recorrido real a 390 px (Chrome headless no baja de 500 px), ajuste de ancho inicial de `LineChart`, alertas de demo, docs. |

Ruta: T1 inline porque todas las pantallas dependen de ella. T2-T4 en paralelo: tres unidades independientes con superficies disjuntas (`src/features/panel` + `src/features/alertas/AlertasPage.tsx`; `src/features/animales` + `src/features/lotes`; `src/features/captura/components` + `CapturaPage.tsx`), cada una de varios archivos.

## Log

- **L1 (usuario, 2026-10-20):** "quiero que rediseñes el frontend de BovinoVision. podes usar como referencia este diseño de figma https://www.figma.com/design/CsaLpPcrnM9EbXagAavF4P/ZOCO?node-id=0-1 que es de otro sistema diferente a este, pero trata de copiar los estilos, las fuentes, forma de los iconos, graficos, etc. usando la paleta de colores que se define en el design system de BovinoVision en Claude Design https://claude.ai/design/p/dc270f40-3c58-4417-b434-14460761eeb2?via=share"
- **L2 (2026-10-20):** otra sesión estaba editando el repo del frontend (Vitest y búsqueda); para no pisarla, el rediseño se hace en un worktree aparte desde `1ff3d42`. El emblema `public/logo-mark.png` sale de `assets/logo-mark.png` del design system. El design system pide Material Symbols y Lato, pero el usuario pidió copiar fuentes e iconos del Figma: se usan Montserrat y Lucide (ya instalado) y del design system se toma la paleta.
- **L3 (usuario, 2026-10-20):** "podes usar ODD y subagentes si queres, y si es mejor para optimizar tokens y calidad"
- **L4 (2026-10-20):** se borró el adaptador `EvolucionChart`. Datos de demo cargados por la API en la base local de Docker (lotes A-12, B-04, C-07; 9 animales con 5 pesajes cada uno, todos de 400 kg por el estimador simulado).
- **L5 (usuario, 2026-10-20):** "antes de que te quedes sin tokens, mergea lo que hay hecho en la rama de rediseño a la rama manu"
