import type { Animal, CambiosAnimal, NuevoAnimal, Sexo } from "../../api/tipos";

/** Form state; an empty string means "no value" (inputs never hold null). */
export interface FormularioAnimal {
  idRaza: string;
  sexo: Sexo | "";
  fechaNacimiento: string;
  idLote: string;
}

export const FORMULARIO_VACIO: FormularioAnimal = { idRaza: "", sexo: "", fechaNacimiento: "", idLote: "" };

export function formularioDesde(animal: Animal): FormularioAnimal {
  return {
    idRaza: animal.id_raza ?? "",
    sexo: animal.sexo ?? "",
    fechaNacimiento: animal.fecha_nacimiento ?? "",
    idLote: animal.id_lote ?? "",
  };
}

export function nuevoAnimalDesde(identificador: string, formulario: FormularioAnimal): NuevoAnimal {
  const nuevo: NuevoAnimal = { identificador: identificador.trim() };
  if (formulario.idRaza) nuevo.id_raza = formulario.idRaza;
  if (formulario.sexo) nuevo.sexo = formulario.sexo;
  if (formulario.fechaNacimiento) nuevo.fecha_nacimiento = formulario.fechaNacimiento;
  if (formulario.idLote) nuevo.id_lote = formulario.idLote;
  return nuevo;
}

/**
 * Only the fields that changed to a value. The API keeps the current value when it receives
 * null, so an emptied field is not sent (stored data cannot be cleared).
 */
export function cambiosDeAnimal(animal: Animal, formulario: FormularioAnimal): CambiosAnimal {
  const actual = formularioDesde(animal);
  const cambios: CambiosAnimal = {};
  if (formulario.idRaza && formulario.idRaza !== actual.idRaza) cambios.id_raza = formulario.idRaza;
  if (formulario.sexo && formulario.sexo !== actual.sexo) cambios.sexo = formulario.sexo;
  if (formulario.fechaNacimiento && formulario.fechaNacimiento !== actual.fechaNacimiento) {
    cambios.fecha_nacimiento = formulario.fechaNacimiento;
  }
  if (formulario.idLote && formulario.idLote !== actual.idLote) cambios.id_lote = formulario.idLote;
  return cambios;
}
