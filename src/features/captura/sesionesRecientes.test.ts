import { describe, expect, it } from "vitest";
import type { SesionReciente } from "../../api/tipos";
import { nombreAbreviado, resumirSesion, saludoSegunHora } from "./sesionesRecientes";

const ahora = new Date("2026-10-21T12:00:00");

const sesion: SesionReciente = {
  id: "s1",
  fecha_inicio: "2026-10-21T08:45:00",
  fecha_fin: null,
  estado: "activa",
  cantidad_capturas: 14,
  cantidad_procesadas: 12,
};

describe("resumirSesion", () => {
  it("counts the processed animals of the session", () => {
    expect(resumirSesion(sesion, ahora).detalle).toBe("12 animales procesados");
  });

  it("uses the singular for one animal", () => {
    expect(resumirSesion({ ...sesion, cantidad_procesadas: 1 }, ahora).detalle).toBe("1 animal procesado");
  });

  it("reads zero processed animals as plural", () => {
    expect(resumirSesion({ ...sesion, cantidad_procesadas: 0 }, ahora).detalle).toBe("0 animales procesados");
  });

  it("shows only the hour for a session started today", () => {
    expect(resumirSesion(sesion, ahora).cuando).toBe("08:45");
  });

  it("shows 'Ayer' for a session started the previous calendar day", () => {
    const deAyer = { ...sesion, fecha_inicio: "2026-10-20T23:50:00" };
    expect(resumirSesion(deAyer, ahora).cuando).toBe("Ayer");
  });

  it("shows the date for older sessions", () => {
    const vieja = { ...sesion, fecha_inicio: "2026-10-12T09:15:00" };
    expect(resumirSesion(vieja, ahora).cuando).toBe("12/10/2026");
  });

  it("flags the sessions that are still open", () => {
    expect(resumirSesion(sesion, ahora).enCurso).toBe(true);
    expect(resumirSesion({ ...sesion, estado: "finalizada" }, ahora).enCurso).toBe(false);
  });
});

describe("saludoSegunHora", () => {
  it("greets by the part of the day", () => {
    expect(saludoSegunHora(new Date("2026-10-21T06:00:00"))).toBe("Buenos días");
    expect(saludoSegunHora(new Date("2026-10-21T13:00:00"))).toBe("Buenas tardes");
    expect(saludoSegunHora(new Date("2026-10-21T21:00:00"))).toBe("Buenas noches");
    expect(saludoSegunHora(new Date("2026-10-21T02:00:00"))).toBe("Buenas noches");
  });
});

describe("nombreAbreviado", () => {
  it("keeps the first initial and the last word", () => {
    expect(nombreAbreviado("Francisco López")).toBe("F. López");
    expect(nombreAbreviado("Ana María Pérez")).toBe("A. Pérez");
  });

  it("keeps a single word as it is", () => {
    expect(nombreAbreviado("Sistema")).toBe("Sistema");
    expect(nombreAbreviado("  Sistema ")).toBe("Sistema");
  });
});
