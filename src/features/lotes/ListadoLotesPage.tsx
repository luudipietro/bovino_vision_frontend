import { LayoutGrid, Pencil, Plus } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { mensajeDeError } from "../../api/client";
import { crearLote, listarLotes, modificarLote } from "../../api/lotes";
import type { Lote, Uuid } from "../../api/tipos";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { EmptyState, Loading, Notice } from "../../components/Feedback";
import Field, { Input } from "../../components/Field";
import PageHeader from "../../components/PageHeader";
import { Cell, TableHeader, TableRow } from "../../components/Table";
import { formatearNumero, formatearPorcentaje } from "../../lib/formato";
import {
  cambiosDeLote,
  FORMULARIO_LOTE_VACIO,
  type FormularioLote,
  formularioDeLote,
  nuevoLoteDesde,
} from "./formularioLote";

const COLUMNAS = "md:grid-cols-[1fr_1.2fr_0.8fr_1.6fr_1fr_auto]";

interface EdicionLote {
  id: Uuid;
  formulario: FormularioLote;
  error: string | null;
}

export default function ListadoLotesPage() {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [nuevo, setNuevo] = useState<FormularioLote>(FORMULARIO_LOTE_VACIO);
  const [edicion, setEdicion] = useState<EdicionLote | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function recargar() {
    setCargando(true);
    listarLotes()
      .then(setLotes)
      .catch((err: unknown) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false));
  }

  useEffect(recargar, []);

  async function agregarLote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!nuevo.codigo.trim()) return;
    setError(null);
    const datos = nuevoLoteDesde(nuevo);
    if ("error" in datos) {
      setError(datos.error);
      return;
    }
    try {
      await crearLote(datos.lote);
      setNuevo(FORMULARIO_LOTE_VACIO);
      recargar();
    } catch (err) {
      setError(mensajeDeError(err));
    }
  }

  async function guardarEdicion(event: FormEvent<HTMLFormElement>, lote: Lote) {
    event.preventDefault();
    if (!edicion) return;
    const resultado = cambiosDeLote(lote, edicion.formulario);
    if ("error" in resultado) {
      setEdicion({ ...edicion, error: resultado.error });
      return;
    }
    if (Object.keys(resultado.cambios).length === 0) {
      setEdicion(null);
      return;
    }
    try {
      const actualizado = await modificarLote(lote.id, resultado.cambios);
      setLotes((actuales) => actuales.map((l) => (l.id === actualizado.id ? actualizado : l)));
      setEdicion(null);
    } catch (err) {
      setEdicion({ ...edicion, error: mensajeDeError(err) });
    }
  }

  function cambiarEdicion(campo: keyof FormularioLote, valor: string) {
    if (edicion) setEdicion({ ...edicion, formulario: { ...edicion.formulario, [campo]: valor } });
  }

  const totalAnimales = lotes.reduce((suma, lote) => suma + lote.cantidad_animales, 0);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Lotes"
        subtitle={`${formatearNumero(lotes.length)} ${lotes.length === 1 ? "lote" : "lotes"}`}
      />

      <Card className="md:p-6">
        <form
          onSubmit={agregarLote}
          className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1.4fr_1fr_auto] sm:items-end"
        >
          <Field label="Código de lote">
            <Input
              type="text"
              required
              value={nuevo.codigo}
              onChange={(e) => setNuevo({ ...nuevo, codigo: e.target.value })}
              placeholder="Por ejemplo, A1"
            />
          </Field>
          <Field label="Nombre (opcional)">
            <Input
              type="text"
              value={nuevo.nombre}
              onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
              placeholder="Por ejemplo, Recría"
            />
          </Field>
          <Field label="GMD objetivo, kg/día (opcional)">
            <Input
              type="text"
              inputMode="decimal"
              value={nuevo.gmdObjetivo}
              onChange={(e) => setNuevo({ ...nuevo, gmdObjetivo: e.target.value })}
              placeholder="Por ejemplo, 0,8"
            />
          </Field>
          <Button type="submit" icon={Plus}>
            Crear lote
          </Button>
        </form>
      </Card>

      {error && <Notice tone="danger">{error}</Notice>}
      {cargando && <Loading />}

      {!cargando && lotes.length === 0 && (
        <EmptyState icon={LayoutGrid} title="No hay lotes creados todavía">
          Creá el primero con su código para empezar a agrupar el rodeo.
        </EmptyState>
      )}

      {lotes.length > 0 && (
        <div className="space-y-2">
          <TableHeader
            columns={COLUMNAS}
            labels={["Lote", "Nombre", "Animales", "Participación", "GMD objetivo", "Acciones"]}
          />
          {lotes.map((lote) => {
            const participacion = totalAnimales > 0 ? lote.cantidad_animales / totalAnimales : 0;
            const porcentaje = Math.round(participacion * 100);
            if (edicion?.id === lote.id) {
              return (
                <form
                  key={lote.id}
                  onSubmit={(event) => guardarEdicion(event, lote)}
                  className="space-y-3 rounded-[10px] border border-green-300 bg-white px-6 py-5"
                >
                  <p className="text-sm font-bold text-neutral-800">Editar lote {lote.codigo}</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Nombre">
                      <Input
                        type="text"
                        autoFocus
                        value={edicion.formulario.nombre}
                        onChange={(e) => cambiarEdicion("nombre", e.target.value)}
                      />
                    </Field>
                    <Field label="GMD objetivo (kg/día)">
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={edicion.formulario.gmdObjetivo}
                        onChange={(e) => cambiarEdicion("gmdObjetivo", e.target.value)}
                      />
                    </Field>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Un dato ya cargado se puede cambiar, pero no dejar vacío.
                  </p>
                  {edicion.error && <Notice tone="danger">{edicion.error}</Notice>}
                  <div className="flex gap-2">
                    <Button type="submit">Guardar cambios</Button>
                    <Button variant="ghost" onClick={() => setEdicion(null)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              );
            }
            return (
              <TableRow key={lote.id} columns={COLUMNAS}>
                <span className="text-sm font-bold text-neutral-800">Lote {lote.codigo}</span>
                <Cell label="Nombre" muted>
                  {lote.nombre ?? "Sin nombre"}
                </Cell>
                <Cell label="Animales">
                  <span className="font-semibold tabular-nums">
                    {formatearNumero(lote.cantidad_animales)}
                  </span>
                </Cell>
                <div className="flex items-center gap-3">
                  <div
                    role="progressbar"
                    aria-label={`Participación del lote ${lote.codigo}`}
                    aria-valuenow={porcentaje}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100"
                  >
                    <div className="h-full rounded-full bg-green-500" style={{ width: `${porcentaje}%` }} />
                  </div>
                  <span className="w-12 text-right text-xs font-semibold tabular-nums text-neutral-800">
                    {formatearPorcentaje(participacion)}
                  </span>
                </div>
                <Cell label="GMD objetivo" muted>
                  {lote.gmd_objetivo != null
                    ? `${formatearNumero(lote.gmd_objetivo, 2)} kg/día`
                    : "Sin objetivo"}
                </Cell>
                <Button
                  variant="ghost"
                  icon={Pencil}
                  aria-label={`Editar lote ${lote.codigo}`}
                  onClick={() => setEdicion({ id: lote.id, formulario: formularioDeLote(lote), error: null })}
                >
                  Editar
                </Button>
              </TableRow>
            );
          })}
        </div>
      )}
    </section>
  );
}
