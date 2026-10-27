import { afterEach, describe, expect, it, vi } from "vitest";
import { listarSesionesRecientes } from "../../api/capturas";
import { cargarPaginaSesiones } from "./paginaSesiones";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

afterEach(() => vi.unstubAllGlobals());

function responder(cantidad: number) {
  const sesiones = Array.from({ length: cantidad }, (_, i) => ({ id: `s${i}` }));
  const fetchFalso = vi.fn().mockResolvedValue(new Response(JSON.stringify(sesiones)));
  vi.stubGlobal("fetch", fetchFalso);
  return fetchFalso;
}

function consulta(fetchFalso: ReturnType<typeof responder>) {
  return new URL(fetchFalso.mock.calls[0]![0] as string, "http://localhost").searchParams;
}

describe("páginas del historial", () => {
  it("muestra diez sesiones y usa una extra para saber si hay siguiente", async () => {
    const fetchFalso = responder(11);
    const resultado = await cargarPaginaSesiones({ pagina: 2, desde: "", hasta: "" });
    expect(resultado.sesiones.map((s) => s.id)).toEqual(Array.from({ length: 10 }, (_, i) => `s${i}`));
    expect(resultado.hayMas).toBe(true);
    expect(consulta(fetchFalso).get("limite")).toBe("11");
    expect(consulta(fetchFalso).get("desplazamiento")).toBe("10");
    expect(consulta(fetchFalso).has("desde")).toBe(false);
    expect(consulta(fetchFalso).has("hasta")).toBe(false);
  });

  it.each([0, 3, 10])("no ofrece siguiente con %i resultados", async (cantidad) => {
    responder(cantidad);
    const resultado = await cargarPaginaSesiones({ pagina: 1, desde: "", hasta: "" });
    expect(resultado.sesiones).toHaveLength(cantidad);
    expect(resultado.hayMas).toBe(false);
  });

  it("envía las medianoches locales e incluye todo el día final", async () => {
    const fetchFalso = responder(0);
    await cargarPaginaSesiones({ pagina: 1, desde: "2026-10-24", hasta: "2026-10-26" });
    expect(consulta(fetchFalso).get("desde")).toBe(new Date(2026, 9, 24).toISOString());
    expect(consulta(fetchFalso).get("hasta")).toBe(new Date(2026, 9, 27).toISOString());
    expect(consulta(fetchFalso).get("desplazamiento")).toBe("0");
  });

  it("permite un solo extremo y rechaza un rango invertido sin consultar", async () => {
    const fetchFalso = responder(0);
    await cargarPaginaSesiones({ pagina: 1, desde: "", hasta: "2026-10-26" });
    expect(consulta(fetchFalso).has("desde")).toBe(false);
    expect(consulta(fetchFalso).get("hasta")).toBe(new Date(2026, 9, 27).toISOString());
    fetchFalso.mockClear();
    await expect(cargarPaginaSesiones({ pagina: 1, desde: "2026-10-27", hasta: "2026-10-26" }))
      .rejects.toThrow("La fecha Desde no puede ser posterior a Hasta.");
    expect(fetchFalso).not.toHaveBeenCalled();
  });

  it("conserva la consulta de sesiones recientes del inicio de captura", async () => {
    const fetchFalso = responder(5);
    await listarSesionesRecientes();
    expect(fetchFalso).toHaveBeenCalledWith(`${BASE}/sesiones-captura`, { credentials: "include" });
  });
});
