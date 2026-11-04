import { describe, expect, it } from "vitest";
import type { Lote } from "../../api/tipos";
import { cambiosDeLote, formularioDeLote, interpretarGmd, nuevoLoteDesde } from "./formularioLote";

const lote: Lote = { id: "l1", codigo: "A1", nombre: "Recría", gmd_objetivo: 0.8, cantidad_animales: 3 };

describe("interpretarGmd", () => {
  it("accepts a decimal comma or point and treats an empty text as no target", () => {
    expect(interpretarGmd("0,85")).toEqual({ valor: 0.85 });
    expect(interpretarGmd(" 1.2 ")).toEqual({ valor: 1.2 });
    expect(interpretarGmd("")).toEqual({ valor: null });
  });

  it("rejects text that is not a number and targets that are not positive", () => {
    expect(interpretarGmd("rápido")).toEqual({ error: "La GMD objetivo debe ser un número" });
    expect(interpretarGmd("0")).toEqual({ error: "La GMD objetivo debe ser positiva" });
    expect(interpretarGmd("-0,5")).toEqual({ error: "La GMD objetivo debe ser positiva" });
  });
});

describe("nuevoLoteDesde", () => {
  it("trims the texts and only sends what was filled", () => {
    expect(nuevoLoteDesde({ codigo: " B2 ", nombre: " ", gmdObjetivo: "0,7" })).toEqual({
      lote: { codigo: "B2", gmd_objetivo: 0.7 },
    });
    expect(nuevoLoteDesde({ codigo: "B2", nombre: "Engorde", gmdObjetivo: "" })).toEqual({
      lote: { codigo: "B2", nombre: "Engorde" },
    });
  });

  it("reports an invalid target instead of building the lot", () => {
    expect(nuevoLoteDesde({ codigo: "B2", nombre: "", gmdObjetivo: "0" })).toEqual({
      error: "La GMD objetivo debe ser positiva",
    });
  });
});

describe("cambiosDeLote", () => {
  it("shows the stored target with a decimal comma", () => {
    expect(formularioDeLote(lote)).toEqual({ codigo: "A1", nombre: "Recría", gmdObjetivo: "0,8" });
  });

  it("only sends the fields that changed to a value", () => {
    expect(cambiosDeLote(lote, { ...formularioDeLote(lote), gmdObjetivo: "1" })).toEqual({
      cambios: { gmd_objetivo: 1 },
    });
    expect(cambiosDeLote(lote, { ...formularioDeLote(lote), nombre: "Engorde" })).toEqual({
      cambios: { nombre: "Engorde" },
    });
    expect(cambiosDeLote(lote, formularioDeLote(lote))).toEqual({ cambios: {} });
  });

  it("ignores emptied fields because the API keeps a value when it receives null", () => {
    expect(cambiosDeLote(lote, { codigo: "A1", nombre: "", gmdObjetivo: "" })).toEqual({ cambios: {} });
  });

  it("reports an invalid target", () => {
    expect(cambiosDeLote(lote, { ...formularioDeLote(lote), gmdObjetivo: "abc" })).toEqual({
      error: "La GMD objetivo debe ser un número",
    });
  });
});
