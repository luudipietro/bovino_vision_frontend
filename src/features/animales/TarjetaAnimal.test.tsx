import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import type { Animal } from "../../api/tipos";
import TarjetaAnimal from "./TarjetaAnimal";

const animal: Animal = {
  id: "a1",
  identificador: "AR-1042",
  id_establecimiento: "e1",
  id_lote: "l1",
  lote_codigo: "A-12",
  id_raza: "r1",
  raza: "Aberdeen Angus",
  sexo: "macho",
  fecha_nacimiento: "2024-03-15",
  ultimo_peso_kg: 400,
  gmd_kg_dia: null,
  alertas_activas: 0,
  id_imagen_ultimo_pesaje: "img-1",
};

function renderizar(datos: Animal): string {
  return renderToString(
    <MemoryRouter>
      <TarjetaAnimal animal={datos} lote={null} />
    </MemoryRouter>,
  );
}

describe("TarjetaAnimal", () => {
  it("shows the photo of the latest weighing", () => {
    const html = renderizar(animal);
    expect(html).toContain("/imagenes/img-1");
    expect(html).toContain('alt="Foto de AR-1042"');
  });

  it("shows a placeholder instead of a photo when the animal was never weighed", () => {
    const html = renderizar({ ...animal, id_imagen_ultimo_pesaje: null, ultimo_peso_kg: null });
    expect(html).not.toContain("/imagenes/");
    expect(html).toContain('aria-label="Sin foto: todavía no se pesó"');
  });

  it("bounds both the photo and placeholder to a compact preview", () => {
    for (const idImagen of ["img-1", null]) {
      const html = renderizar({ ...animal, id_imagen_ultimo_pesaje: idImagen });
      expect(html).toContain('class="relative h-36 shrink-0 overflow-hidden bg-green-900"');
      expect(html).not.toContain("aspect-[16/9]");
      expect(html).toContain('href="/animales/a1"');
      expect(html).toContain("AR-1042");
      expect(html).toContain("Lote A-12");
    }
  });

  it("keeps the lot on top of the photo", () => {
    expect(renderizar(animal)).toContain("Lote A-12");
  });
});
