import { describe, expect, it, vi } from "vitest";
import type { Captura, EstadoCaptura, Pesaje } from "../../api/tipos";
import { esperarResultado } from "./esperarResultado";

function captura(estado: EstadoCaptura, cambios: Partial<Captura> = {}): Captura {
  return {
    id: "c1",
    id_sesion: "s1",
    id_animal: "a1",
    fecha_captura: "2026-10-11T13:00:00+00:00",
    estado,
    motivo_fallo: null,
    intentos: 0,
    fecha_revision: null,
    id_evento_pesaje: null,
    ...cambios,
  };
}

const pesaje = { id: "e1", peso_kg: 400 } as Pesaje;

function dependencias(estados: Captura[], vigente: () => boolean = () => true) {
  const pendientes = [...estados];
  return {
    obtenerCaptura: vi.fn(async () => pendientes.shift() ?? estados[estados.length - 1]!),
    obtenerPesaje: vi.fn(async () => pesaje),
    esperar: vi.fn(async () => {}),
    sigueVigente: vi.fn(vigente),
    alActualizar: vi.fn(),
  };
}

describe("esperarResultado", () => {
  it("polls until the capture is processed and then reads its weighing event", async () => {
    const procesada = captura("procesada", { intentos: 1, id_evento_pesaje: "e1" });
    const deps = dependencias([captura("pendiente"), captura("procesando", { intentos: 1 }), procesada]);

    const resultado = await esperarResultado("c1", deps);

    expect(resultado).toEqual({ tipo: "estimado", captura: procesada, pesaje });
    expect(deps.obtenerCaptura).toHaveBeenCalledTimes(3);
    expect(deps.obtenerCaptura).toHaveBeenCalledWith("c1");
    expect(deps.esperar).toHaveBeenCalledTimes(2);
    expect(deps.obtenerPesaje).toHaveBeenCalledWith("e1");
    expect(deps.alActualizar.mock.calls.map(([c]) => (c as Captura).estado)).toEqual([
      "pendiente",
      "procesando",
      "procesada",
    ]);
  });

  it("returns the failure without reading any weighing event", async () => {
    const fallida = captura("fallida", { motivo_fallo: "Animal no detectable" });
    const deps = dependencias([fallida]);

    await expect(esperarResultado("c1", deps)).resolves.toEqual({ tipo: "fallido", captura: fallida });
    expect(deps.obtenerPesaje).not.toHaveBeenCalled();
    expect(deps.esperar).not.toHaveBeenCalled();
  });

  it("stops without a result or further requests once it is no longer current", async () => {
    let vigente = true;
    const deps = dependencias([captura("pendiente")], () => vigente);
    deps.esperar.mockImplementation(async () => {
      vigente = false;
    });

    await expect(esperarResultado("c1", deps)).resolves.toBeNull();
    expect(deps.obtenerCaptura).toHaveBeenCalledTimes(1);
    expect(deps.alActualizar).toHaveBeenCalledTimes(1);
  });

  it("ignores a response that arrives after it stopped being current", async () => {
    let vigente = true;
    const deps = dependencias([captura("procesada", { id_evento_pesaje: "e1" })], () => vigente);
    deps.obtenerCaptura.mockImplementation(async () => {
      vigente = false;
      return captura("procesada", { id_evento_pesaje: "e1" });
    });

    await expect(esperarResultado("c1", deps)).resolves.toBeNull();
    expect(deps.alActualizar).not.toHaveBeenCalled();
    expect(deps.obtenerPesaje).not.toHaveBeenCalled();
  });

  it("propagates request errors to the caller", async () => {
    const deps = dependencias([]);
    deps.obtenerCaptura.mockRejectedValue(new Error("sin conexión"));

    await expect(esperarResultado("c1", deps)).rejects.toThrow("sin conexión");
  });
});
