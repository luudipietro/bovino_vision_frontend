import { Plus, Users, X } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { mensajeDeError } from "../../api/client";
import { listarRoles } from "../../api/roles";
import type { Rol, Usuario, Uuid } from "../../api/tipos";
import {
  cambiarRolDeUsuario,
  crearUsuario,
  darDeBajaUsuario,
  listarUsuarios,
  modificarUsuario,
} from "../../api/usuarios";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { EmptyState, Loading, Notice } from "../../components/Feedback";
import Field, { Input, Select } from "../../components/Field";
import PageHeader from "../../components/PageHeader";
import { Cell, TableHeader, TableRow } from "../../components/Table";
import { formatearFechaHora, formatearNumero } from "../../lib/formato";
import {
  cambiosDeUsuario,
  FORMULARIO_USUARIO_VACIO,
  type FormularioUsuario,
  formularioDeUsuario,
  nuevoUsuarioDesde,
} from "./formularioUsuario";

const COLUMNAS = "md:grid-cols-[1.4fr_1.6fr_1.1fr_1fr_auto]";

/** The one panel open under a row at a time. */
type Panel =
  | { tipo: "editar"; id: Uuid; formulario: FormularioUsuario; error: string | null }
  | { tipo: "rol"; id: Uuid; idRol: Uuid; error: string | null }
  | { tipo: "baja"; id: Uuid; error: string | null };

function EstadoDelUsuario({ usuario, ahora }: { usuario: Usuario; ahora: number }) {
  if (!usuario.activo) return <Badge tone="neutral">Dado de baja</Badge>;
  if (usuario.bloqueado_hasta && new Date(usuario.bloqueado_hasta).getTime() > ahora) {
    return <Badge tone="warning">Bloqueado hasta {formatearFechaHora(usuario.bloqueado_hasta)}</Badge>;
  }
  return <Badge tone="brand">Activo</Badge>;
}

function OpcionesDeRol({ roles }: { roles: Rol[] }) {
  return roles.map((rol) => (
    <option key={rol.id} value={rol.id}>
      {rol.nombre}
    </option>
  ));
}

