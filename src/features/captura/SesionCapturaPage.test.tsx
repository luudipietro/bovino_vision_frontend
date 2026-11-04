import { renderToString } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import SesionCapturaPage from "./SesionCapturaPage";

function renderizar(desdeHistorial = false) {
  return renderToString(
    <MemoryRouter initialEntries={[{ pathname: "/captura/sesiones/s1", state: { desdeHistorial } }]}>
      <Routes><Route path="/captura/sesiones/:id" element={<SesionCapturaPage />} /></Routes>
    </MemoryRouter>,
  );
}

describe("regreso desde una sesión", () => {
  it("vuelve al historial cuando la sesión se abrió desde allí", () => {
    const html = renderizar(true);
    expect(html).toContain('href="/captura/sesiones"');
    expect(html).toContain("Volver al historial");
    expect(html).not.toContain("Inicio de captura");
  });

  it("conserva el regreso al inicio cuando no viene del historial", () => {
    const html = renderizar();
    expect(html).toContain('href="/captura"');
    expect(html).toContain("Inicio de captura");
    expect(html).not.toContain("Volver al historial");
  });
});
