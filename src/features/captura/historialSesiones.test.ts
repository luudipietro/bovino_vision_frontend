import { describe, expect, it } from "vitest";
import type { SesionReciente } from "../../api/tipos";
import { agregarPagina } from "./historialSesiones";

function sesion(id: string): SesionReciente {
  return {
    id,
    fecha_inicio: "2026-10-26T20:00:00Z",
    fecha_fin: "2026-10-26T20:30:00Z",
    estado: "finalizada",
    cantidad_capturas: 1,
    cantidad_procesadas: 1,
  };
}

describe("agregarPagina", () => {
  it("appends the next page after the sessions already shown", () => {
    const historial = agregarPagina([sesion("a"), sesion("b")], [sesion("c"), sesion("d")], 2);

    expect(historial.sesiones.map((s) => s.id)).toEqual(["a", "b", "c", "d"]);
  });

  it("expects more sessions while pages come full", () => {
    expect(agregarPagina([], [sesion("a"), sesion("b")], 2).hayMas).toBe(true);
  });

  it("stops when a page comes short or empty", () => {
    expect(agregarPagina([sesion("a")], [sesion("b")], 2).hayMas).toBe(false);
    expect(agregarPagina([sesion("a")], [], 2).hayMas).toBe(false);
  });

  it("skips a session repeated because a new one shifted the pages", () => {
    const historial = agregarPagina([sesion("a"), sesion("b")], [sesion("b"), sesion("c")], 2);

    expect(historial.sesiones.map((s) => s.id)).toEqual(["a", "b", "c"]);
  });
});
