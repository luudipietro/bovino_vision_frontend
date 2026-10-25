import { describe, expect, it } from "vitest";
import { curvaObjetivo, subtituloDelPanel } from "./panel";

const puntos = [
  { fecha: "2026-01-01", peso_promedio_kg: 400 },
  { fecha: "2026-01-11", peso_promedio_kg: 410 },
  { fecha: "2026-02-01", peso_promedio_kg: 440 },
];

describe("curvaObjetivo", () => {
  it("adds the target daily gain times the days since the first real point", () => {
    expect(curvaObjetivo(puntos, 0.8)).toEqual([400, 408, 400 + 0.8 * 31]);
  });

  it("has no curve when the lot has no target GMD", () => {
    expect(curvaObjetivo(puntos, null)).toBeNull();
  });

  it("has no curve without real points", () => {
    expect(curvaObjetivo([], 0.8)).toBeNull();
  });

  it("starts from the first point that has a weight", () => {
    const conHueco = [{ fecha: "2026-01-01", peso_promedio_kg: null }, ...puntos.slice(1)];
    expect(curvaObjetivo(conHueco, 1)).toEqual([410, 410 + 21]);
  });
});

describe("subtituloDelPanel", () => {
  it("counts heads and lots of the whole herd and shows the data date", () => {
    expect(subtituloDelPanel({ cabezas: 1248, lotes: 6, ultimaFecha: "2026-05-24" })).toBe(
      "1.248 cabezas en 6 lotes · datos al 24 may",
    );
  });

  it("uses the singular for one head and one lot", () => {
    expect(subtituloDelPanel({ cabezas: 1, lotes: 1, ultimaFecha: "2026-05-24" })).toBe(
      "1 cabeza en 1 lote · datos al 24 may",
    );
  });

  it("names the lot when one is selected", () => {
    expect(subtituloDelPanel({ cabezas: 214, lotes: 6, codigoLote: "A-12", ultimaFecha: "2026-05-24" })).toBe(
      "214 cabezas en el lote A-12 · datos al 24 may",
    );
  });

  it("leaves out the date when there are no weighings yet", () => {
    expect(subtituloDelPanel({ cabezas: 0, lotes: 2, ultimaFecha: null })).toBe("0 cabezas en 2 lotes");
  });
});
