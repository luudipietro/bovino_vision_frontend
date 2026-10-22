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
- **Layout:** sidebar fija en desktop con logo y pastilla de fecha, colapsable a solo emblema e iconos (la preferencia se recuerda por navegador en `localStorage`), barra inferior en
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
  (`captura`, `animales`, `lotes`, `panel`, `alertas`, `auth`, `usuarios`, `roles`).
- `src/components/` — compartidos entre features: `Layout`, `PageHeader`,
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

## Datos editables y sus límites

- **Animal:** el alta del Rodeo carga raza (catálogo `/razas`), sexo, fecha de nacimiento y
  lote; la ficha permite editarlos y muestra el historial de lotes. Solo se envían los campos
  que cambiaron (`formularioAnimal.ts`).
- **Lote:** alta y edición en línea de nombre y GMD objetivo (`formularioLote.ts`, acepta coma
  decimal y exige un valor positivo). Sin GMD objetivo nunca se dispara la alerta de
  estancamiento.
- **Límite del backend:** un `null` significa "no cambiar", así que un dato ya cargado se
  puede cambiar pero no borrar; la interfaz no ofrece vaciarlo.
- **Panel:** el selector de lote filtra el panel y el reporte. La API de alertas no filtra
  por lote: con un lote elegido se suman las `alertas_activas` de sus animales actuales.
- **Fotos de la sesión:** la pantalla de captura lista las capturas de la sesión con su
  estado. La API no sirve imágenes, así que la miniatura solo aparece para las fotos tomadas
  en esa pestaña.

## Pesaje asíncrono

`useCaptura` registra la foto, pide el pesaje (202) y consulta el estado de la captura cada
segundo hasta `procesada` o `fallida`. La espera vive en `esperarResultado.ts`, una función
pura con sus dependencias inyectadas, para poder testearla sin React. La consulta no tiene tope porque la cola del backend
reintenta sola y siempre termina en uno de esos estados; se corta al salir de la página o al
pesar otro animal. Una captura `fallida` no se reintenta: se registra una nueva. En
desarrollo, `StrictMode` monta la página dos veces y abre dos sesiones de captura (ya pasaba
antes de la migración).

**Volver atrás:** cada paso (menos el primero) tiene un botón "Volver" definido en
`navegacion.ts` (función pura con test). Desde la foto se vuelve a identificar al animal; desde
estimando y desde el resultado, a la foto del mismo animal. Subir la foto ya registra una
captura `registrada`, así que "Quitar foto" y volver desde la foto llaman a
`DELETE /capturas/{id}` para no dejar capturas "Sin procesar" en la galería; si falla, se
muestra el error y se conserva la foto. Volver desde estimando corta la consulta pero la
estimación sigue en el servidor y su resultado se ve en la galería de la sesión; volver desde
el resultado no toca el pesaje, que es inmutable.

## Sesión y permisos

- La sesión vive en una cookie `HttpOnly` que maneja el backend; el front no guarda ningún
  token. `SesionProvider` consulta `GET /auth/sesion` al arrancar y expone el usuario y sus
  permisos (`useSesion`, `usePuede`). `client.ts` manda `credentials: "include"` y avisa
  (`alNoAutorizado`) ante cualquier 401 salvo el del propio `POST /auth/sesion`, que muestra la
  página de login.
- `features/auth/permisos.ts` es la regla pura: qué sección habilita cada permiso, qué permiso
  pide cada ruta y cuál es la pantalla de inicio. `RutaProtegida` aplica esa regla (sin sesión
  va a `/login`; sin permiso va al inicio del usuario). Esconder un botón no es seguridad: el
  backend vuelve a validar cada request.
- Usuarios y Roles siguen el patrón de Lotes (formularios en línea, lógica de formulario en
  módulos puros con tests), pero cargan sus listas con un efecto que solo actualiza estado al
  responder, para no sumar warnings de lint.

## Próximos pasos razonables (ninguno arrancado todavía)

1. Dockerizar en serio (build + nginx) para el VPS de DonWeb.
2. Si se agrega modo offline en el backend (RF-16/RF-17), reflejarlo acá (cola local,
   IndexedDB, reintentos de sincronización).

## Flujo de trabajo con el usuario

Claude hace los commits automáticamente (Conventional Commits, sin atribución de IA). El
trabajo grande va en una rama de feature con un commit por unidad de trabajo. Push, PR y
merge siguen siendo decisión del usuario, que revisa la rama antes de mergear.
