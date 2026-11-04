import { afterEach, describe, expect, it, vi } from "vitest";
import { reducirFoto } from "./reducirFoto";

function fotoDe(tipo: string, nombre: string) {
  return new File(["contenido"], nombre, { type: tipo, lastModified: 1_700_000_000_000 });
}

function stubDecodificacion(ancho: number, alto: number) {
  const imagen = { width: ancho, height: alto, close: vi.fn() };
  const crear = vi.fn().mockResolvedValue(imagen);
  vi.stubGlobal("createImageBitmap", crear);
  return { imagen, crear };
}

function stubLienzo(jpeg: Blob | null) {
  const contexto = { drawImage: vi.fn() };
  const lienzo = {
    width: 0,
    height: 0,
    getContext: vi.fn().mockReturnValue(contexto),
    toBlob: vi.fn((devolver: (blob: Blob | null) => void) => devolver(jpeg)),
  };
  vi.stubGlobal("document", { createElement: vi.fn().mockReturnValue(lienzo) });
  return { lienzo, contexto };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("reducirFoto", () => {
  it("decodes with the EXIF orientation and re-encodes a large photo as an upright 1600 px JPEG at 0.85", async () => {
    const { imagen, crear } = stubDecodificacion(4000, 3000);
    const { lienzo, contexto } = stubLienzo(new Blob(["jpeg"], { type: "image/jpeg" }));
    const original = fotoDe("image/jpeg", "IMG_1.jpeg");

    const resultado = await reducirFoto(original);

    expect(crear).toHaveBeenCalledWith(original, { imageOrientation: "from-image" });
    expect([lienzo.width, lienzo.height]).toEqual([1600, 1200]);
    expect(contexto.drawImage).toHaveBeenCalledWith(imagen, 0, 0, 1600, 1200);
    expect(lienzo.toBlob).toHaveBeenCalledWith(expect.any(Function), "image/jpeg", 0.85);
    expect(resultado).not.toBe(original);
    expect(resultado.type).toBe("image/jpeg");
    expect(resultado.name).toBe("IMG_1.jpg");
    expect(imagen.close).toHaveBeenCalled();
  });

  it("returns the very same file when it is a JPEG that already fits", async () => {
    const { imagen } = stubDecodificacion(1200, 900);
    const original = fotoDe("image/jpeg", "IMG_2.jpg");

    await expect(reducirFoto(original)).resolves.toBe(original);
    expect(imagen.close).toHaveBeenCalled();
  });

  it("falls back to the original when the browser cannot decode the photo", async () => {
    vi.stubGlobal("createImageBitmap", vi.fn().mockRejectedValue(new Error("unsupported")));
    const original = fotoDe("image/heic", "IMG_3.heic");

    await expect(reducirFoto(original)).resolves.toBe(original);
  });

  it("falls back to the original when the canvas produces no JPEG", async () => {
    const { imagen } = stubDecodificacion(4000, 3000);
    stubLienzo(null);
    const original = fotoDe("image/jpeg", "IMG_4.jpg");

    await expect(reducirFoto(original)).resolves.toBe(original);
    expect(imagen.close).toHaveBeenCalled();
  });
});
