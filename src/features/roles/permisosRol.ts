/** Toggles one permission in a new list, keeping the original untouched. */
export function alternarPermiso<T extends string>(actuales: readonly T[], codigo: T): T[] {
  return actuales.includes(codigo) ? actuales.filter((c) => c !== codigo) : [...actuales, codigo];
}

/** Compares two permission lists as sets. */
export function hayCambiosDePermisos(originales: readonly string[], editados: readonly string[]): boolean {
  if (originales.length !== editados.length) return true;
  const conjunto = new Set(originales);
  return editados.some((codigo) => !conjunto.has(codigo));
}
