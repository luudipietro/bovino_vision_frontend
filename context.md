# Contexto del frontend — BovinoVision

Estado al 19/10/2026, fin de la primera sesión de desarrollo. Esto no reemplaza al
`README.md` (para correrlo, ver ahí); es un resumen de decisiones y alcance para retomar
el trabajo sin tener que releer todo el historial de la conversación.

## Qué es esto

Interfaz web (React + Vite + Tailwind v4, JavaScript puro, sin TypeScript) del sistema
BovinoVision. Consume la API del repo `backend/` (URL configurable por `VITE_API_URL`).

## Diseño visual

El 19/10/2026 se rehizo toda la estética para parecerse a los mockups reales del
proyecto, que se extrajeron de los PDF de diseño (`../Documentacion/TP7/Parte de avance
de Análisis y Diseño (SISTEMA COMPLETO).pdf`, páginas 36-39, y
`TP7_Parte_Avance_de_Diseño_V3.pdf`, páginas 5-7 — son capturas de pantalla de un
prototipo ya construido, no bocetos a mano). Paleta: verde oscuro (`green-900`/`green-800`
de Tailwind) como color primario, lima (`lime-300`) como acento de estados
activos/positivos, fondo cálido (`stone-50`). Tipografía "Plus Jakarta Sans" (Google
Fonts, cargada en `index.html`). Iconos: `lucide-react`.

Layout responsive sin JS: sidebar fija en desktop (`md:flex`), barra de navegación
inferior en mobile (`md:hidden`) — ver `src/components/Layout.jsx`.

**Importante:** el propio documento de diseño (página 6) aclara explícitamente que los
indicadores de "estado sanitario", grasa, musculatura y precio que aparecen en algunos
mockups **no forman parte del alcance** del proyecto — no están implementados a
propósito, no es un olvido. Donde el mockup mostraba ese dato, se usó algo real en su
lugar (por ejemplo, "Alertas activas" en vez de "Estado Sanitario" en el panel).

## Estructura

- `src/api/` — un archivo por recurso del backend (`animales`, `lotes`, `capturas`,
  `pesajes`, `alertas`, `analitica`), todos sobre `src/api/client.js` (fetch + manejo de
  errores con la clase `ApiError`, que expone el `detail` que devuelve el backend).
- `src/features/<nombre>/` — páginas y componentes propios de cada funcionalidad
  (`captura`, `animales`, `lotes`, `panel`, `alertas`).
- `src/components/` — compartidos entre features: `Layout`, `BackendStatus`, `StatCard`,
  `Badge`, `EvolucionChart` (gráfico de línea en SVG hecho a mano, sin librería de
  charts).

## Simplificaciones deliberadas (y por qué)

- **Sin fotos reales de animales:** las tarjetas usan un ícono (`PawPrint`) en vez de la
  foto que muestra el mockup, porque el modelo de datos no guarda "la" foto de un animal
  (guarda fotos de captura por evento de pesaje, no una foto de perfil fija).
- **Sin QR / escaneo de caravana:** el mockup lo insinúa pero no es una funcionalidad
  implementada ni planeada en el alcance actual; se prefirió no agregar un botón
  decorativo que no hiciera nada.
- **Sin controles de cámara reales** (luz/distancia/encuadre del mockup): la app usa el
  `<input type="file" capture="environment">` nativo del navegador/celular, no hay acceso
  de bajo nivel a la cámara.
- **2 warnings de lint aceptados** (`react(set-state-in-effect)` en
  `ListadoAnimalesPage.jsx` y `ListadoLotesPage.jsx`): es el patrón estándar de "mostrar
  cargando y disparar el fetch al entrar o cambiar de filtro", no un bug.

## Próximos pasos razonables (ninguno arrancado todavía)

1. Dockerizar en serio (build + nginx) para el VPS de DonWeb.
2. Cuando exista el módulo de Usuarios en el backend: pantalla de login y manejo de
   sesión/token acá.
3. Si se agrega modo offline en el backend (RF-16/RF-17), reflejarlo acá (cola local,
   IndexedDB, reintentos de sincronización).

## Flujo de trabajo con el usuario

Claude no ejecuta `git add` / `commit` / `push` en este repo — el usuario revisa cada
avance y commitea él mismo, a su ritmo, paso a paso.
