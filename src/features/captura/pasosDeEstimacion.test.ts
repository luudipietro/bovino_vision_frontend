import { describe, expect, it } from "vitest";
import type { Captura, EstadoCaptura } from "../../api/tipos";
import { pasosDeEstimacion } from "./pasosDeEstimacion";

function captura(estado: EstadoCaptura, intentos = 0): Captura {
  return {
    id: "c1",
    id_sesion: "s1",
    id_animal: "a1",
    fecha_captura: "2026-10-21T09:12:00",
    estado,
    motivo_fallo: null,
    intentos,
    fecha_revision: null,
    id_evento_pesaje: null,
  };
}

const estados = (c: Captura | null) => pasosDeEstimacion(c).map((paso) => paso.estado);

describe("pasosDeEstimacion", () => {
  it("lists only real steps: upload, queue, processing, estimated weight", () => {
    expect(pasosDeEstimacion(captura("pendiente")).map((paso) => paso.texto)).toEqual([
      "Foto subida",
      "En la cola de procesamiento",
      "Procesando la foto",
      "Peso estimado",
    ]);
  });

  it("marks the queue as running while the capture is pendiente", () => {
    expect(estados(captura("pendiente"))).toEqual(["hecho", "en_curso", "pendiente", "pendiente"]);
  });

  it("treats a registrada capture as queued: the request was just sent", () => {
    expect(estados(captura("registrada"))).toEqual(["hecho", "en_curso", "pendiente", "pendiente"]);
  });

  it("marks the processing as running while the capture is procesando", () => {
    expect(estados(captura("procesando", 1))).toEqual(["hecho", "hecho", "en_curso", "pendiente"]);
  });

  it("completes every step when the capture is procesada", () => {
    expect(estados(captura("procesada", 1))).toEqual(["hecho", "hecho", "hecho", "hecho"]);
  });

  it("shows the attempt number when the processing was retried", () => {
    const pasos = pasosDeEstimacion(captura("procesando", 2));
    expect(pasos[2]?.texto).toBe("Procesando la foto (intento 2)");
  });

  it("does not show an attempt for the first one", () => {
    expect(pasosDeEstimacion(captura("procesando", 1))[2]?.texto).toBe("Procesando la foto");
  });

  it("keeps the photo as the running step while there is no capture yet", () => {
    expect(estados(null)).toEqual(["en_curso", "pendiente", "pendiente", "pendiente"]);
  });
});
