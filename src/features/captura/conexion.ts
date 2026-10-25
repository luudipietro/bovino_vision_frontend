import { useSyncExternalStore } from "react";

export function etiquetaDeConexion(enLinea: boolean): string {
  return enLinea ? "En línea" : "Sin conexión";
}

function suscribir(alCambiar: () => void): () => void {
  window.addEventListener("online", alCambiar);
  window.addEventListener("offline", alCambiar);
  return () => {
    window.removeEventListener("online", alCambiar);
    window.removeEventListener("offline", alCambiar);
  };
}

/** Browser connectivity (`navigator.onLine` plus the online/offline events). */
export function useEnLinea(): boolean {
  return useSyncExternalStore(
    suscribir,
    () => navigator.onLine,
    () => true,
  );
}
