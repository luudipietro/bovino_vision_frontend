import { describe, expect, it } from "vitest";
import { estadoDeCaptura } from "./estadoCaptura";

describe("estadoDeCaptura", () => {
  it("names every state of the capture with a badge tone", () => {
    expect(estadoDeCaptura("registrada")).toEqual({ texto: "Sin procesar", tono: "neutral" });
    expect(estadoDeCaptura("pendiente")).toEqual({ texto: "Estimando", tono: "warning" });
    expect(estadoDeCaptura("procesando")).toEqual({ texto: "Estimando", tono: "warning" });
    expect(estadoDeCaptura("procesada")).toEqual({ texto: "Pesada", tono: "brand" });
    expect(estadoDeCaptura("fallida")).toEqual({ texto: "Falló", tono: "danger" });
  });
});
