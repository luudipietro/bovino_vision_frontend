import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  alNoAutorizado,
  apiDelete,
  apiGet,
  apiPostForm,
  apiPostJson,
  apiPutJson,
  query,
} from "./client";

function responder(status: number, cuerpo?: unknown) {
  const texto = cuerpo === undefined ? "" : typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo);
  const fetchFalso = vi.fn().mockResolvedValue(new Response(texto || null, { status }));
  vi.stubGlobal("fetch", fetchFalso);
  return fetchFalso;
}

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("query", () => {
  it("skips empty values and serializes the rest", () => {
    expect(query({ id_lote: "a1", q: "", con_alertas_activas: true, otro: null, falta: undefined })).toBe(
      "?id_lote=a1&con_alertas_activas=true",
    );
    expect(query({ q: "" })).toBe("");
  });
});

describe("apiGet", () => {
  it("returns the parsed JSON body", async () => {
    const fetchFalso = responder(200, { status: "ok" });

    await expect(apiGet("/health")).resolves.toEqual({ status: "ok" });
    expect(fetchFalso).toHaveBeenCalledWith(`${BASE}/health`, { credentials: "include" });
  });

  it("raises the ProblemDetails detail with the status", async () => {
    responder(422, { status: 422, detail: "Formato de imagen no soportado" });

    const error = await apiGet("/capturas").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 422, message: "Formato de imagen no soportado" });
  });

  it("falls back to validation errors, then to the title, then to the status", async () => {
    responder(400, { title: "Bad Request", errors: { desde: ["Falta desde"], hasta: ["Falta hasta"] } });
    await expect(apiGet("/reportes")).rejects.toThrow("Falta desde, Falta hasta");

    responder(400, { title: "Bad Request" });
    await expect(apiGet("/reportes")).rejects.toThrow("Bad Request");

    responder(500, "no es JSON");
    await expect(apiGet("/reportes")).rejects.toThrow("Error 500");
  });
});

describe("apiPostJson", () => {
  it("resolves an empty 202 body as undefined and sends the JSON payload", async () => {
    const fetchFalso = responder(202);

    await expect(apiPostJson("/pesajes", { id_captura: "c1" })).resolves.toBeUndefined();
    expect(fetchFalso).toHaveBeenCalledWith(`${BASE}/pesajes`, {
      credentials: "include",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_captura: "c1" }),
    });
  });
});

describe("session cookie", () => {
  it("sends the credentials on every kind of request", async () => {
    const fetchFalso = vi.fn().mockImplementation(() => Promise.resolve(new Response("{}", { status: 200 })));
    vi.stubGlobal("fetch", fetchFalso);

    await apiPutJson("/lotes/l1", { nombre: "A" });
    await apiDelete("/auth/sesion");
    await apiPostForm("/capturas", new FormData());

    for (const [, init] of fetchFalso.mock.calls) {
      expect(init).toMatchObject({ credentials: "include" });
    }
    expect(fetchFalso).toHaveBeenCalledTimes(3);
  });
});

describe("alNoAutorizado", () => {
  it("notifies the listener on a 401 and still rejects with the API error", async () => {
    const aviso = vi.fn();
    const darDeBaja = alNoAutorizado(aviso);
    responder(401, { detail: "Sesión vencida" });

    await expect(apiGet("/animales")).rejects.toMatchObject({ status: 401, message: "Sesión vencida" });
    expect(aviso).toHaveBeenCalledTimes(1);
    darDeBaja();
  });

  it("does not notify for the login request itself, so the page can show its message", async () => {
    const aviso = vi.fn();
    const darDeBaja = alNoAutorizado(aviso);
    responder(401, { detail: "Usuario o contraseña incorrectos." });

    await expect(apiPostJson("/auth/sesion", { correo: "a", contrasena: "b" })).rejects.toThrow(
      "Usuario o contraseña incorrectos.",
    );
    expect(aviso).not.toHaveBeenCalled();
    darDeBaja();
  });

  it("does not notify for other statuses or after unsubscribing", async () => {
    const aviso = vi.fn();
    const darDeBaja = alNoAutorizado(aviso);
    responder(403, { detail: "Sin permiso" });
    await expect(apiGet("/usuarios")).rejects.toMatchObject({ status: 403 });
    expect(aviso).not.toHaveBeenCalled();

    darDeBaja();
    responder(401);
    await expect(apiGet("/animales")).rejects.toMatchObject({ status: 401 });
    expect(aviso).not.toHaveBeenCalled();
  });
});
