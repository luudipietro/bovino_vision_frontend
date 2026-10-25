import { describe, expect, it } from "vitest";
import {
  chipsDeFicha,
  diferenciaDePeso,
  filtrosDeChip,
  lineaFechaOperario,
  porcentajeDeObjetivo,
  resumenDelRodeo,
  tarjetasDelRodeo,
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
  const animal = (datos: Partial<Parameters<typeof resumenDelRodeo>[0][number]>) => ({
    id_lote: null,
    ultimo_peso_kg: null,
    gmd_kg_dia: null,
    alertas_activas: 0,
    ...datos,
  });

  it("counts every animal and those with active alerts", () => {
    const resumen = resumenDelRodeo([
      animal({ alertas_activas: 0 }),
      animal({ alertas_activas: 2 }),
      animal({ alertas_activas: 1 }),
    ]);
    expect(resumen).toMatchObject({ cabezas: 3, conAlertas: 2 });
  });

  it("adds up every active alert, not only the animals that have them", () => {
    const resumen = resumenDelRodeo([animal({ alertas_activas: 2 }), animal({ alertas_activas: 1 })]);
    expect(resumen.alertas).toBe(3);
  });

  it("counts the distinct lots that have animals, leaving out animals without a lot", () => {
    const resumen = resumenDelRodeo([
      animal({ id_lote: "a" }),
      animal({ id_lote: "a" }),
      animal({ id_lote: "b" }),
      animal({ id_lote: null }),
    ]);
    expect(resumen.lotes).toBe(2);
  });

  it("averages the last weight of the animals that were weighed", () => {
    const resumen = resumenDelRodeo([
      animal({ ultimo_peso_kg: 400 }),
      animal({ ultimo_peso_kg: 450 }),
      animal({ ultimo_peso_kg: null }),
    ]);
    expect(resumen).toMatchObject({ pesoPromedio: 425, conPeso: 2 });
  });

  it("averages the GMD of the animals that have one", () => {
    const resumen = resumenDelRodeo([
      animal({ gmd_kg_dia: 0.8 }),
      animal({ gmd_kg_dia: 1 }),
      animal({ gmd_kg_dia: null }),
    ]);
    expect(resumen.gmdPromedio).toBeCloseTo(0.9);
    expect(resumen.conGmd).toBe(2);
  });

  it("is zero, with no averages, for an empty herd", () => {
    expect(resumenDelRodeo([])).toEqual({
      cabezas: 0,
      conAlertas: 0,
      alertas: 0,
      lotes: 0,
      pesoPromedio: null,
      conPeso: 0,
      gmdPromedio: null,
      conGmd: 0,
    });
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

describe("tarjetasDelRodeo", () => {
  const vacio = resumenDelRodeo([]);

  it("describes the whole herd by its active lots", () => {
    const [total] = tarjetasDelRodeo({ ...vacio, cabezas: 9, lotes: 3 }, null);
    expect(total).toEqual({ etiqueta: "Total animales", valor: "9", detalle: "3 lotes activos" });
  });

  it("names the lot when the tiles are about one lot", () => {
    const [total] = tarjetasDelRodeo({ ...vacio, cabezas: 3, lotes: 1 }, "A-12");
    expect(total?.detalle).toBe("Lote A-12");
  });

  it("shows the average weight and how many animals it comes from", () => {
    const [, peso] = tarjetasDelRodeo({ ...vacio, pesoPromedio: 412.4, conPeso: 1 }, null);
    expect(peso).toEqual({ etiqueta: "Peso promedio", valor: "412 kg", detalle: "Último pesaje de 1 animal" });
  });

  it("shows the average GMD with two decimals", () => {
    const [, , gmd] = tarjetasDelRodeo({ ...vacio, gmdPromedio: 0.845, conGmd: 4 }, null);
    expect(gmd).toEqual({
      etiqueta: "GMD promedio",
      valor: "0,85 kg/día",
      detalle: "4 animales con dos pesajes o más",
    });
  });

  it("explains the empty averages instead of showing zero", () => {
    const [, peso, gmd] = tarjetasDelRodeo(vacio, null);
    expect(peso).toMatchObject({ valor: "—", detalle: "Todavía sin pesajes" });
    expect(gmd).toMatchObject({ valor: "—", detalle: "Hace falta un segundo pesaje" });
  });

  it("counts the active alerts and the animals that have them", () => {
    const [, , , alertas] = tarjetasDelRodeo({ ...vacio, alertas: 3, conAlertas: 2 }, null);
    expect(alertas).toEqual({ etiqueta: "Alertas activas", valor: "3", detalle: "En 2 animales" });
    expect(tarjetasDelRodeo(vacio, null)[3]?.detalle).toBe("Ninguna pendiente");
  });
});
