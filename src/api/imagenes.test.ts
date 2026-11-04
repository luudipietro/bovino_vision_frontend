import { describe, expect, it } from "vitest";
import { urlDeImagen } from "./imagenes";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

describe("urlDeImagen", () => {
  it("points at GET /imagenes/{id} on the same base URL as the API client", () => {
    expect(urlDeImagen("3f2b8c1e-7d4a-4c55-9a10-0b6e2d8f4a11")).toBe(
      `${BASE}/imagenes/3f2b8c1e-7d4a-4c55-9a10-0b6e2d8f4a11`,
    );
  });

  it("escapes anything that is not a plain path segment", () => {
    expect(urlDeImagen("a/b?c")).toBe(`${BASE}/imagenes/a%2Fb%3Fc`);
  });
});
