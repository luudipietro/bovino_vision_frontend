import { CALIDAD_JPEG, nombreJpeg, planDeReduccion } from "./tamanoFoto";

/**
 * Shrinks a photo right before the upload (see `planDeReduccion` for the rules). The EXIF
 * orientation is applied while decoding, so the JPEG goes up already upright. Any failure
 * (the browser cannot decode the format, no canvas, no blob) falls back to the original file.
 */
export async function reducirFoto(archivo: File): Promise<File> {
  try {
    const imagen = await createImageBitmap(archivo, { imageOrientation: "from-image" });
    try {
      const plan = planDeReduccion(archivo.type, imagen.width, imagen.height);
      if (plan.accion === "conservar") return archivo;

      const lienzo = document.createElement("canvas");
      lienzo.width = plan.ancho;
      lienzo.height = plan.alto;
      const contexto = lienzo.getContext("2d");
      if (!contexto) return archivo;
      contexto.drawImage(imagen, 0, 0, plan.ancho, plan.alto);

      const jpeg = await new Promise<Blob | null>((resolve) => {
        lienzo.toBlob(resolve, "image/jpeg", CALIDAD_JPEG);
      });
      if (!jpeg) return archivo;
      return new File([jpeg], nombreJpeg(archivo.name), {
        type: "image/jpeg",
        lastModified: archivo.lastModified,
      });
    } finally {
      imagen.close();
    }
  } catch {
    // the original photo is still a valid upload; the API validates it
    return archivo;
  }
}
