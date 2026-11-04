import { describe, expect, it } from "vitest";
import type { Animal, Pesaje } from "../../api/tipos";
import { describirOperario, describirPesajeAnterior, fichaDelResultado, resumirPesaje } from "./resumenDePesaje";

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
  gmd_kg_dia: null,
  alertas_activas: 0,
  id_imagen_ultimo_pesaje: null,
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
  operario: null,
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

describe("describirPesajeAnterior", () => {
  it("joins the previous weight with the gain and the calendar days between weighings", () => {
    const previo = { peso_kg: 443, fecha_pesaje: "2026-09-18T09:00:00" };
    const nuevo = { ...pesaje, peso_kg: 458, fecha_pesaje: "2026-10-21T09:12:00", ultimo_peso_previo: previo };

    expect(describirPesajeAnterior(nuevo)).toEqual({ valor: "443 kg · +15 kg en 33 días", tono: "positivo" });
  });

  it("keeps decimals only when the weights have them", () => {
    expect(describirPesajeAnterior(pesaje)?.valor).toBe("440 kg · +12,5 kg en 9 días");
  });

  it("marks a loss with a minus sign and the negative tone", () => {
    const baja = { ...pesaje, peso_kg: 430, ultimo_peso_previo: { peso_kg: 440, fecha_pesaje: "2026-10-12T09:15:00" } };

    expect(describirPesajeAnterior(baja)).toEqual({ valor: "440 kg · -10 kg en 9 días", tono: "negativo" });
  });

  it("uses the singular for a single day and says so for the same day", () => {
    const ayer = { ...pesaje, peso_kg: 441, ultimo_peso_previo: { peso_kg: 440, fecha_pesaje: "2026-10-20T20:00:00" } };
    const mismoDia = { ...pesaje, peso_kg: 441, ultimo_peso_previo: { peso_kg: 440, fecha_pesaje: "2026-10-21T08:00:00" } };

    expect(describirPesajeAnterior(ayer)?.valor).toBe("440 kg · +1 kg en 1 día");
    expect(describirPesajeAnterior(mismoDia)?.valor).toBe("440 kg · +1 kg el mismo día");
  });

  it("is null for a first weighing", () => {
    expect(describirPesajeAnterior({ ...pesaje, ultimo_peso_previo: null })).toBeNull();
  });
});

describe("describirOperario", () => {
  it("abbreviates the name and says 'hoy' with the hour for a weighing of today", () => {
    expect(describirOperario("Francisco López", "2026-10-21T09:12:00", ahora)).toBe("F. López · hoy 09:12");
  });

  it("says 'ayer' for the previous day", () => {
    expect(describirOperario("Francisco López", "2026-10-20T18:05:00", ahora)).toBe("F. López · ayer 18:05");
  });

  it("shows the full date and hour for older weighings", () => {
    expect(describirOperario("Francisco López", "2026-10-12T09:15:00", ahora)).toBe(
      "F. López · 12/10/2026, 09:15",
    );
  });

  it("is null when the operator is unknown", () => {
    expect(describirOperario(null, "2026-10-21T09:12:00", ahora)).toBeNull();
  });
});

describe("fichaDelResultado", () => {
  it("lists tag, lot, previous weighing and operator, then the animal's breed, sex and age", () => {
    const ficha = fichaDelResultado({ ...pesaje, operario: "Francisco López" }, animal, ahora);

    expect(ficha).toEqual([
      { etiqueta: "Identificador SENASA", valor: "AR001" },
      { etiqueta: "Lote", valor: "L1" },
      { etiqueta: "Pesaje anterior", valor: "440 kg · +12,5 kg en 9 días", tono: "positivo" },
      { etiqueta: "Operario", valor: "F. López · hoy 14:30" },
      { etiqueta: "Raza", valor: "Angus" },
      { etiqueta: "Sexo", valor: "Hembra" },
      { etiqueta: "Edad", valor: "2 años y 3 meses" },
    ]);
  });

  it("skips what the weighing does not have: lot, previous weighing, operator, unknown animal", () => {
    const ficha = fichaDelResultado({ ...pesaje, lote_codigo: null, ultimo_peso_previo: null }, null, ahora);

    expect(ficha.map((fila) => fila.etiqueta)).toEqual(["Identificador SENASA"]);
  });
});
