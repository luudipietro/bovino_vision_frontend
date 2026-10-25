import { describe, expect, it } from "vitest";
import type { Usuario } from "../../api/tipos";
import { cambiosDeUsuario, formularioDeUsuario, nuevoUsuarioDesde } from "./formularioUsuario";

const usuario: Usuario = {
  id: "u1",
  nombre: "Ana Pérez",
  correo: "ana@campo.com",
  id_rol: "r1",
  rol: "Operario de Campo",
  activo: true,
  bloqueado_hasta: null,
  ultimo_acceso: null,
};

describe("nuevoUsuarioDesde", () => {
  it("trims the texts and builds the request body", () => {
    expect(
      nuevoUsuarioDesde({ nombre: " Ana ", correo: " ana@campo.com ", contrasena: "12345678", idRol: "r1" }),
    ).toEqual({ usuario: { nombre: "Ana", correo: "ana@campo.com", contrasena: "12345678", id_rol: "r1" } });
  });

  it("rejects a password shorter than 8 characters with the API message", () => {
    expect(nuevoUsuarioDesde({ nombre: "Ana", correo: "a@b.com", contrasena: "1234567", idRol: "r1" })).toEqual({
      error: "La contraseña debe tener al menos 8 caracteres",
    });
  });

  it("requires name, email and role", () => {
    expect(nuevoUsuarioDesde({ nombre: " ", correo: "a@b.com", contrasena: "12345678", idRol: "r1" })).toEqual({
      error: "Ingresá el nombre",
    });
    expect(nuevoUsuarioDesde({ nombre: "Ana", correo: "", contrasena: "12345678", idRol: "r1" })).toEqual({
      error: "Ingresá el correo",
    });
    expect(nuevoUsuarioDesde({ nombre: "Ana", correo: "a@b.com", contrasena: "12345678", idRol: "" })).toEqual({
      error: "Elegí un rol",
    });
  });
});

describe("cambiosDeUsuario", () => {
  it("starts with the stored name and email and an empty password", () => {
    expect(formularioDeUsuario(usuario)).toEqual({
      nombre: "Ana Pérez",
      correo: "ana@campo.com",
      contrasena: "",
      idRol: "r1",
    });
  });

  it("only sends the fields that changed", () => {
    expect(cambiosDeUsuario(usuario, { ...formularioDeUsuario(usuario), nombre: "Ana P." })).toEqual({
      cambios: { nombre: "Ana P." },
    });
    expect(cambiosDeUsuario(usuario, { ...formularioDeUsuario(usuario), correo: " nuevo@campo.com " })).toEqual({
      cambios: { correo: "nuevo@campo.com" },
    });
    expect(cambiosDeUsuario(usuario, formularioDeUsuario(usuario))).toEqual({ cambios: {} });
  });

  it("sends the password only when one was typed and validates its length", () => {
    expect(cambiosDeUsuario(usuario, { ...formularioDeUsuario(usuario), contrasena: "nueva-clave" })).toEqual({
      cambios: { contrasena: "nueva-clave" },
    });
    expect(cambiosDeUsuario(usuario, { ...formularioDeUsuario(usuario), contrasena: "corta" })).toEqual({
      error: "La contraseña debe tener al menos 8 caracteres",
    });
  });

  it("keeps the stored value when a name or email is emptied", () => {
    expect(cambiosDeUsuario(usuario, { ...formularioDeUsuario(usuario), nombre: " ", correo: "" })).toEqual({
      cambios: {},
    });
  });
});
