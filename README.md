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

## Autenticación y permisos

- `/login` está fuera del layout. Al cargar, la app consulta `GET /auth/sesion`; sin sesión
  (o ante un 401 en cualquier llamada) lleva al login. La sesión es una cookie `HttpOnly` del
  backend, por eso todas las llamadas usan `credentials: "include"`. En desarrollo el front
  (`localhost:5173`) y la API (`localhost:8000`) son el mismo sitio, así que la cookie viaja.
- El menú, las rutas y las acciones dependen de los permisos de la sesión
  (`src/features/auth/permisos.ts`, con tests). Cada usuario entra a su pantalla de inicio:
  Captura, Panel, Rodeo, Usuarios o Roles, según el primer permiso de esa lista. Las altas y
  ediciones de animales y lotes requieren `rodeo_gestionar`.
- Pantallas nuevas: **Usuarios** (`/usuarios`, filtro por rol, alta, edición, cambio de rol y
  baja con confirmación) y **Roles** (`/roles`, casillas de permisos por rol). Los mensajes de
  error del backend (401, 403, 409, 422, 429) se muestran tal como llegan en `detail`.

## Contrato con el backend

- Los ids son UUID (`string`) y los campos van en snake_case en español (`id_lote`,
  `id_raza`, `id_animal`). La raza sale del catálogo `GET /razas`.
- El pesaje es asíncrono: `POST /capturas` registra la foto (422 si la imagen no es
  válida), `POST /pesajes` responde 202 y la pantalla consulta `GET /capturas/{id}` cada
  segundo hasta `procesada` o `fallida`. Confirmar el resultado llama a
  `POST /capturas/{id}/confirmar`. En el paso de la foto, "Quitar foto" (o volver al paso
  anterior con la foto ya cargada) llama a `DELETE /capturas/{id}`, que solo acepta capturas
  `registrada`.
- Antes del `POST /capturas`, la foto se achica en el navegador (`reducirFoto`, con
  `createImageBitmap` y un canvas, sin dependencias): lado mayor de 1600 px como máximo y JPEG
  al 85 %, con la orientación EXIF ya aplicada. Una foto JPEG que ya entra en el límite se sube
  tal cual, y si el navegador no puede decodificarla se sube la original. Los dos valores son
  constantes de `features/captura/tamanoFoto.ts`.
- Las fotos se sirven con `GET /imagenes/{id}` (`urlDeImagen` en `src/api/imagenes.ts`), que se
  usa directo como `src` de un `<img>` y viaja con la cookie de sesión. El `id_imagen` llega en
  el pesaje (`GET /pesajes/{id}`) y en cada captura de la sesión; el historial de pesajes trae
  `id_imagen_utilizada`. `FotoCaptura` las muestra en el resultado, en el historial de la
  ficha y en la galería de la sesión, con un reemplazo neutro si la imagen no carga.
- "Pesar este animal" (en la ficha y, si no tiene pesajes, en su historial; solo con el permiso
  `capturas_registrar`) abre `/captura?animal=<id>`: la captura carga el animal con
  `GET /animales/{id}` y arranca ya identificado. El listado de animales filtra "con alertas
  activas" con `con_alertas_activas=true`.
- El resultado del pesaje muestra fecha y hora, raza, sexo y edad (del animal elegido) y el
  peso anterior con su fecha, o el aviso de primer pesaje cuando `ultimo_peso_previo` es null.
- Las alertas son `perdida_peso` o `estancamiento`, con la GMD del intervalo en `variacion`
  (kg/día) y prioridad numérica (1 es la más urgente).
