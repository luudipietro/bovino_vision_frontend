import { describe, expect, it } from "vitest";
import {
  formatearEdad,
  formatearFecha,
  formatearFechaCorta,
  formatearFechaHora,
  formatearHace,
  formatearKg,
  formatearNumero,
  formatearPorcentaje,
} from "./formato";

describe("formato", () => {
  it("uses decimal comma and dot for thousands", () => {
    expect(formatearNumero(1248)).toBe("1.248");
    expect(formatearNumero(0.85, 2)).toBe("0,85");
  });

  it("formats kilograms with a separate unit", () => {
    expect(formatearKg(452)).toBe("452 kg");
    expect(formatearKg(452.46, 1)).toBe("452,5 kg");
  });

  it("puts a space before the percent sign", () => {
    expect(formatearPorcentaje(0.6)).toBe("60 %");
  });

  it("reads API calendar dates as local dates", () => {
    expect(formatearFecha("2026-10-20")).toBe("20/10/2026");
    expect(formatearFechaCorta("2026-09-01")).toBe("1 sept");
  });

  it("shows date and time on a 24-hour clock", () => {
    expect(formatearFechaHora("2026-10-19T22:05:00")).toBe("19/10/2026, 22:05");
    expect(formatearFechaHora("2026-10-19T10:00:00")).toBe("19/10/2026, 10:00");
  });

  it("describes elapsed time", () => {
    const ahora = new Date("2026-10-20T12:00:00");
    expect(formatearHace("2026-10-20T11:45:00", ahora)).toBe("Hace 15 min");
    expect(formatearHace("2026-10-20T09:00:00", ahora)).toBe("Hace 3 h");
    expect(formatearHace("2026-10-19T10:00:00", ahora)).toBe("Ayer");
    expect(formatearHace("2026-10-16T12:00:00", ahora)).toBe("Hace 4 días");
  });

  describe("formatearEdad", () => {
    const hoy = new Date("2026-10-21T12:00:00");

    it("counts whole calendar months and speaks in years once past a year", () => {
      expect(formatearEdad("2024-07-10", hoy)).toBe("2 años y 3 meses");
      expect(formatearEdad("2025-04-21", hoy)).toBe("1 año y 6 meses");
      expect(formatearEdad("2025-10-21", hoy)).toBe("1 año");
      expect(formatearEdad("2023-10-21", hoy)).toBe("3 años");
    });

    it("speaks in months below a year, singular for one", () => {
      expect(formatearEdad("2026-02-21", hoy)).toBe("8 meses");
      expect(formatearEdad("2026-09-21", hoy)).toBe("1 mes");
    });

    it("does not count a month until its day has come", () => {
      expect(formatearEdad("2025-10-22", hoy)).toBe("11 meses");
      expect(formatearEdad("2026-09-22", hoy)).toBe("Menos de 1 mes");
    });

    it("says less than a month for a newborn", () => {
      expect(formatearEdad("2026-10-05", hoy)).toBe("Menos de 1 mes");
      expect(formatearEdad("2026-10-21", hoy)).toBe("Menos de 1 mes");
    });

    it("has no age for a birth date in the future", () => {
      expect(formatearEdad("2026-10-22", hoy)).toBeNull();
    });
  });
});
