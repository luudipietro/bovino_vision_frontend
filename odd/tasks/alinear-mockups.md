# Alinear el frontend con los mockups de Claude Design

Objetivo: acercar las pantallas a los mockups (artifact `NzwJeyFvLskXkfEze2WX71`) sin perder la base visual del rediseño (tokens del design system, Montserrat, Lucide, cards y gráficos estilo ZOCO), y sumar cinco cambios chicos de backend que esas pantallas necesitan.
Ramas: `feat/alinear-mockups` en los dos repos (worktrees `../bovino_vision_frontend-mockups` y `../bovino_vision_backend-mockups`, base `manu`). Entrega: un commit por unidad, sin push. Tests: Vitest (frontend) y `dotnet test` (backend, Api.Tests necesita Docker).

Referencias locales de los mockups (solo lectura): `C:\Users\Usuario\AppData\Local\Temp\claude\E--PROYECTO-FINAL-bovino-vision-backend\3eb9d43e-48d4-42ef-9c73-878ec6694e7a\scratchpad\mockups\` con `movil.html` / `movil.txt` (1b y 1c, celular) y `escritorio.html` / `escritorio.txt` (1d, panel de escritorio). Los íconos del mockup son Material Symbols; acá se usan sus equivalentes de Lucide.

## Specs

Reglas generales (G):

- G1. No perder la base del rediseño: usar los componentes de `src/components` y los tokens de `src/index.css`; nada de colores fuera del design system, nada de dependencias nuevas.
- G2. No mostrar datos que el sistema no tiene. Quedan afuera: "Precisión 90,4 % · Error ± 12 kg", estado sanitario ("SALUDABLE", "Salud: estable", "Plan sanitario"), "Estado del pastoreo", alertas febril/sanitaria, "Ficha PDF", "Exportar CSV", "Exportar historial", "INVITADO", foto de perfil, auditoría y sincronización offline ("3 EN COLA", "Última sincronización").
- G3. Textos de interfaz en español rioplatense como el resto de la app; formatos con `src/lib/formato.ts`.

Backend (B), aprobado como "cambios chicos del backend":

- B1. Sesiones recientes: `GET /sesiones-captura?limite=N` (por defecto 5, máximo 20) devuelve las sesiones de captura del usuario de la sesión, más nuevas primero: `[{ id, fecha_inicio, fecha_fin, estado, cantidad_capturas, cantidad_procesadas }]`. Permiso `capturas_registrar`. `limite` fuera de 1..20 → 400 o 422 con ProblemDetails (según el patrón del repo).
- B2. Operario del pesaje: campo `operario: string | null` (nombre del usuario dueño de la sesión de captura) en `GET /pesajes/{id}` y en cada ítem de `GET /animales/{id}/pesajes`.
- B3. GMD en el listado: campo `gmd_kg_dia: number | null` en cada ítem de `GET /animales` y en `GET /animales/{id}`: GMD entre los dos últimos pesajes del animal (días calendario entre fechas de pesaje, la misma regla que ya usa el historial); `null` con menos de dos pesajes. Se calcula al consultar, nunca se guarda.
- B4. Último acceso: campo `ultimo_acceso: FechaHora | null` en los usuarios de `GET /usuarios` (y donde se devuelva el mismo DTO): la fecha de creación de la sesión de usuario más reciente. Sin migración.
- B5. Resolver alerta: `POST /alertas/{id}/resolver` → 204 y la alerta pasa de `activa` a `resuelta` (deja de aparecer en `GET /alertas`). 404 si no existe o es de otro establecimiento; 409 si ya estaba resuelta. Permiso `rodeo_gestionar` (supuesto: es una acción de escritura sobre el rodeo; `analitica_consultar` es solo lectura). Sin migración.

Frontend (F), la lista que se propuso y el usuario aprobó ("hacé las dos cosas"):

- F1. Captura: "Inicio con el botón grande "Nueva captura" y su subtítulo." Además "Sesiones recientes" con B1 (pantalla 1b "Inicio": "Sesiones recientes", "N animales procesados", hora o "Ayer"), saludo con el nombre del usuario y un indicador "En línea" / "Sin conexión" basado en `navigator.onLine` (sin texto de sincronización, G2).
- F2. Captura: "Guía de toma con los tres indicadores." ("Luz correcta", "Acercate 1 m", "Encuadre", "Alineá el animal de perfil con la guía", "Cuatro tomas dan la mejor estimación").
- F3. Captura: "Estimando peso" como lista de pasos reales (imágenes subidas, estado de la captura pendiente → procesando → procesada) en lugar de pasos inventados del modelo, con el aviso "No cierres la aplicación".
- F4. Captura: "Resultado con el layout del mockup: peso grande, ficha de datos y acciones abajo." Ficha: "Identificador SENASA", "Lote", "Pesaje anterior" ("443 kg · +15 kg en 33 días"), "Operario" con B2 ("F. López · hoy 09:12"). Acciones: "Confirmar y enviar", "Tomar otra", "Descartar esta medición".
- F5. Rodeo: "Chips de filtro y contador "Total cabezas"." Chips: "Todos", uno por lote, "Alertas" (animales con `alertas_activas > 0`).
- F6. Rodeo: "Tarjetas de animal en el listado de escritorio." Cada tarjeta: lote, "ID SENASA", raza, "Último peso", "GMD" (B3) y la GMD como porcentaje de la GMD objetivo del lote cuando el lote la tiene; en lugar de "Salud: …" (G2) mostrar si tiene alertas activas.
- F7. Rodeo: "Encabezado de la ficha con chips de raza, edad y lote."
- F8. Rodeo: "Últimos pesajes con la diferencia de peso en verde o rojo." más el operario de cada pesaje (B2), como "15 may 2024 · F. López".
- F9. Panel: "Layout del dashboard." (1d "Dashboard": título, subtítulo "N cabezas en M lotes · datos al …", "Evolución de peso promedio", "Alertas críticas").
- F10. Panel: "Curva "real vs objetivo", calculada desde el primer pesaje del lote y su GMD objetivo." Solo cuando hay un lote elegido que tiene `gmd_objetivo`; leyenda "Real" / "Objetivo".
- F11. Panel y Alertas: "Alertas como tarjetas con "Ver ficha"." más la acción de resolver (B5) visible solo con el permiso `rodeo_gestionar`, y "Ver las N alertas" hacia `/alertas`.
- F12. Usuarios: "Chips por rol con su conteo y estados como badges." más "Último acceso" (B4).
- F13. Roles: "Permisos agrupados ("Ganadería y campo", "Administración") con su descripción y la marca "Crítico"."

## Tasks

| ID | Specs | Ruta | Estado | Commit |
|---|---|---|---|---|
| T1 | contrato de tipos y clientes API (B1–B5 del lado del frontend) | inline (padre) | hecho | (en el commit de T3) |
| T2 | B1–B5 | delegada, writer backend (paralelo, otro repo) | pendiente | |
| T3 | F1–F4 | delegada, writer captura (paralelo) | pendiente | |
| T4 | F5–F8 | delegada, writer rodeo (paralelo) | pendiente | |
| T5 | F9–F11 | delegada, writer panel y alertas (paralelo) | pendiente | |
| T6 | F12–F13 | delegada, writer usuarios y roles (paralelo) | pendiente | |
| T7 | seam check, docs (`README.md`, `context.md`), verificación independiente de B5 (riesgo ítem 2) | inline + verifier | pendiente | |

Ruta: cinco unidades independientes con superficies disjuntas, cada una de varios archivos o más de 100 líneas, lanzadas juntas (disparador Writer (a)). El padre es dueño de git, de `src/api/*` y de `src/components/*` en el frontend.

## Log

- L1 (2026-10-24, usuario): "https://claude.ai/artifact/NzwJeyFvLskXkfEze2WX71 el sistema (como está ahora, es decir, con el alcance del MVP) cubre estos mockups? ademas, se podria hacer que el frontend siga un poco más lo que presentan los mockups? obviamente sin perder la base del rediseño que hicimos con el diseño figma que te adjunté la otra vez"
- L2 (2026-10-24): se respondió con la tabla de cobertura, la lista de cambios solo de frontend y los cambios chicos de backend (sesiones recientes, operario del pesaje, GMD en el listado, último acceso, resolver alerta). Aviso: otra sesión hace commits en `manu` del frontend.
- L3 (2026-10-24, usuario): "hacé las dos cosas, frontend y cambios chicos del backend, en una rama aparte"
- L4: se crearon los worktrees desde `manu` (backend `a315ea4`, frontend `07060b3`). Docker no estaba corriendo; se inició Docker Desktop para los tests de integración.
