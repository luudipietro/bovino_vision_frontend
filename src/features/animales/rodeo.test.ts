import { describe, expect, it } from "vitest";
import {
  chipsDeFicha,
  diferenciaDePeso,
  filtrosDeChip,
  lineaFechaOperario,
  porcentajeDeObjetivo,
  resumenDelRodeo,
} from "./rodeo";

describe("filtrosDeChip", () => {
  it("shows the whole herd for 'Todos'", () => {
    expect(filtrosDeChip({ tipo: "todos" })).toEqual({ idLote: null, conAlertasActivas: false });
  });

  it("filters by lot for a lot chip", () => {
    expect(filtrosDeChip({ tipo: "lote", idLote: "l1" })).toEqual({ idLote: "l1", conAlertasActivas: false });
  });

  it("filters animals with active alerts for 'Alertas'", () => {
    expect(filtrosDeChip({ tipo: "alertas" })).toEqual({ idLote: null, conAlertasActivas: true });
  });
});

describe("porcentajeDeObjetivo", () => {
  it("is the GMD as a fraction of the lot target", () => {
    expect(porcentajeDeObjetivo(0.75, 1.5)).toBeCloseTo(0.5);
  });

  it("is null when the animal has no GMD", () => {
    expect(porcentajeDeObjetivo(null, 1.5)).toBeNull();
  });

  it("is null when the lot has no target or it is not positive", () => {
    expect(porcentajeDeObjetivo(0.8, null)).toBeNull();
    expect(porcentajeDeObjetivo(0.8, 0)).toBeNull();
  });

  it("keeps a negative GMD negative", () => {
    expect(porcentajeDeObjetivo(-0.3, 1)).toBeCloseTo(-0.3);
  });
});

describe("resumenDelRodeo", () => {
  it("counts every animal and those with active alerts", () => {
    const resumen = resumenDelRodeo([{ alertas_activas: 0 }, { alertas_activas: 2 }, { alertas_activas: 1 }]);
    expect(resumen).toEqual({ cabezas: 3, conAlertas: 2 });
  });

  it("is zero for an empty herd", () => {
    expect(resumenDelRodeo([])).toEqual({ cabezas: 0, conAlertas: 0 });
  });
});

describe("diferenciaDePeso", () => {
  it("is a gain with a plus sign", () => {
    expect(diferenciaDePeso(482, 467)).toEqual({ texto: "+15 kg", tono: "ganancia" });
  });

  it("is a loss with the minus sign", () => {
    expect(diferenciaDePeso(440, 450.5)).toEqual({ texto: "-10,5 kg", tono: "perdida" });
  });

  it("is neutral without change", () => {
    expect(diferenciaDePeso(450, 450)).toEqual({ texto: "0 kg", tono: "sin_cambio" });
  });

  it("is null without a previous weighing", () => {
    expect(diferenciaDePeso(450, null)).toBeNull();
  });
});

describe("lineaFechaOperario", () => {
  it("joins the weighing date and the operator", () => {
    expect(lineaFechaOperario("2024-05-15T09:30:00", "F. López")).toBe("15 may 2024 · F. López");
  });

  it("keeps only the date without an operator", () => {
    expect(lineaFechaOperario("2024-03-08T10:00:00", null)).toBe("8 mar 2024");
  });
});

describe("chipsDeFicha", () => {
  const hoy = new Date("2026-10-21T12:00:00");

  it("shows breed, age and lot", () => {
    const animal = { raza: "Angus", fecha_nacimiento: "2024-07-10", lote_codigo: "A-12" };
    expect(chipsDeFicha(animal, hoy)).toEqual(["Angus", "2 años y 3 meses", "Lote A-12"]);
  });

  it("says what is missing instead of hiding the chip", () => {
    const animal = { raza: null, fecha_nacimiento: null, lote_codigo: null };
    expect(chipsDeFicha(animal, hoy)).toEqual(["Raza sin registrar", "Edad sin registrar", "Sin lote"]);
  });
});
