import { describe, expect, it } from "vitest";
import { guardarSidebarColapsada, leerSidebarColapsada } from "./sidebarPreferencia";

function memoria(): Pick<Storage, "getItem" | "setItem"> {
  const datos = new Map<string, string>();
  return {
    getItem: (clave) => datos.get(clave) ?? null,
    setItem: (clave, valor) => void datos.set(clave, valor),
  };
}

const rota: Pick<Storage, "getItem" | "setItem"> = {
  getItem: () => {
    throw new Error("storage blocked");
  },
  setItem: () => {
    throw new Error("storage blocked");
  },
};

describe("sidebarPreferencia", () => {
  it("starts expanded when nothing was saved", () => {
    expect(leerSidebarColapsada(memoria())).toBe(false);
  });

  it("remembers the collapsed state", () => {
    const storage = memoria();
    guardarSidebarColapsada(storage, true);
    expect(leerSidebarColapsada(storage)).toBe(true);
    guardarSidebarColapsada(storage, false);
    expect(leerSidebarColapsada(storage)).toBe(false);
  });

  it("falls back to expanded when storage is unavailable or blocked", () => {
    expect(leerSidebarColapsada(undefined)).toBe(false);
    expect(leerSidebarColapsada(rota)).toBe(false);
    expect(() => guardarSidebarColapsada(rota, true)).not.toThrow();
  });
});
