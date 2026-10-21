# Feature: pantallas-trazabilidad

Objetivo: agregar al frontend las pantallas de lo que la API .NET ya resuelve y hoy no tiene interfaz (CU-13, CU-17, CU-18, CU-20, CU-28, CU-29). Rama `feat/pantallas-trazabilidad`, desde `manu`; un commit por unidad, sin push, PR ni merge.
Verificación: `npm run test` (Vitest) para la lógica sin interfaz, `npm run typecheck`, `npm run lint`, `npm run build` y un recorrido real en el navegador contra la API local (Postgres de Docker, nunca Neon).

## Specs

- **S1. Alcance.** Usuario: "si dale, arrancá por el 1." El punto 1 propuesto fue "Pantallas para lo que el backend ya resuelve", con esta tabla:
  - "Editar el animal (raza del catálogo, sexo, fecha de nacimiento)" (CU-17).
  - "Cambiar el lote de un animal y ver su historial de lotes" (CU-18).
  - "Crear y editar lotes con nombre y **GMD objetivo**" (CU-20).
  - "Galería de fotos de la sesión actual" (CU-13).
  - "Filtro por lote en el panel y en el reporte" (CU-28, CU-29).
  Sin cambios en el backend.
- **S2. Animal.** El alta desde el Rodeo permite cargar raza (catálogo `GET /razas`), sexo, fecha de nacimiento y lote. La ficha permite editar esos datos con `PUT /animales/{id}` y muestra el historial de lotes (`GET /animales/{id}/historial-lotes`). Restricción del backend: un valor `null` no cambia el dato, así que un dato ya cargado no se puede borrar; la interfaz no ofrece vaciarlo. Solo se envían los campos que cambiaron.
- **S3. Lotes.** El alta acepta código, nombre y GMD objetivo; cada lote se puede editar (nombre y GMD objetivo) con `PUT /lotes/{id}`. La GMD objetivo debe ser positiva (el backend responde 422 "La GMD objetivo debe ser positiva").
- **S4. Panel.** Un filtro por lote se aplica al panel (`GET /panel?id_lote=`) y al reporte (`GET /reportes?...&id_lote=`).
- **S5. Galería de la sesión.** La pantalla de captura lista las capturas de la sesión actual (`GET /sesiones-captura/{id}/capturas`) con animal, hora y estado. La API no sirve las imágenes, así que la miniatura se muestra solo para las fotos tomadas en esta pestaña (vista previa local); las demás muestran un ícono. Supuesto a confirmar: no se agrega un endpoint de imágenes en esta feature.

## Tasks

| ID | Specs | Ruta | Estado | Evidencia / commit |
| --- | --- | --- | --- | --- |
| T1 | S1, S2 | inline | hecha | `formularioAnimal.ts` (RED: módulo inexistente; GREEN 6 tests), `CamposAnimal.tsx`, `useCatalogos.ts`; alta completa en el Rodeo (arranca con el lote filtrado), edición en la ficha con `PUT` solo de lo cambiado e historial de lotes. typecheck 0, lint (2 aceptados), 26 tests. Recorrido en T5. |
| T2 | S1, S3 | inline | hecha | `formularioLote.ts` (RED: módulo inexistente; GREEN 8 tests: coma decimal, GMD positiva, solo lo cambiado), `modificarLote`; alta con código, nombre y GMD objetivo; edición en línea por lote. typecheck 0, lint (2 aceptados), 34 tests. Recorrido en T5. |
| T3 | S1, S4 | inline | hecha | Selector de lote en el encabezado del panel: recarga el panel con `id_lote` (descarta respuestas viejas), pasa `id_lote` al reporte y limpia el reporte anterior al cambiar el alcance. Las alertas no tienen filtro por lote en la API: con un lote elegido se suman las `alertas_activas` de sus animales actuales. typecheck 0, lint (2 aceptados), 34 tests. Recorrido en T5. |
| T4 | S1, S5 | inline | pendiente | Galería de la sesión de captura. |
| T5 | S1-S5 | inline + verificador | pendiente | Docs, recorrido en navegador y verificación independiente (riesgo 6: los componentes no tienen tests). |

Ruta inline: las unidades son chicas y comparten tipos y cliente; no hay disparador de escritor.

## Log

- **L1 (usuario, 2026-10-20):** "si dale, arrancá por el 1. para el estimador de peso, seria una api de inferencia hecha en python, que todavia estamos desarrollando y refinando, para que luego este back consuma ese servicio. para la autenticacion, se podria usar better auth de Neon o me recomendas otra cosa"
- **L2 (relevamiento del backend):** `CambiosAnimal` y `CambiosLote` tratan `null` como "no cambiar"; `Animal.AsignarLote` con el lote vigente no hace nada; `Lote.DefinirGmdObjetivo` rechaza valores no positivos. `CapturaDeSesion` no incluye la imagen y no existe un endpoint que la sirva.
- **L3 (fuera de esta feature):** estimador real (API de inferencia en Python, en desarrollo por el equipo) y autenticación; se tratan aparte.
- **L4 (base de la rama):** `manu` ya incluía el rediseño visual (`5d9e004`, feature `rediseno-visual`) cuando se creó esta rama, así que las pantallas usan sus componentes (`Field`, `Select`, `Button`, `Card`, `Notice`) y su formato argentino (`lib/formato.ts`).
