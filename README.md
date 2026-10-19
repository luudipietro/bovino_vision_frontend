# BovinoVision — Frontend

Interfaz web de BovinoVision, construida con **React + Vite + Tailwind CSS** (JavaScript,
sin TypeScript).

## Estructura

- `src/api/` — cliente HTTP y funciones por recurso para hablar con el backend.
- `src/features/` — una carpeta por funcionalidad (`captura`, `animales`, `lotes`, …), cada
  una con sus páginas y componentes propios.
- `src/components/` — componentes de UI compartidos entre features.

## Requisitos

- Node.js 24+

## Cómo correrlo localmente

```bash
npm install
npm run dev
```

Por defecto espera el backend en `http://localhost:8000` (ver `.env.example` →
`VITE_API_URL`).

## Build de producción

```bash
npm run build
```
