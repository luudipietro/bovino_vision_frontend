import type { CambiosLote, Lote, NuevoLote } from "../../api/tipos";

/** Form texts as typed; the target accepts a decimal comma. */
export interface FormularioLote {
  codigo: string;
  nombre: string;
  gmdObjetivo: string;
}

export const FORMULARIO_LOTE_VACIO: FormularioLote = { codigo: "", nombre: "", gmdObjetivo: "" };

type Resultado<T> = { error: string } | T;

/** Same rule as the API: the target is optional but must be positive. */
export function interpretarGmd(texto: string): Resultado<{ valor: number | null }> {
  const limpio = texto.trim().replace(",", ".");
  if (!limpio) return { valor: null };
  const valor = Number(limpio);
  if (!Number.isFinite(valor)) return { error: "La GMD objetivo debe ser un número" };
  if (valor <= 0) return { error: "La GMD objetivo debe ser positiva" };
  return { valor };
}

export function formularioDeLote(lote: Lote): FormularioLote {
  return {
    codigo: lote.codigo,
    nombre: lote.nombre ?? "",
    gmdObjetivo: lote.gmd_objetivo != null ? String(lote.gmd_objetivo).replace(".", ",") : "",
  };
}

export function nuevoLoteDesde(formulario: FormularioLote): Resultado<{ lote: NuevoLote }> {
  const gmd = interpretarGmd(formulario.gmdObjetivo);
  if ("error" in gmd) return gmd;
  const lote: NuevoLote = { codigo: formulario.codigo.trim() };
  if (formulario.nombre.trim()) lote.nombre = formulario.nombre.trim();
  if (gmd.valor != null) lote.gmd_objetivo = gmd.valor;
  return { lote };
}

/** Only the fields that changed to a value; an emptied field is not sent (the API would keep it). */
export function cambiosDeLote(lote: Lote, formulario: FormularioLote): Resultado<{ cambios: CambiosLote }> {
  const gmd = interpretarGmd(formulario.gmdObjetivo);
  if ("error" in gmd) return gmd;
  const cambios: CambiosLote = {};
  const nombre = formulario.nombre.trim();
  if (nombre && nombre !== lote.nombre) cambios.nombre = nombre;
  if (gmd.valor != null && gmd.valor !== lote.gmd_objetivo) cambios.gmd_objetivo = gmd.valor;
  return { cambios };
}
