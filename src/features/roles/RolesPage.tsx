import { type FormEvent, useEffect, useState } from "react";
import { mensajeDeError } from "../../api/client";
import { guardarPermisosDeRol, listarPermisos, listarRoles } from "../../api/roles";
import type { CodigoPermiso, Permiso, Rol, Uuid } from "../../api/tipos";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { Loading, Notice } from "../../components/Feedback";
import Field, { Select } from "../../components/Field";
import PageHeader from "../../components/PageHeader";
import { alternarPermiso, hayCambiosDePermisos } from "./permisosRol";

interface Borrador {
  idRol: Uuid;
  permisos: CodigoPermiso[];
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Rol[] | null>(null);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  // bumped after saving to reload the roles
  const [version, setVersion] = useState(0);
  const [idElegido, setIdElegido] = useState<Uuid | null>(null);
  const [borrador, setBorrador] = useState<Borrador | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let vigente = true;
    listarPermisos()
      .then((obtenidos) => {
        if (vigente) setPermisos(obtenidos);
      })
      .catch((err: unknown) => {
        if (vigente) setError(mensajeDeError(err));
      });
    return () => {
      vigente = false;
    };
  }, []);

  useEffect(() => {
    let vigente = true;
    listarRoles()
      .then((obtenidos) => {
        if (vigente) setRoles(obtenidos);
      })
      .catch((err: unknown) => {
        if (!vigente) return;
        setError(mensajeDeError(err));
        setRoles((actuales) => actuales ?? []);
      });
    return () => {
      vigente = false;
    };
  }, [version]);

  const rol = roles?.find((r) => r.id === idElegido) ?? roles?.[0];
  // unsaved checkboxes only apply to the role they were edited on
  const seleccionados = borrador && rol && borrador.idRol === rol.id ? borrador.permisos : (rol?.permisos ?? []);
  const modificado = rol ? hayCambiosDePermisos(rol.permisos, seleccionados) : false;

  function elegirRol(id: Uuid) {
    setIdElegido(id);
    setBorrador(null);
    setError(null);
    setGuardado(false);
  }

  function alternar(codigo: CodigoPermiso) {
    if (!rol) return;
    setGuardado(false);
    setBorrador({ idRol: rol.id, permisos: alternarPermiso(seleccionados, codigo) });
  }

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rol) return;
    setError(null);
    setGuardando(true);
    try {
      await guardarPermisosDeRol(rol.id, seleccionados);
      setBorrador(null);
      setGuardado(true);
      setVersion((v) => v + 1);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Roles y permisos"
        subtitle="Elegí qué puede hacer cada rol. Los cambios se aplican en la siguiente acción de cada usuario."
      />

      {roles === null && <Loading />}

      {rol && (
        <Card className="md:p-6">
          <form onSubmit={guardar} className="space-y-5">
            <Field label="Rol" className="sm:max-w-xs">
              <Select value={rol.id} onChange={(e) => elegirRol(e.target.value)}>
                {roles?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre} ({r.cantidad_usuarios} {r.cantidad_usuarios === 1 ? "usuario" : "usuarios"})
                  </option>
                ))}
              </Select>
            </Field>

            <fieldset className="space-y-3">
              <legend className="mb-2 text-xs font-medium text-neutral-700">Permisos</legend>
              {permisos.map((permiso) => (
                <label key={permiso.codigo} className="flex items-start gap-3 text-sm text-neutral-800">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-green-600"
                    checked={seleccionados.includes(permiso.codigo)}
                    onChange={() => alternar(permiso.codigo)}
                  />
                  <span>{permiso.descripcion}</span>
                </label>
              ))}
            </fieldset>

            {error && <Notice tone="danger">{error}</Notice>}
            {guardado && <Notice tone="success">Permisos guardados.</Notice>}
            <Button type="submit" disabled={!modificado || guardando}>
              Guardar permisos
            </Button>
          </form>
        </Card>
      )}

      {roles !== null && !rol && error && <Notice tone="danger">{error}</Notice>}
    </section>
  );
}
