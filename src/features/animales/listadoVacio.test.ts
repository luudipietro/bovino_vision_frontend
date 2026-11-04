import { describe, expect, it } from "vitest";
import { motivoDeListadoVacio } from "./listadoVacio";

const sinFiltros = { busqueda: "", idLote: null, conAlertasActivas: false };

describe("motivoDeListadoVacio", () => {
  it("offers to remove the filters when a search text is set", () => {
    expect(motivoDeListadoVacio({ ...sinFiltros, busqueda: "zzz" })).toBe("con_filtros");
  });

  it("offers to remove the filters when a lot is chosen", () => {
    expect(motivoDeListadoVacio({ ...sinFiltros, idLote: "l1" })).toBe("con_filtros");
  });

  it("offers to remove the filters when only the active alerts filter is on", () => {
    expect(motivoDeListadoVacio({ ...sinFiltros, conAlertasActivas: true })).toBe("con_filtros");
  });

  it("offers to register an animal when no filter is set, i.e. the herd is really empty", () => {
    expect(motivoDeListadoVacio(sinFiltros)).toBe("sin_animales");
  });

  it("does not count a search of only spaces as a filter", () => {
    expect(motivoDeListadoVacio({ ...sinFiltros, busqueda: "   " })).toBe("sin_animales");
  });
});
