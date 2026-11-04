import { describe, expect, it } from "vitest";
import type { Rol, Usuario } from "../../api/tipos";
import { contarPorRol, estadoDeUsuario, filtrarPorRol, textoUltimoAcceso } from "./listaUsuarios";

function usuario(parcial: Partial<Usuario> & { id: string; id_rol: string }): Usuario {
  return {
    nombre: "Nombre",
    correo: "a@b.com",
    rol: "Rol",
    activo: true,
    bloqueado_hasta: null,
    ultimo_acceso: null,
    ...parcial,
  };
}

const roles: Rol[] = [
  { id: "r-admin", nombre: "Administrador", permisos: [], cantidad_usuarios: 1 },
  { id: "r-op", nombre: "Operario", permisos: [], cantidad_usuarios: 2 },
  { id: "r-vet", nombre: "Veterinario", permisos: [], cantidad_usuarios: 0 },
];

const usuarios: Usuario[] = [
  usuario({ id: "u1", id_rol: "r-admin" }),
  usuario({ id: "u2", id_rol: "r-op" }),
  usuario({ id: "u3", id_rol: "r-op", activo: false }),
];

describe("contarPorRol", () => {
  it("counts every listed user in the total and per role, keeping the role order and empty roles", () => {
    expect(contarPorRol(usuarios, roles)).toEqual({
      total: 3,
      porRol: [
        { id: "r-admin", nombre: "Administrador", cantidad: 1 },
        { id: "r-op", nombre: "Operario", cantidad: 2 },
        { id: "r-vet", nombre: "Veterinario", cantidad: 0 },
      ],
    });
  });
});

describe("filtrarPorRol", () => {
  it("keeps only the users of the chosen role", () => {
    expect(filtrarPorRol(usuarios, "r-op").map((u) => u.id)).toEqual(["u2", "u3"]);
  });

  it("returns every user when no role is chosen", () => {
    expect(filtrarPorRol(usuarios, "")).toHaveLength(3);
  });
});

describe("estadoDeUsuario", () => {
  const ahora = new Date(2026, 9, 24, 12, 0).getTime();

  it("is active by default", () => {
    expect(estadoDeUsuario(usuario({ id: "u", id_rol: "r" }), ahora)).toBe("activo");
  });

  it("is inactive when the user was deactivated, even with a lock", () => {
    const futuro = new Date(2026, 9, 24, 13, 0).toISOString();
    expect(estadoDeUsuario(usuario({ id: "u", id_rol: "r", activo: false, bloqueado_hasta: futuro }), ahora)).toBe(
      "inactivo",
    );
  });

  it("is blocked only while bloqueado_hasta is in the future", () => {
    const futuro = new Date(2026, 9, 24, 12, 5).toISOString();
    const pasado = new Date(2026, 9, 24, 11, 55).toISOString();
    expect(estadoDeUsuario(usuario({ id: "u", id_rol: "r", bloqueado_hasta: futuro }), ahora)).toBe("bloqueado");
    expect(estadoDeUsuario(usuario({ id: "u", id_rol: "r", bloqueado_hasta: pasado }), ahora)).toBe("activo");
  });
});

describe("textoUltimoAcceso", () => {
  const ahora = new Date(2026, 9, 24, 12, 0);

  it("says the user never logged in when there is no date", () => {
    expect(textoUltimoAcceso(null, ahora)).toBe("Nunca ingresó");
  });

  it("says today and the time for a login of the same calendar day", () => {
    expect(textoUltimoAcceso(new Date(2026, 9, 24, 8, 10).toISOString(), ahora)).toBe("Último acceso hoy 08:10");
  });

  it("says yesterday and the time for a login of the previous calendar day", () => {
    expect(textoUltimoAcceso(new Date(2026, 9, 23, 17, 35).toISOString(), ahora)).toBe("Último acceso ayer 17:35");
  });

  it("uses the full date for older logins", () => {
    expect(textoUltimoAcceso(new Date(2026, 9, 20, 9, 5).toISOString(), ahora)).toBe(
      "Último acceso 20/10/2026, 09:05",
    );
  });
});
