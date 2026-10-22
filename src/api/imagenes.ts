import { urlDeApi } from "./client";
import type { Uuid } from "./tipos";

/**
 * URL of `GET /imagenes/{id}`, which streams the stored photo. It is used straight as an
 * `<img src>`: the browser sends the session cookie by itself.
 */
export function urlDeImagen(idImagen: Uuid): string {
  return urlDeApi(`/imagenes/${encodeURIComponent(idImagen)}`);
}
