import { describe, expect, it } from "vitest";
import { alternarPermiso, hayCambiosDePermisos } from "./permisosRol";

describe("alternarPermiso", () => {
  it("adds a permission that was not selected and removes one that was", () => {
    expect(alternarPermiso(["rodeo_consultar"], "analitica_consultar")).toEqual([
      "rodeo_consultar",
      "analitica_consultar",
    ]);
    expect(alternarPermiso(["rodeo_consultar", "analitica_consultar"], "rodeo_consultar")).toEqual([
      "analitica_consultar",
    ]);
  });

  it("does not mutate the original list", () => {
    const original = ["rodeo_consultar"] as const;
    alternarPermiso([...original], "analitica_consultar");
    expect(original).toEqual(["rodeo_consultar"]);
  });
});

describe("hayCambiosDePermisos", () => {
  it("ignores order", () => {
    expect(hayCambiosDePermisos(["a", "b"], ["b", "a"])).toBe(false);
  });

  it("detects added and removed permissions", () => {
    expect(hayCambiosDePermisos(["a"], ["a", "b"])).toBe(true);
    expect(hayCambiosDePermisos(["a", "b"], ["a"])).toBe(true);
    expect(hayCambiosDePermisos(["a"], ["b"])).toBe(true);
  });
});
