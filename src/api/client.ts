const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

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

async function manejarRespuesta<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new ApiError(response.status, await detalleDeError(response));
  }
  const texto = await response.text();
  return (texto ? JSON.parse(texto) : undefined) as T;
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
  return fetch(`${API_URL}${path}`).then((r) => manejarRespuesta<T>(r));
}

function enviarJson<T>(method: "POST" | "PUT", path: string, body?: unknown): Promise<T> {
  return fetch(`${API_URL}${path}`, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  }).then((r) => manejarRespuesta<T>(r));
}

export function apiPostJson<T>(path: string, body?: unknown): Promise<T> {
  return enviarJson<T>("POST", path, body);
}

export function apiPutJson<T>(path: string, body: unknown): Promise<T> {
  return enviarJson<T>("PUT", path, body);
}

export function apiPostForm<T>(path: string, formData: FormData): Promise<T> {
  return fetch(`${API_URL}${path}`, { method: "POST", body: formData }).then((r) =>
    manejarRespuesta<T>(r),
  );
}

/** Message to show for any rejected request. */
export function mensajeDeError(error: unknown): string {
  return error instanceof Error ? error.message : "Error inesperado";
}
