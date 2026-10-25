import { describe, expect, it } from "vitest";
import type { Animal } from "../../api/tipos";
import {
  cambiosDeAnimal,
  etiquetaDeSexo,
  formularioDesde,
  FORMULARIO_VACIO,
  nuevoAnimalDesde,
} from "./formularioAnimal";

const animal: Animal = {
  id: "a1",
  identificador: "AR001",
  id_establecimiento: "e1",
  id_lote: "l1",
  lote_codigo: "L1",
  id_raza: "r1",
  raza: "Angus",
  sexo: "hembra",
  fecha_nacimiento: "2025-03-10",
  ultimo_peso_kg: null,
  gmd_kg_dia: null,
  alertas_activas: 0,
  id_imagen_ultimo_pesaje: null,
};

describe("formularioDesde", () => {
  it("copies the editable data of the animal, using empty strings for missing values", () => {
    expect(formularioDesde(animal)).toEqual({
      idRaza: "r1",
      sexo: "hembra",
      fechaNacimiento: "2025-03-10",
      idLote: "l1",
    });
    expect(formularioDesde({ ...animal, id_raza: null, sexo: null, fecha_nacimiento: null, id_lote: null })).toEqual(
      FORMULARIO_VACIO,
    );
  });
});

describe("nuevoAnimalDesde", () => {
  it("trims the identifier and only sends the fields that were filled", () => {
    expect(nuevoAnimalDesde("  AR002 ", { ...FORMULARIO_VACIO, sexo: "macho", idLote: "l2" })).toEqual({
      identificador: "AR002",
      sexo: "macho",
      id_lote: "l2",
    });
  });
});

describe("cambiosDeAnimal", () => {
  it("only sends the fields that changed", () => {
    const formulario = { ...formularioDesde(animal), idRaza: "r2", idLote: "l3" };

    expect(cambiosDeAnimal(animal, formulario)).toEqual({ id_raza: "r2", id_lote: "l3" });
  });

  it("sends nothing when the form matches the animal", () => {
    expect(cambiosDeAnimal(animal, formularioDesde(animal))).toEqual({});
  });

  it("ignores emptied fields because the API keeps a value when it receives null", () => {
    const formulario = { ...formularioDesde(animal), sexo: "" as const, fechaNacimiento: "" };

    expect(cambiosDeAnimal(animal, formulario)).toEqual({});
  });

  it("fills data the animal did not have yet", () => {
    const sinDatos = { ...animal, sexo: null, fecha_nacimiento: null };
    const formulario = { ...formularioDesde(sinDatos), sexo: "macho" as const, fechaNacimiento: "2025-01-01" };

    expect(cambiosDeAnimal(sinDatos, formulario)).toEqual({ sexo: "macho", fecha_nacimiento: "2025-01-01" });
  });
});

describe("etiquetaDeSexo", () => {
  it("names both sexes in Spanish", () => {
    expect(etiquetaDeSexo("macho")).toBe("Macho");
    expect(etiquetaDeSexo("hembra")).toBe("Hembra");
  });
});
