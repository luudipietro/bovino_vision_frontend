import type { CambiosUsuario, NuevoUsuario, Usuario, Uuid } from "../../api/tipos";

/** Form texts as typed; an empty password on edit means "keep the current one". */
export interface FormularioUsuario {
  nombre: string;
  correo: string;
  contrasena: string;
  idRol: Uuid;
}

export const FORMULARIO_USUARIO_VACIO: FormularioUsuario = { nombre: "", correo: "", contrasena: "", idRol: "" };

type Resultado<T> = { error: string } | T;

const LARGO_MINIMO_CONTRASENA = 8;
const ERROR_CONTRASENA_CORTA = "La contraseña debe tener al menos 8 caracteres";

export function formularioDeUsuario(usuario: Usuario): FormularioUsuario {
  return { nombre: usuario.nombre, correo: usuario.correo, contrasena: "", idRol: usuario.id_rol };
}

export function nuevoUsuarioDesde(formulario: FormularioUsuario): Resultado<{ usuario: NuevoUsuario }> {
  const nombre = formulario.nombre.trim();
  const correo = formulario.correo.trim();
  if (!nombre) return { error: "Ingresá el nombre" };
  if (!correo) return { error: "Ingresá el correo" };
  if (!formulario.idRol) return { error: "Elegí un rol" };
  if (formulario.contrasena.length < LARGO_MINIMO_CONTRASENA) return { error: ERROR_CONTRASENA_CORTA };
  return { usuario: { nombre, correo, contrasena: formulario.contrasena, id_rol: formulario.idRol } };
}

/** Only the fields that changed to a value; an emptied name or email is not sent (the API keeps it). */
export function cambiosDeUsuario(usuario: Usuario, formulario: FormularioUsuario): Resultado<{ cambios: CambiosUsuario }> {
  const cambios: CambiosUsuario = {};
  const nombre = formulario.nombre.trim();
  const correo = formulario.correo.trim();
  if (nombre && nombre !== usuario.nombre) cambios.nombre = nombre;
  if (correo && correo !== usuario.correo) cambios.correo = correo;
  if (formulario.contrasena) {
    if (formulario.contrasena.length < LARGO_MINIMO_CONTRASENA) return { error: ERROR_CONTRASENA_CORTA };
    cambios.contrasena = formulario.contrasena;
  }
  return { cambios };
}
