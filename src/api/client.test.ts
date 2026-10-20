import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiGet, apiPostJson, query } from "./client";

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
    expect(fetchFalso).toHaveBeenCalledWith(`${BASE}/health`);
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
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_captura: "c1" }),
    });
  });
});
