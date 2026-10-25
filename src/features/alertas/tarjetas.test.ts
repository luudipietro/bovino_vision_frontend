import { describe, expect, it } from "vitest";
import type { Alerta } from "../../api/tipos";
import { alertasDestacadas, puedeResolverAlertas, textoVerAlertas } from "./tarjetas";

const base: Alerta = {
  id: "a",
  id_evento: "e",
  id_animal: "an",
  animal_identificador: "AR-1",
  tipo: "estancamiento",
  prioridad: 2,
  variacion: 0.1,
  gmd_esperada: 0.8,
  estado: "activa",
  fecha_generacion: "2026-05-24T10:00:00Z",
};
const alerta = (id: string, prioridad: number, fecha: string): Alerta => ({
  ...base,
  id,
  prioridad,
  fecha_generacion: fecha,
});

describe("puedeResolverAlertas", () => {
  it("needs the rodeo_gestionar permission", () => {
    expect(puedeResolverAlertas(["rodeo_gestionar", "analitica_consultar"])).toBe(true);
    expect(puedeResolverAlertas(["analitica_consultar"])).toBe(false);
    expect(puedeResolverAlertas([])).toBe(false);
  });
});

describe("alertasDestacadas", () => {
  it("puts the most urgent first, then the most recent, and keeps only the limit", () => {
    const todas = [
      alerta("vieja-media", 2, "2026-05-20T10:00:00Z"),
      alerta("nueva-media", 2, "2026-05-24T10:00:00Z"),
      alerta("alta", 1, "2026-05-01T10:00:00Z"),
      alerta("baja", 3, "2026-05-25T10:00:00Z"),
    ];
    expect(alertasDestacadas(todas, 3).map((a) => a.id)).toEqual(["alta", "nueva-media", "vieja-media"]);
  });

  it("does not reorder the original list", () => {
    const todas = [alerta("b", 2, "2026-05-20T10:00:00Z"), alerta("a", 1, "2026-05-20T10:00:00Z")];
    alertasDestacadas(todas, 3);
    expect(todas.map((a) => a.id)).toEqual(["b", "a"]);
  });
});

describe("textoVerAlertas", () => {
  it("counts the alerts with the right plural", () => {
    expect(textoVerAlertas(12)).toBe("Ver las 12 alertas");
    expect(textoVerAlertas(1)).toBe("Ver la alerta");
  });
});
