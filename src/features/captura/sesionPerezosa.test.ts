import { describe, expect, it, vi } from "vitest";
import type { SesionCaptura } from "../../api/tipos";
import { crearSesionPerezosa } from "./sesionPerezosa";

function sesion(id: string): SesionCaptura {
  return { id, id_usuario: "u1", fecha_inicio: "2026-10-26T20:00:00Z", fecha_fin: null, estado: "activa" };
}

function dependencias() {
  let numero = 0;
  return {
    iniciar: vi.fn(async () => sesion(`s${++numero}`)),
    finalizar: vi.fn(async () => {}),
  };
}

describe("crearSesionPerezosa", () => {
  it("does not start a session until a photo asks for it", () => {
    const deps = dependencias();
    const perezosa = crearSesionPerezosa(deps);

    expect(perezosa.id()).toBeNull();
    expect(deps.iniciar).not.toHaveBeenCalled();
  });

  it("starts the session once and reuses it, even for concurrent requests", async () => {
    const deps = dependencias();
    const perezosa = crearSesionPerezosa(deps);

    const [primera, segunda] = await Promise.all([perezosa.obtener(), perezosa.obtener()]);
    const tercera = await perezosa.obtener();

    expect([primera, segunda, tercera]).toEqual(["s1", "s1", "s1"]);
    expect(perezosa.id()).toBe("s1");
    expect(deps.iniciar).toHaveBeenCalledTimes(1);
  });

  it("closing without a started session finalizes nothing", async () => {
    const deps = dependencias();

    await crearSesionPerezosa(deps).cerrar();

    expect(deps.finalizar).not.toHaveBeenCalled();
  });

  it("closing finalizes the session only once", async () => {
    const deps = dependencias();
    const perezosa = crearSesionPerezosa(deps);
    await perezosa.obtener();

    await perezosa.cerrar();
    await perezosa.cerrar();

    expect(deps.finalizar).toHaveBeenCalledTimes(1);
    expect(deps.finalizar).toHaveBeenCalledWith("s1");
    expect(perezosa.id()).toBeNull();
  });

  it("closing waits for a session still being started and finalizes it", async () => {
    const deps = dependencias();
    const perezosa = crearSesionPerezosa(deps);
    const pedida = perezosa.obtener();

    await perezosa.cerrar();

    expect(await pedida).toBe("s1");
    expect(deps.finalizar).toHaveBeenCalledWith("s1");
    expect(perezosa.id()).toBeNull();
  });

  it("after closing, the next photo starts a new session", async () => {
    const deps = dependencias();
    const perezosa = crearSesionPerezosa(deps);
    await perezosa.obtener();
    await perezosa.cerrar();

    expect(await perezosa.obtener()).toBe("s2");
  });

  it("a failed start leaves no session and can be retried", async () => {
    const deps = dependencias();
    deps.iniciar.mockRejectedValueOnce(new Error("sin conexión"));
    const perezosa = crearSesionPerezosa(deps);

    await expect(perezosa.obtener()).rejects.toThrow("sin conexión");
    expect(perezosa.id()).toBeNull();
    expect(await perezosa.obtener()).toBe("s1");
  });
});
