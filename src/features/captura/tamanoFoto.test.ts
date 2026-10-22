import { describe, expect, it } from "vitest";
import { CALIDAD_JPEG, LADO_MAYOR_MAXIMO, nombreJpeg, planDeReduccion } from "./tamanoFoto";

describe("tamanoFoto", () => {
  it("keeps the 1600 px limit and the 0.85 quality in single constants", () => {
    expect(LADO_MAYOR_MAXIMO).toBe(1600);
    expect(CALIDAD_JPEG).toBe(0.85);
  });
});

describe("planDeReduccion", () => {
  it("scales a landscape photo so its longest side is 1600 px", () => {
    expect(planDeReduccion("image/jpeg", 4000, 3000)).toEqual({ accion: "recodificar", ancho: 1600, alto: 1200 });
  });

  it("scales a portrait photo by its height, not its width", () => {
    expect(planDeReduccion("image/jpeg", 3000, 4000)).toEqual({ accion: "recodificar", ancho: 1200, alto: 1600 });
  });

  it("rounds the shorter side to whole pixels", () => {
    expect(planDeReduccion("image/jpeg", 4032, 3024)).toEqual({ accion: "recodificar", ancho: 1600, alto: 1200 });
    expect(planDeReduccion("image/jpeg", 5000, 3333)).toEqual({ accion: "recodificar", ancho: 1600, alto: 1067 });
  });

  it("never collapses an extreme panorama to zero pixels", () => {
    expect(planDeReduccion("image/jpeg", 40000, 10)).toEqual({ accion: "recodificar", ancho: 1600, alto: 1 });
  });

  it("uploads a JPEG that already fits as it is", () => {
    expect(planDeReduccion("image/jpeg", 1600, 1200)).toEqual({ accion: "conservar" });
    expect(planDeReduccion("image/jpeg", 800, 600)).toEqual({ accion: "conservar" });
  });

  it("re-encodes a small PNG as JPEG without resizing it", () => {
    expect(planDeReduccion("image/png", 800, 600)).toEqual({ accion: "recodificar", ancho: 800, alto: 600 });
  });

  it("re-encodes any other format, scaling it when it is too large", () => {
    expect(planDeReduccion("image/webp", 3200, 2400)).toEqual({ accion: "recodificar", ancho: 1600, alto: 1200 });
  });
});

describe("nombreJpeg", () => {
  it("swaps the extension for .jpg", () => {
    expect(nombreJpeg("IMG_0042.PNG")).toBe("IMG_0042.jpg");
    expect(nombreJpeg("vaca.2026.webp")).toBe("vaca.2026.jpg");
  });

  it("appends .jpg when there is no extension", () => {
    expect(nombreJpeg("foto")).toBe("foto.jpg");
  });
});
