import { describe, expect, it } from "vitest";
import { describirAlerta, formatearGmd, nivelDePrioridad } from "./textos";

describe("nivelDePrioridad", () => {
  it("maps the numeric API priority to a level, 1 being the most urgent", () => {
    expect(nivelDePrioridad(1)).toBe("alta");
    expect(nivelDePrioridad(2)).toBe("media");
    expect(nivelDePrioridad(3)).toBe("baja");
  });
});

describe("formatearGmd", () => {
  it("shows the sign of positive gains and two decimals", () => {
    expect(formatearGmd(0.8)).toBe("+0,80 kg/día");
    expect(formatearGmd(-0.35)).toBe("-0,35 kg/día");
    expect(formatearGmd(0)).toBe("0,00 kg/día");
  });
});

describe("describirAlerta", () => {
  it("describes a weight loss with the interval GMD", () => {
    expect(describirAlerta({ tipo: "perdida_peso", variacion: -0.35, gmd_esperada: null })).toBe(
      "Pérdida de peso: GMD -0,35 kg/día",
    );
  });

  it("adds the lot target to a stagnation", () => {
    expect(describirAlerta({ tipo: "estancamiento", variacion: 0, gmd_esperada: 0.8 })).toBe(
      "Estancamiento: GMD 0,00 kg/día (objetivo +0,80 kg/día)",
    );
  });
});
