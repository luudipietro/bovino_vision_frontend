import { describe, expect, it } from "vitest";
import { idAnimalDeConsulta, rutaDeCapturaParaAnimal, rutaDeSesion } from "./rutaDeCaptura";

describe("rutaDeCapturaParaAnimal", () => {
  it("opens the capture page with the animal in the `animal` query parameter", () => {
    expect(rutaDeCapturaParaAnimal("3f2b8c1e-7d4a-4c55-9a10-0b6e2d8f4a11")).toBe(
      "/captura?animal=3f2b8c1e-7d4a-4c55-9a10-0b6e2d8f4a11",
    );
  });
});

describe("idAnimalDeConsulta", () => {
  it("reads the animal id the link carries", () => {
    const ruta = rutaDeCapturaParaAnimal("a b/c");

    expect(idAnimalDeConsulta(new URLSearchParams(ruta.split("?")[1]))).toBe("a b/c");
  });

  it("is null without the parameter or with an empty one", () => {
    expect(idAnimalDeConsulta(new URLSearchParams(""))).toBeNull();
    expect(idAnimalDeConsulta(new URLSearchParams("animal="))).toBeNull();
    expect(idAnimalDeConsulta(new URLSearchParams("animal=%20%20"))).toBeNull();
  });

  it("ignores other parameters", () => {
    expect(idAnimalDeConsulta(new URLSearchParams("otro=1&animal=a1"))).toBe("a1");
  });
});

describe("rutaDeSesion", () => {
  it("opens the detail of a capture session under /captura/sesiones", () => {
    expect(rutaDeSesion("3f2b8c1e-7d4a-4c55-9a10-0b6e2d8f4a11")).toBe(
      "/captura/sesiones/3f2b8c1e-7d4a-4c55-9a10-0b6e2d8f4a11",
    );
  });
});
