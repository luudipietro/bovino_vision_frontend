export type PasoCaptura = "identificar" | "foto" | "procesando" | "resultado";

export interface Retroceso {
  destino: PasoCaptura;
  etiqueta: string;
  /** The photo already registered in the API must be discarded before leaving. */
  descartarFoto: boolean;
  /** The estimation keeps running on the server, so the operator is told where to find it. */
  avisarSegundoPlano: boolean;
}

/** Where "back" leads from a step, or null when there is no previous step. */
export function retrocesoDesde(paso: PasoCaptura, fotoRegistrada: boolean): Retroceso | null {
  switch (paso) {
    case "identificar":
      return null;
    case "foto":
      return {
        destino: "identificar",
        etiqueta: "Elegir otro animal",
        descartarFoto: fotoRegistrada,
        avisarSegundoPlano: false,
      };
    case "procesando":
      return {
        destino: "foto",
        etiqueta: "Volver a la foto",
        descartarFoto: false,
        avisarSegundoPlano: true,
      };
    case "resultado":
      return {
        destino: "foto",
        etiqueta: "Tomar otra foto",
        descartarFoto: false,
        avisarSegundoPlano: false,
      };
  }
}
