import { describe, expect, it } from "vitest";
import { permisoDeRuta, puedeAcceder, rutaDeInicio, seccionesPermitidas } from "./permisos";

describe("seccionesPermitidas", () => {
  it("shows only the sections enabled by the permissions, in menu order", () => {
    expect(seccionesPermitidas(["rodeo_consultar", "analitica_consultar"]).map((s) => s.to)).toEqual([
      "/animales",
      "/lotes",
      "/panel",
      "/alertas",
    ]);
    expect(seccionesPermitidas(["capturas_registrar"]).map((s) => s.to)).toEqual(["/captura"]);
    expect(seccionesPermitidas(["usuarios_gestionar", "roles_gestionar"]).map((s) => s.to)).toEqual([
      "/usuarios",
      "/roles",
    ]);
  });

  it("is empty without permissions and ignores permissions that enable no section", () => {
    expect(seccionesPermitidas([])).toEqual([]);
    expect(seccionesPermitidas(["rodeo_gestionar", "auditoria_consultar"])).toEqual([]);
  });
});

describe("permisoDeRuta", () => {
  it("maps each route, including nested ones, to its permission", () => {
    expect(permisoDeRuta("/captura")).toBe("capturas_registrar");
    expect(permisoDeRuta("/animales")).toBe("rodeo_consultar");
    expect(permisoDeRuta("/animales/abc-123")).toBe("rodeo_consultar");
    expect(permisoDeRuta("/lotes")).toBe("rodeo_consultar");
    expect(permisoDeRuta("/panel")).toBe("analitica_consultar");
    expect(permisoDeRuta("/alertas")).toBe("analitica_consultar");
    expect(permisoDeRuta("/usuarios")).toBe("usuarios_gestionar");
    expect(permisoDeRuta("/roles")).toBe("roles_gestionar");
  });

  it("does not match routes that only share a prefix, and has none for unknown paths", () => {
    expect(permisoDeRuta("/animalesx")).toBeNull();
    expect(permisoDeRuta("/")).toBeNull();
    expect(permisoDeRuta("/otra")).toBeNull();
  });
});

describe("puedeAcceder", () => {
  it("requires the permission of the route", () => {
    expect(puedeAcceder(["rodeo_consultar"], "/animales/abc")).toBe(true);
    expect(puedeAcceder(["rodeo_consultar"], "/panel")).toBe(false);
    expect(puedeAcceder([], "/captura")).toBe(false);
  });

  it("lets through the root and unknown paths so they can redirect", () => {
    expect(puedeAcceder([], "/")).toBe(true);
    expect(puedeAcceder(["rodeo_consultar"], "/otra")).toBe(true);
  });
});

describe("rutaDeInicio", () => {
  it("follows the priority list", () => {
    expect(rutaDeInicio(["rodeo_consultar", "capturas_registrar", "analitica_consultar"])).toBe("/captura");
    expect(rutaDeInicio(["rodeo_consultar", "analitica_consultar"])).toBe("/panel");
    expect(rutaDeInicio(["roles_gestionar", "rodeo_consultar"])).toBe("/animales");
    expect(rutaDeInicio(["roles_gestionar", "usuarios_gestionar"])).toBe("/usuarios");
    expect(rutaDeInicio(["roles_gestionar"])).toBe("/roles");
  });

  it("is null when no permission gives a screen", () => {
    expect(rutaDeInicio([])).toBeNull();
    expect(rutaDeInicio(["rodeo_gestionar"])).toBeNull();
  });
});
