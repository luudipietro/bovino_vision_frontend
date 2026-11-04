import { describe, expect, it } from "vitest";
import { etiquetaDeConexion } from "./conexion";

describe("etiquetaDeConexion", () => {
  it("names the connection state for the home pill", () => {
    expect(etiquetaDeConexion(true)).toBe("En línea");
    expect(etiquetaDeConexion(false)).toBe("Sin conexión");
  });
});
