const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

/** Absolute URL of an API path, for resources the browser loads by itself (for example `<img src>`). */
export function urlDeApi(path: string): string {
  return `${API_URL}${path}`;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, detail: string | null) {
    super(detail || `Error ${status}`);
    this.status = status;
  }
}

/** RFC 9457 body returned by the API; validation errors also carry `errors`. */
interface ProblemDetails {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

async function detalleDeError(response: Response): Promise<string | null> {
  try {
    const body = (await response.json()) as ProblemDetails;
    if (body.detail) return body.detail;
    if (body.errors) return Object.values(body.errors).flat().join(", ");
    return body.title ?? null;
  } catch {
    // the body was not JSON, the generic message is used
    return null;
  }
}

type AvisoNoAutorizado = () => void;
const avisosNoAutorizado = new Set<AvisoNoAutorizado>();

/** Subscribes to "the session is gone" (a 401 from any call but the login); returns the unsubscribe. */
export function alNoAutorizado(aviso: AvisoNoAutorizado): () => void {
  avisosNoAutorizado.add(aviso);
  return () => {
    avisosNoAutorizado.delete(aviso);
  };
}

async function manejarRespuesta<T>(response: Response, esInicioDeSesion: boolean): Promise<T> {
  if (!response.ok) {
    // a wrong login answers 401 too, but that one is shown by the login page, not a lost session
    if (response.status === 401 && !esInicioDeSesion) avisosNoAutorizado.forEach((aviso) => aviso());
    throw new ApiError(response.status, await detalleDeError(response));
  }
  const texto = await response.text();
  return (texto ? JSON.parse(texto) : undefined) as T;
}

/** Every request carries the session cookie. */
function pedir<T>(method: string, path: string, init: RequestInit = {}): Promise<T> {
  const esInicioDeSesion = method === "POST" && path === "/auth/sesion";
  return fetch(`${API_URL}${path}`, { credentials: "include", ...init }).then((r) =>
    manejarRespuesta<T>(r, esInicioDeSesion),
  );
}

/** Builds a query string skipping empty values. */
export function query(parametros: Record<string, string | boolean | null | undefined>): string {
  const params = new URLSearchParams();
  for (const [clave, valor] of Object.entries(parametros)) {
    if (valor !== null && valor !== undefined && valor !== "") params.set(clave, String(valor));
  }
  const texto = params.toString();
  return texto ? `?${texto}` : "";
}

export function apiGet<T>(path: string): Promise<T> {
  return pedir<T>("GET", path);
}

function enviarJson<T>(method: "POST" | "PUT", path: string, body?: unknown): Promise<T> {
  return pedir<T>(method, path, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function apiPostJson<T>(path: string, body?: unknown): Promise<T> {
  return enviarJson<T>("POST", path, body);
}

export function apiPutJson<T>(path: string, body: unknown): Promise<T> {
  return enviarJson<T>("PUT", path, body);
}

export function apiDelete(path: string): Promise<void> {
  return pedir<void>("DELETE", path, { method: "DELETE" });
}

export function apiPostForm<T>(path: string, formData: FormData): Promise<T> {
  return pedir<T>("POST", path, { method: "POST", body: formData });
}

/** Message to show for any rejected request. */
export function mensajeDeError(error: unknown): string {
  return error instanceof Error ? error.message : "Error inesperado";
}
