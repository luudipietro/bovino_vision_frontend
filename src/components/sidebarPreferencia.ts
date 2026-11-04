// Per-browser convenience: losing it only means the sidebar opens expanded.

const CLAVE = "bovinovision.sidebar-colapsada";

type Almacen = Pick<Storage, "getItem" | "setItem">;

export function leerSidebarColapsada(storage: Almacen | undefined): boolean {
  try {
    return storage?.getItem(CLAVE) === "1";
  } catch {
    return false;
  }
}

export function guardarSidebarColapsada(storage: Almacen | undefined, colapsada: boolean): void {
  try {
    storage?.setItem(CLAVE, colapsada ? "1" : "0");
  } catch {
    // blocked storage: the preference is simply not remembered
  }
}

/** `window.localStorage` can throw on access when site data is blocked. */
export function almacenDelNavegador(): Almacen | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}
