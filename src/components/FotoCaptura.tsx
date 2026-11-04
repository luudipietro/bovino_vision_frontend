import { ImageOff } from "lucide-react";
import { useState } from "react";
import { urlDeImagen } from "../api/imagenes";
import type { Uuid } from "../api/tipos";

interface FotoCapturaProps {
  idImagen: Uuid;
  alt: string;
  /** Size of the icon in the neutral placeholder, so thumbnails and the full photo both read well. */
  iconoGrande?: boolean;
}

/**
 * Photo served by `GET /imagenes/{id}`, filling its parent (which sets the size and shape).
 * When the image cannot be loaded, a neutral placeholder takes its place.
 */
export default function FotoCaptura({ idImagen, alt, iconoGrande = false }: FotoCapturaProps) {
  // Remembering which id failed (not a flag) means a different photo gets its own chance to load.
  const [idFallida, setIdFallida] = useState<Uuid | null>(null);

  if (idFallida === idImagen) {
    return (
      <span
        role="img"
        aria-label="Foto no disponible"
        className="flex h-full w-full items-center justify-center bg-neutral-100 text-neutral-400"
      >
        <ImageOff className={iconoGrande ? "h-10 w-10" : "h-6 w-6"} />
      </span>
    );
  }

  return (
    <img
      src={urlDeImagen(idImagen)}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setIdFallida(idImagen)}
      className="h-full w-full object-cover"
    />
  );
}
