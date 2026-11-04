import type { Permiso } from "../../api/tipos";

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

export interface PermisoAgrupado {
  codigo: string;
  nombre: string;
  descripcion: string;
  /** Changes what every role can do, so the screen flags it. */
  critico: boolean;
}

export interface GrupoDePermisos {
  titulo: string;
  permisos: PermisoAgrupado[];
}

interface DatosDePermiso {
  nombre: string;
  descripcion: string;
  critico?: boolean;
}

// Group and order follow the mockup; reports and audit sit under "Administración" like there.
const GRUPOS: { titulo: string; permisos: Record<string, DatosDePermiso> }[] = [
  {
    titulo: "Ganadería y campo",
    permisos: {
      capturas_registrar: { nombre: "Registrar capturas", descripcion: "Capturar y confirmar estimaciones de peso" },
      rodeo_gestionar: { nombre: "Gestionar rodeo", descripcion: "Dar de alta y modificar animales y lotes" },
      rodeo_consultar: { nombre: "Consultar rodeo", descripcion: "Ver animales, lotes, historial y sus alertas" },
    },
  },
  {
    titulo: "Administración",
    permisos: {
      analitica_consultar: { nombre: "Ver reportes", descripcion: "Acceso al panel, las alertas y los tableros del rodeo" },
      usuarios_gestionar: { nombre: "Gestionar usuarios", descripcion: "Crear y editar perfiles del personal" },
      roles_gestionar: {
        nombre: "Configurar roles",
        descripcion: "Cambiar permisos globales del sistema",
        critico: true,
      },
      auditoria_consultar: { nombre: "Consultar la auditoría", descripcion: "Ver el registro de actividad del sistema" },
    },
  },
];

const GRUPO_POR_DEFECTO = "Administración";

function agrupado(codigo: string, datos: DatosDePermiso): PermisoAgrupado {
  return { codigo, nombre: datos.nombre, descripcion: datos.descripcion, critico: datos.critico ?? false };
}

/**
 * Splits the permission catalog into the screen groups, in a fixed order. Codes the screen does not know
 * yet go to "Administración" with the text the API sends, so a new permission is never hidden.
 */
export function agruparPermisos(catalogo: readonly Permiso[]): GrupoDePermisos[] {
  const codigos = new Set<string>(catalogo.map((p) => p.codigo));
  const conocidos = new Set(GRUPOS.flatMap((g) => Object.keys(g.permisos)));
  const desconocidos = catalogo
    .filter((p) => !conocidos.has(p.codigo))
    .map((p) => agrupado(p.codigo, { nombre: p.descripcion, descripcion: p.descripcion }));

  return GRUPOS.map((g) => ({
    titulo: g.titulo,
    permisos: [
      ...Object.entries(g.permisos)
        .filter(([codigo]) => codigos.has(codigo))
        .map(([codigo, datos]) => agrupado(codigo, datos)),
      ...(g.titulo === GRUPO_POR_DEFECTO ? desconocidos : []),
    ],
  })).filter((g) => g.permisos.length > 0);
}
