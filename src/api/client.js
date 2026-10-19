const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(status, detail) {
    super(detail || `Error ${status}`);
    this.status = status;
  }
}

async function detalleDeError(response) {
  try {
    const body = await response.json();
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail)) {
      return body.detail.map((item) => item.msg).join(", ");
    }
  } catch {
    // el cuerpo no era JSON, se usa el mensaje genérico
  }
  return null;
}

async function manejarRespuesta(response) {
  if (!response.ok) {
    throw new ApiError(response.status, await detalleDeError(response));
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

export function apiGet(path) {
  return fetch(`${API_URL}${path}`).then(manejarRespuesta);
}

export function apiPostJson(path, body) {
  return fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(manejarRespuesta);
}

export function apiPutJson(path, body) {
  return fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(manejarRespuesta);
}

export function apiPostForm(path, formData) {
  return fetch(`${API_URL}${path}`, {
    method: "POST",
    body: formData,
  }).then(manejarRespuesta);
}
