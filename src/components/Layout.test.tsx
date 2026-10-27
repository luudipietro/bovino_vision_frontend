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
    ultimo_acceso: null,
  },
  permisos: ["capturas_registrar", "rodeo_consultar"],
  expira_en: "2026-10-21T12:00:00Z",
};

/** Desktop sidebar only; the mobile header always shows the full logo. */
function renderizarLayout(permisos = sesion.permisos, ruta = "/captura"): string {
  return renderToString(
    <ContextoSesion.Provider
      value={{ cargando: false, sesion: { ...sesion, permisos }, iniciarSesion: async () => {}, cerrarSesion: async () => {} }}
    >
      <MemoryRouter initialEntries={[ruta]}>
        <Layout />
      </MemoryRouter>
    </ContextoSesion.Provider>,
  );
}

function renderizarSidebar(): string {
  const html = renderizarLayout();
  return html.slice(html.indexOf("<aside"), html.indexOf("</aside>"));
}

function navbarMovil(permisos = sesion.permisos, ruta = "/captura") {
  const html = renderizarLayout(permisos, ruta);
  return html.slice(html.lastIndexOf("<nav"), html.lastIndexOf("</nav>") + 6);
}

describe("Layout mobile", () => {
  const permisos = ["capturas_registrar", "rodeo_consultar", "analitica_consultar"] as Sesion["permisos"];

  it("ubica Captura en el centro y conserva el orden de las otras secciones", () => {
    const html = navbarMovil(permisos);
    expect([...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1])).toEqual([
      "/animales", "/lotes", "/captura", "/panel", "/alertas",
    ]);
    expect(html).toContain("grid-cols-[1fr_auto_1fr]");
    expect(html).toContain("md:hidden");
  });

  it.each(["/captura", "/animales"])("resalta Captura en verde y blanco también desde %s", (ruta) => {
    const html = navbarMovil(permisos, ruta);
    const enlace = html.match(/<a\b[^>]*href="\/captura"[^>]*>[\s\S]*?<\/a>/)?.[0] ?? "";
    expect(enlace).toContain("rounded-full");
    expect(enlace).toContain("bg-green-600");
    expect(enlace).toContain("text-white");
    expect(enlace).toContain("h-16 w-16");
    expect(enlace).toContain("-translate-y-3");
    expect(enlace).toContain("lucide-camera");
    expect(enlace).toContain("Captura");
  });

  it("no agrega Captura para usuarios que no tienen ese módulo", () => {
    const html = navbarMovil(["rodeo_consultar", "analitica_consultar"], "/animales");
    expect(html).not.toContain('href="/captura"');
    expect([...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1])).toEqual([
      "/animales", "/lotes", "/panel", "/alertas",
    ]);
    expect(html).toContain('aria-current="page"');
  });

  it("mantiene el orden del menú de escritorio", () => {
    const html = renderizarLayout(permisos);
    const sidebar = html.slice(html.indexOf("<aside"), html.indexOf("</aside>"));
    expect([...sidebar.matchAll(/href="([^"]+)"/g)].map((m) => m[1])).toEqual([
      "/captura", "/animales", "/lotes", "/panel", "/alertas",
    ]);
  });
});

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
