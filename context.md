# Contexto del frontend — BovinoVision

Estado al 19/10/2026, fin de la primera sesión de desarrollo. Esto no reemplaza al
`README.md` (para correrlo, ver ahí); es un resumen de decisiones y alcance para retomar
el trabajo sin tener que releer todo el historial de la conversación.

## Qué es esto

Interfaz web (React + Vite + Tailwind v4, TypeScript estricto) del sistema BovinoVision.
Consume la API .NET del repo `../bovino_vision_backend` (URL configurable por
`VITE_API_URL`). El 20/10/2026 se migró de JavaScript a TypeScript y se adaptó al contrato
de la API .NET (rama `feat/migracion-typescript`; detalle en
`odd/tasks/migracion-typescript.md`).

## Diseño visual

El 20/10/2026 se rediseñó toda la interfaz (`odd/tasks/rediseno-visual.md`). Del Figma
de ZOCO (otro sistema, usado solo como referencia de estilo) se copió el lenguaje
visual: tipografía Montserrat, iconos `lucide-react` de trazo 2 px, tiles KPI oscuros,
tablas con encabezado gris y filas como tarjetas, pestañas subrayadas, gráfico de líneas
suavizadas con tooltip oscuro y asistente por pasos. La paleta sale del design system de
BovinoVision en Claude Design: verde como color de acción y marca, marrón para el
contexto del animal (raza), fondo crema, tarjetas blancas, sombras tintadas en verde.

- **Tokens:** `src/index.css` define en `@theme` solo los colores del design system
  (`green-*`, `brown-*`, `cream`, `terracotta-*`, `neutral-*`, `success-*`, `warning-*`,
  `danger-*`, `info-*`) y anula los de Tailwind (`--color-*: initial`): una clase como
  `stone-100` o `lime-300` no genera estilo.
- **Formato argentino:** números, pesos, fechas y porcentajes pasan por
  `src/lib/formato.ts` (`452,5 kg`, `60 %`, `20/10/2026, 14:30`).
- **Layout:** sidebar fija en desktop con logo y pastilla de fecha, barra inferior en
  mobile — ver `src/components/Layout.tsx`. El emblema `public/logo-mark.png` viene del
  design system.

**Importante:** el propio documento de diseño (página 6) aclara explícitamente que los
indicadores de "estado sanitario", grasa, musculatura y precio que aparecen en algunos
mockups **no forman parte del alcance** del proyecto — no están implementados a
propósito, no es un olvido. Donde el mockup mostraba ese dato, se usó algo real en su
lugar (por ejemplo, "Alertas activas" en vez de "Estado Sanitario" en el panel).

## Estructura

- `src/api/` — un archivo por recurso del backend (`animales`, `lotes`, `razas`,
  `capturas`, `pesajes`, `alertas`, `analitica`), todos sobre `src/api/client.ts` (fetch +
  manejo de errores con la clase `ApiError`, que expone el `detail` de ProblemDetails). Los
  tipos del contrato están en `src/api/tipos.ts`.
- `src/features/<nombre>/` — páginas y componentes propios de cada funcionalidad
  (`captura`, `animales`, `lotes`, `panel`, `alertas`).
- `src/components/` — compartidos entre features: `Layout`, `BackendStatus`, `PageHeader`,
  `Button` (+ `buttonStyles` para links), `Badge`, `Card`, `KpiTile`, `StatCard`, `Tabs`,
  `Field` (`Input`, `Select`, `SearchInput`), `Table`, `Feedback` (`Notice`, `Loading`,
  `EmptyState`), `ProgressBar`, `Stepper` y `LineChart` (gráfico SVG propio, sin librería
  de charts, con hover y navegación por teclado).
- `src/lib/formato.ts` — formato argentino de números y fechas.

## Simplificaciones deliberadas (y por qué)

- **Sin fotos reales de animales:** el rodeo se muestra como tabla, sin miniatura, en vez de la
  foto que muestra el mockup, porque el modelo de datos no guarda "la" foto de un animal
  (guarda fotos de captura por evento de pesaje, no una foto de perfil fija).
- **Sin QR / escaneo de caravana:** el mockup lo insinúa pero no es una funcionalidad
  implementada ni planeada en el alcance actual; se prefirió no agregar un botón
  decorativo que no hiciera nada.
- **Sin controles de cámara reales** (luz/distancia/encuadre del mockup): la app usa el
  `<input type="file" capture="environment">` nativo del navegador/celular, no hay acceso
  de bajo nivel a la cámara.
- **2 warnings de lint aceptados** (`react(set-state-in-effect)` en
  `ListadoAnimalesPage.tsx` y `ListadoLotesPage.tsx`): es el patrón estándar de "mostrar
  cargando y disparar el fetch al entrar o cambiar de filtro", no un bug.

## Pesaje asíncrono

`useCaptura` registra la foto, pide el pesaje (202) y consulta el estado de la captura cada
segundo hasta `procesada` o `fallida`. La espera vive en `esperarResultado.ts`, una función
pura con sus dependencias inyectadas, para poder testearla sin React. La consulta no tiene tope porque la cola del backend
reintenta sola y siempre termina en uno de esos estados; se corta al salir de la página o al
pesar otro animal. Una captura `fallida` no se reintenta: se registra una nueva. En
desarrollo, `StrictMode` monta la página dos veces y abre dos sesiones de captura (ya pasaba
antes de la migración).

## Próximos pasos razonables (ninguno arrancado todavía)

1. Dockerizar en serio (build + nginx) para el VPS de DonWeb.
2. Cuando exista el módulo de Usuarios en el backend: pantalla de login y manejo de
   sesión/token acá.
3. Si se agrega modo offline en el backend (RF-16/RF-17), reflejarlo acá (cola local,
   IndexedDB, reintentos de sincronización).

## Flujo de trabajo con el usuario

Claude hace los commits automáticamente (Conventional Commits, sin atribución de IA). El
trabajo grande va en una rama de feature con un commit por unidad de trabajo. Push, PR y
merge siguen siendo decisión del usuario, que revisa la rama antes de mergear.
