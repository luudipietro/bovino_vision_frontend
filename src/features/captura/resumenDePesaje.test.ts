import { describe, expect, it } from "vitest";
import type { Animal, Pesaje } from "../../api/tipos";
import { resumirPesaje } from "./resumenDePesaje";

const ahora = new Date("2026-10-21T12:00:00");

const animal: Animal = {
  id: "a1",
  identificador: "AR001",
  id_establecimiento: "e1",
  id_lote: "l1",
  lote_codigo: "L1",
  id_raza: "r1",
  raza: "Angus",
  sexo: "hembra",
  fecha_nacimiento: "2024-07-10",
  ultimo_peso_kg: null,
  alertas_activas: 0,
};

const pesaje: Pesaje = {
  id: "p1",
  id_animal: "a1",
  id_captura: "c1",
  estado: "valido",
  peso_kg: 452.5,
  fecha_pesaje: "2026-10-21T14:30:00",
  version_modelo: "simulado-v1",
  id_imagen: "i1",
  animal_identificador: "AR001",
  lote_codigo: "L1",
  ultimo_peso_previo: { peso_kg: 440, fecha_pesaje: "2026-10-12T09:15:00" },
  alerta: null,
};

const alerta: NonNullable<Pesaje["alerta"]> = {
  id: "al1",
  id_evento: "p1",
  tipo: "perdida_peso",
  prioridad: 1,
  variacion: -0.4,
  gmd_esperada: null,
  version_regla: "v1",
  estado: "activa",
  fecha_generacion: "2026-10-21T14:30:00",
};

describe("resumirPesaje", () => {
  it("lists date and time, breed, sex, age and the previous weight with its date", () => {
    expect(resumirPesaje(pesaje, animal, ahora)).toEqual({
      detalles: [
        { etiqueta: "Fecha y hora", valor: "21/10/2026, 14:30" },
        { etiqueta: "Raza", valor: "Angus" },
        { etiqueta: "Sexo", valor: "Hembra" },
        { etiqueta: "Edad", valor: "2 años y 3 meses" },
        { etiqueta: "Peso anterior", valor: "440 kg · 12/10/2026" },
      ],
      primerPesaje: false,
    });
  });

  it("writes the previous weight with a decimal comma when it has one", () => {
    const decimal = { ...pesaje, ultimo_peso_previo: { peso_kg: 440.5, fecha_pesaje: "2026-10-12T09:15:00" } };

    expect(resumirPesaje(decimal, animal, ahora).detalles).toContainEqual({
      etiqueta: "Peso anterior",
      valor: "440,5 kg · 12/10/2026",
    });
  });

  it("flags a first weighing and has no previous weight to list", () => {
    const primero = resumirPesaje({ ...pesaje, ultimo_peso_previo: null }, animal, ahora);

    expect(primero.primerPesaje).toBe(true);
    expect(primero.detalles.map((d) => d.etiqueta)).not.toContain("Peso anterior");
  });

  it("keeps the previous weight when the weighing raised an alert", () => {
    const conAlerta = resumirPesaje({ ...pesaje, alerta }, animal, ahora);

    expect(conAlerta.primerPesaje).toBe(false);
    expect(conAlerta.detalles.map((d) => d.etiqueta)).toContain("Peso anterior");
  });

  it("skips breed, sex and age the animal does not have", () => {
    const sinDatos = { ...animal, raza: null, sexo: null, fecha_nacimiento: null };

    expect(resumirPesaje(pesaje, sinDatos, ahora).detalles.map((d) => d.etiqueta)).toEqual([
      "Fecha y hora",
      "Peso anterior",
    ]);
  });

  it("still lists date and previous weight while the animal is not known", () => {
    expect(resumirPesaje(pesaje, null, ahora).detalles.map((d) => d.etiqueta)).toEqual([
      "Fecha y hora",
      "Peso anterior",
    ]);
  });
});
