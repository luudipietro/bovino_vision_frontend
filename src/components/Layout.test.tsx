import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Sesion } from "../api/tipos";
import { ContextoSesion } from "../features/auth/useSesion";
import Layout from "./Layout";

let guardado: string | null = null;

vi.mock("./sidebarPreferencia", async (original) => ({
  ...(await original<typeof import("./sidebarPreferencia")>()),
  almacenDelNavegador: () => ({
    getItem: () => guardado,
    setItem: (_clave: string, valor: string) => {
      guardado = valor;
    },
  }),
}));

const sesion: Sesion = {
  usuario: {
    id: "u1",
    nombre: "Operario",
    correo: "operario@campo.com",
    id_rol: "r1",
    rol: "Operario de Campo",
    activo: true,
    bloqueado_hasta: null,
  },
  permisos: ["capturas_registrar", "rodeo_consultar"],
  expira_en: "2026-10-21T12:00:00Z",
};

/** Desktop sidebar only; the mobile header always shows the full logo. */
function renderizarSidebar(): string {
  const html = renderToString(
    <ContextoSesion.Provider
      value={{ cargando: false, sesion, iniciarSesion: async () => {}, cerrarSesion: async () => {} }}
    >
      <MemoryRouter initialEntries={["/captura"]}>
        <Layout />
      </MemoryRouter>
    </ContextoSesion.Provider>,
  );
  return html.slice(html.indexOf("<aside"), html.indexOf("</aside>"));
}

describe("Layout sidebar", () => {
  beforeEach(() => {
    guardado = null;
  });

  it("shows the wordmark, labels and a collapse button when expanded", () => {
    const html = renderizarSidebar();
    expect(html).toContain(">Bovino</span>");
    expect(html).toContain('aria-label="Colapsar menú"');
    expect(html).toContain('aria-expanded="true"');
    expect(html).toMatch(/<span>Captura<\/span>/);
  });

  it("keeps only the emblem and the module icons when collapsed", () => {
    guardado = "1";
    const html = renderizarSidebar();
    expect(html).not.toContain(">Bovino</span>");
    expect(html).toContain('alt="BovinoVision"');
    expect(html).toContain('aria-label="Expandir menú"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('<span class="sr-only">Captura</span>');
    expect(html).toContain('title="Rodeo"');
  });

  it("no longer shows the backend status", () => {
    expect(renderizarSidebar()).not.toContain("Backend");
  });
});
