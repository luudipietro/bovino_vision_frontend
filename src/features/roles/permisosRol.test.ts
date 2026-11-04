import { describe, expect, it } from "vitest";
import type { Permiso } from "../../api/tipos";
import { agruparPermisos, alternarPermiso, hayCambiosDePermisos } from "./permisosRol";

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

describe("agruparPermisos", () => {
  const catalogo: Permiso[] = [
    { codigo: "auditoria_consultar", descripcion: "Consultar la auditoría" },
    { codigo: "roles_gestionar", descripcion: "Gestionar roles y permisos" },
    { codigo: "rodeo_consultar", descripcion: "Consultar animales" },
    { codigo: "capturas_registrar", descripcion: "Registrar capturas y pesajes" },
    { codigo: "usuarios_gestionar", descripcion: "Gestionar usuarios" },
    { codigo: "analitica_consultar", descripcion: "Consultar alertas" },
    { codigo: "rodeo_gestionar", descripcion: "Modificar animales" },
  ];

  it("splits the catalog into the two groups in a fixed order", () => {
    const grupos = agruparPermisos(catalogo);
    expect(grupos.map((g) => g.titulo)).toEqual(["Ganadería y campo", "Administración"]);
    expect(grupos[0]?.permisos.map((p) => p.codigo)).toEqual(["capturas_registrar", "rodeo_gestionar", "rodeo_consultar"]);
    expect(grupos[1]?.permisos.map((p) => p.codigo)).toEqual([
      "analitica_consultar",
      "usuarios_gestionar",
      "roles_gestionar",
      "auditoria_consultar",
    ]);
  });

  it("marks only roles_gestionar as critical", () => {
    const todos = agruparPermisos(catalogo).flatMap((g) => g.permisos);
    expect(todos.filter((p) => p.critico).map((p) => p.codigo)).toEqual(["roles_gestionar"]);
  });

  it("gives every permission a short name and description", () => {
    const todos = agruparPermisos(catalogo).flatMap((g) => g.permisos);
    expect(todos).toHaveLength(7);
    for (const permiso of todos) {
      expect(permiso.nombre.length).toBeGreaterThan(0);
      expect(permiso.descripcion.length).toBeGreaterThan(0);
    }
  });

  it("skips groups with no permissions and keeps unknown codes in Administración with the API text", () => {
    const desconocido = { codigo: "nuevo_permiso", descripcion: "Algo nuevo" } as unknown as Permiso;
    const grupos = agruparPermisos([desconocido]);
    expect(grupos).toHaveLength(1);
    expect(grupos[0]?.titulo).toBe("Administración");
    expect(grupos[0]?.permisos[0]).toMatchObject({ codigo: "nuevo_permiso", nombre: "Algo nuevo", critico: false });
  });
});