export default function UsuariosPage() {
  const [filtroRol, setFiltroRol] = useState<Uuid | "">("");
  // bumped after every change to reload the list
  const [version, setVersion] = useState(0);
  const claveActual = `${filtroRol}|${version}`;
  const [lista, setLista] = useState<{ clave: string; usuarios: Usuario[] } | null>(null);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mostrarAlta, setMostrarAlta] = useState(false);
  const [nuevo, setNuevo] = useState<FormularioUsuario>(FORMULARIO_USUARIO_VACIO);
  const [errorAlta, setErrorAlta] = useState<string | null>(null);
  const [panel, setPanel] = useState<Panel | null>(null);
  // a lock that already expired is shown as active
  const [ahora] = useState(() => Date.now());

  useEffect(() => {
    let vigente = true;
    listarRoles()
      .then((obtenidos) => {
        if (vigente) setRoles(obtenidos);
      })
      .catch((err: unknown) => {
        if (vigente) setError(mensajeDeError(err));
      });
    return () => {
      vigente = false;
    };
  }, []);

  // an answer that arrives after the filter changed is dropped (the effect was cleaned up)
  useEffect(() => {
    let vigente = true;
    listarUsuarios(filtroRol || null)
      .then((usuarios) => {
        if (vigente) setLista({ clave: claveActual, usuarios });
      })
      .catch((err: unknown) => {
        if (!vigente) return;
        setError(mensajeDeError(err));
        setLista({ clave: claveActual, usuarios: [] });
      });
    return () => {
      vigente = false;
    };
  }, [filtroRol, claveActual]);

  const cargando = lista?.clave !== claveActual;
  const usuarios = lista?.usuarios ?? [];
  const nombreDelFiltro = roles.find((r) => r.id === filtroRol)?.nombre;

  function recargar() {
    setVersion((v) => v + 1);
  }

  function cambiarFiltro(idRol: Uuid | "") {
    setError(null);
    setPanel(null);
    setFiltroRol(idRol);
  }

  async function darDeAlta(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const resultado = nuevoUsuarioDesde(nuevo);
    if ("error" in resultado) {
      setErrorAlta(resultado.error);
      return;
    }
    try {
      await crearUsuario(resultado.usuario);
      setNuevo(FORMULARIO_USUARIO_VACIO);
      setErrorAlta(null);
      setMostrarAlta(false);
      recargar();
    } catch (err) {
      setErrorAlta(mensajeDeError(err));
    }
  }

  async function guardarEdicion(event: FormEvent<HTMLFormElement>, usuario: Usuario) {
    event.preventDefault();
    if (panel?.tipo !== "editar") return;
    const resultado = cambiosDeUsuario(usuario, panel.formulario);
    if ("error" in resultado) {
      setPanel({ ...panel, error: resultado.error });
      return;
    }
    if (Object.keys(resultado.cambios).length === 0) {
      setPanel(null);
      return;
    }
    try {
      await modificarUsuario(usuario.id, resultado.cambios);
      setPanel(null);
      recargar();
    } catch (err) {
      setPanel({ ...panel, error: mensajeDeError(err) });
    }
  }

  async function guardarRol(usuario: Usuario) {
    if (panel?.tipo !== "rol") return;
    try {
      await cambiarRolDeUsuario(usuario.id, { id_rol: panel.idRol });
      setPanel(null);
      recargar();
    } catch (err) {
      setPanel({ ...panel, error: mensajeDeError(err) });
    }
  }

  async function confirmarBaja(usuario: Usuario) {
    if (panel?.tipo !== "baja") return;
    try {
      await darDeBajaUsuario(usuario.id);
      setPanel(null);
      recargar();
    } catch (err) {
      setPanel({ ...panel, error: mensajeDeError(err) });
    }
  }

  function cambiarFormularioDeEdicion(campo: keyof FormularioUsuario, valor: string) {
    if (panel?.tipo === "editar") {
      setPanel({ ...panel, formulario: { ...panel.formulario, [campo]: valor } });
    }
  }

  function panelDe(usuario: Usuario) {
    if (panel?.id !== usuario.id) return null;
    if (panel.tipo === "editar") {
      return (
        <form
          key={usuario.id}
          onSubmit={(event) => guardarEdicion(event, usuario)}
          className="space-y-3 rounded-[10px] border border-green-300 bg-white px-6 py-5"
        >
          <p className="text-sm font-bold text-neutral-800">Editar a {usuario.nombre}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Nombre">
              <Input
                type="text"
                autoFocus
                value={panel.formulario.nombre}
                onChange={(e) => cambiarFormularioDeEdicion("nombre", e.target.value)}
              />
            </Field>
            <Field label="Correo">
              <Input
                type="email"
                value={panel.formulario.correo}
                onChange={(e) => cambiarFormularioDeEdicion("correo", e.target.value)}
              />
            </Field>
            <Field label="Nueva contraseña (opcional)">
              <Input
                type="password"
                autoComplete="new-password"
                value={panel.formulario.contrasena}
                onChange={(e) => cambiarFormularioDeEdicion("contrasena", e.target.value)}
              />
            </Field>
          </div>
          <p className="text-[11px] text-neutral-500">
            Si dejás la contraseña vacía se mantiene la actual. Al cambiarla se cierran las sesiones abiertas
            del usuario.
          </p>
          {panel.error && <Notice tone="danger">{panel.error}</Notice>}
          <div className="flex gap-2">
            <Button type="submit">Guardar cambios</Button>
            <Button variant="ghost" onClick={() => setPanel(null)}>
              Cancelar
            </Button>
          </div>
        </form>
      );
    }
    if (panel.tipo === "rol") {
      return (
        <div key={usuario.id} className="space-y-3 rounded-[10px] border border-green-300 bg-white px-6 py-5">
          <p className="text-sm font-bold text-neutral-800">Cambiar el rol de {usuario.nombre}</p>
          <Field label="Rol" className="sm:max-w-xs">
            <Select value={panel.idRol} onChange={(e) => setPanel({ ...panel, idRol: e.target.value, error: null })}>
              <OpcionesDeRol roles={roles} />
            </Select>
          </Field>
          {panel.error && <Notice tone="danger">{panel.error}</Notice>}
          <div className="flex gap-2">
            <Button onClick={() => guardarRol(usuario)}>Cambiar rol</Button>
            <Button variant="ghost" onClick={() => setPanel(null)}>
              Cancelar
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div key={usuario.id} className="space-y-3 rounded-[10px] border border-danger-text/40 bg-white px-6 py-5">
        <p className="text-sm font-bold text-neutral-800">¿Dar de baja a {usuario.nombre}?</p>
        <p className="text-xs text-neutral-600">
          No podrá iniciar sesión y se cerrarán sus sesiones abiertas. Sus registros anteriores se conservan.
        </p>
        {panel.error && <Notice tone="danger">{panel.error}</Notice>}
        <div className="flex gap-2">
          <Button variant="danger" onClick={() => confirmarBaja(usuario)}>
            Confirmar baja
          </Button>
          <Button variant="ghost" onClick={() => setPanel(null)}>
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Usuarios"
        subtitle={
          cargando ? undefined : `${formatearNumero(usuarios.length)} ${usuarios.length === 1 ? "usuario" : "usuarios"}`
        }
        actions={
          <Button
            icon={mostrarAlta ? X : Plus}
            onClick={() => setMostrarAlta(!mostrarAlta)}
            aria-expanded={mostrarAlta}
          >
            {mostrarAlta ? "Cerrar" : "Nuevo usuario"}
          </Button>
        }
      />

      {mostrarAlta && (
        <Card className="md:p-6">
          <form onSubmit={darDeAlta} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Nombre">
                <Input
                  type="text"
                  required
                  value={nuevo.nombre}
                  onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
                />
              </Field>
              <Field label="Correo electrónico">
                <Input
                  type="email"
                  required
                  value={nuevo.correo}
                  onChange={(e) => setNuevo({ ...nuevo, correo: e.target.value })}
                />
              </Field>
              <Field label="Contraseña (mínimo 8 caracteres)">
                <Input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={nuevo.contrasena}
                  onChange={(e) => setNuevo({ ...nuevo, contrasena: e.target.value })}
                />
              </Field>
              <Field label="Rol">
                <Select required value={nuevo.idRol} onChange={(e) => setNuevo({ ...nuevo, idRol: e.target.value })}>
                  <option value="">Elegí un rol</option>
                  <OpcionesDeRol roles={roles} />
                </Select>
              </Field>
            </div>
            {errorAlta && <Notice tone="danger">{errorAlta}</Notice>}
            <Button type="submit" icon={Plus}>
              Crear usuario
            </Button>
          </form>
        </Card>
      )}

      <Field label="Filtrar por rol" className="sm:max-w-xs">
        <Select value={filtroRol} onChange={(e) => cambiarFiltro(e.target.value)}>
          <option value="">Todos los roles</option>
          <OpcionesDeRol roles={roles} />
        </Select>
      </Field>

      {error && <Notice tone="danger">{error}</Notice>}
      {cargando && <Loading />}

      {!cargando && usuarios.length === 0 && !error && (
        <EmptyState
          icon={Users}
          title={filtroRol ? "No hay usuarios con ese rol" : "No hay usuarios todavía"}
          action={
            filtroRol ? (
              <Button variant="secondary" onClick={() => cambiarFiltro("")}>
                Quitar filtro
              </Button>
            ) : undefined
          }
        >
          {filtroRol
            ? `Ningún usuario tiene el rol ${nombreDelFiltro ?? "elegido"}.`
            : "Creá el primero con el botón Nuevo usuario."}
        </EmptyState>
      )}

      {!cargando && usuarios.length > 0 && (
        <div className="space-y-2">
          <TableHeader columns={COLUMNAS} labels={["Nombre", "Correo", "Rol", "Estado", "Acciones"]} />
          {usuarios.map((usuario) => {
            const abierto = panelDe(usuario);
            if (abierto) return abierto;
            return (
              <TableRow key={usuario.id} columns={COLUMNAS}>
                <span className="text-sm font-bold text-neutral-800">{usuario.nombre}</span>
                <Cell label="Correo" muted>
                  {usuario.correo}
                </Cell>
                <Cell label="Rol">{usuario.rol}</Cell>
                <span>
                  <EstadoDelUsuario usuario={usuario} ahora={ahora} />
                </span>
                {usuario.activo ? (
                  <div className="flex flex-wrap gap-1">
                    <Button
                      variant="ghost"
                      aria-label={`Editar a ${usuario.nombre}`}
                      onClick={() =>
                        setPanel({ tipo: "editar", id: usuario.id, formulario: formularioDeUsuario(usuario), error: null })
                      }
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      aria-label={`Cambiar el rol de ${usuario.nombre}`}
                      onClick={() => setPanel({ tipo: "rol", id: usuario.id, idRol: usuario.id_rol, error: null })}
                    >
                      Rol
                    </Button>
                    <Button
                      variant="ghost"
                      aria-label={`Dar de baja a ${usuario.nombre}`}
                      onClick={() => setPanel({ tipo: "baja", id: usuario.id, error: null })}
                    >
                      Dar de baja
                    </Button>
                  </div>
                ) : (
                  <span />
                )}
              </TableRow>
            );
          })}
        </div>
      )}
    </section>
  );
}
