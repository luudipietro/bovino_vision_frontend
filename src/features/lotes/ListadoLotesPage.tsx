import { LayoutGrid, Plus } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { mensajeDeError } from "../../api/client";
import { crearLote, listarLotes } from "../../api/lotes";
import type { Lote } from "../../api/tipos";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { EmptyState, Loading, Notice } from "../../components/Feedback";
import Field, { Input } from "../../components/Field";
import PageHeader from "../../components/PageHeader";
import { Cell, TableHeader, TableRow } from "../../components/Table";
import { formatearNumero, formatearPorcentaje } from "../../lib/formato";

const COLUMNAS = "md:grid-cols-[1fr_1.2fr_0.8fr_1.6fr_1fr]";

export default function ListadoLotesPage() {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [codigoNuevo, setCodigoNuevo] = useState("");
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
    if (!codigoNuevo.trim()) return;
    setError(null);
    try {
      await crearLote({ codigo: codigoNuevo.trim() });
      setCodigoNuevo("");
      recargar();
    } catch (err) {
      setError(mensajeDeError(err));
    }
  }

  const totalAnimales = lotes.reduce((suma, lote) => suma + lote.cantidad_animales, 0);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Lotes"
        subtitle={`${formatearNumero(lotes.length)} ${lotes.length === 1 ? "lote" : "lotes"}`}
      />

      <Card className="md:p-6">
        <form onSubmit={agregarLote} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Field label="Código de lote" className="sm:max-w-sm sm:flex-1">
            <Input
              type="text"
              value={codigoNuevo}
              onChange={(e) => setCodigoNuevo(e.target.value)}
              placeholder="Por ejemplo, A1"
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
            labels={["Lote", "Nombre", "Animales", "Participación", "GMD objetivo"]}
          />
          {lotes.map((lote) => {
            const participacion = totalAnimales > 0 ? lote.cantidad_animales / totalAnimales : 0;
            const porcentaje = Math.round(participacion * 100);
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
              </TableRow>
            );
          })}
        </div>
      )}
    </section>
  );
}
