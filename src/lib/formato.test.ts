import { describe, expect, it } from "vitest";
import {
  formatearFecha,
  formatearFechaCorta,
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

  it("describes elapsed time", () => {
    const ahora = new Date("2026-10-20T12:00:00");
    expect(formatearHace("2026-10-20T11:45:00", ahora)).toBe("Hace 15 min");
    expect(formatearHace("2026-10-20T09:00:00", ahora)).toBe("Hace 3 h");
    expect(formatearHace("2026-10-19T10:00:00", ahora)).toBe("Ayer");
    expect(formatearHace("2026-10-16T12:00:00", ahora)).toBe("Hace 4 días");
  });
});
