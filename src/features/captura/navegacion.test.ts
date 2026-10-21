import { describe, expect, it } from "vitest";
import { retrocesoDesde } from "./navegacion";

describe("retrocesoDesde", () => {
  it("has no previous step from the first one", () => {
    expect(retrocesoDesde("identificar", false)).toBeNull();
  });

  it("goes from the photo step back to identifying the animal", () => {
    expect(retrocesoDesde("foto", false)).toMatchObject({
      destino: "identificar",
      descartarFoto: false,
      avisarSegundoPlano: false,
    });
  });

  it("discards the registered photo when leaving the photo step", () => {
    expect(retrocesoDesde("foto", true)).toMatchObject({ destino: "identificar", descartarFoto: true });
  });

  it("goes from estimating back to the photo and warns that the estimation continues", () => {
    expect(retrocesoDesde("procesando", true)).toMatchObject({
      destino: "foto",
      descartarFoto: false,
      avisarSegundoPlano: true,
    });
  });

  it("goes from the result back to the photo without touching the weighing", () => {
    expect(retrocesoDesde("resultado", true)).toMatchObject({
      destino: "foto",
      descartarFoto: false,
      avisarSegundoPlano: false,
    });
  });
});
