/** Longest side, in pixels, of a photo sent to the API. Assumed enough as model input; change it here only. */
export const LADO_MAYOR_MAXIMO = 1600;

/** JPEG quality used when a photo is re-encoded before the upload. */
export const CALIDAD_JPEG = 0.85;

export type PlanDeReduccion =
  | { accion: "conservar" }
  | { accion: "recodificar"; ancho: number; alto: number };

/**
 * Decides what to do with a decoded photo (sizes already respect its EXIF orientation):
 * a JPEG within the limit goes up untouched; anything else is re-encoded as JPEG, scaled
 * down only when its longest side exceeds the limit.
 */
export function planDeReduccion(tipo: string, ancho: number, alto: number): PlanDeReduccion {
  const ladoMayor = Math.max(ancho, alto);
  if (ladoMayor <= LADO_MAYOR_MAXIMO) {
    return tipo === "image/jpeg" ? { accion: "conservar" } : { accion: "recodificar", ancho, alto };
  }
  const escala = LADO_MAYOR_MAXIMO / ladoMayor;
  return {
    accion: "recodificar",
    ancho: Math.max(1, Math.round(ancho * escala)),
    alto: Math.max(1, Math.round(alto * escala)),
  };
}

/** File name for the re-encoded photo: same base name, `.jpg` extension. */
export function nombreJpeg(nombre: string): string {
  const base = nombre.replace(/\.[^./\\]+$/, "");
  return `${base}.jpg`;
}
