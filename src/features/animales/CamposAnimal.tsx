import type { Lote, Raza, Sexo } from "../../api/tipos";
import Field, { Input, Select } from "../../components/Field";
import type { FormularioAnimal } from "./formularioAnimal";

interface CamposAnimalProps {
  valor: FormularioAnimal;
  onChange: (valor: FormularioAnimal) => void;
  razas: Raza[];
  lotes: Lote[];
  /** Stored data: a field that already has a value cannot be emptied (the API keeps it). */
  original?: FormularioAnimal;
}

/** Breed, sex, birth date and lot, shared by the create and edit forms. */
export default function CamposAnimal({ valor, onChange, razas, lotes, original }: CamposAnimalProps) {
  function cambiar<K extends keyof FormularioAnimal>(campo: K, nuevo: FormularioAnimal[K]) {
    onChange({ ...valor, [campo]: nuevo });
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="Raza">
        <Select value={valor.idRaza} onChange={(e) => cambiar("idRaza", e.target.value)}>
          <option value="" disabled={Boolean(original?.idRaza)}>
            Sin registrar
          </option>
          {razas.map((raza) => (
            <option key={raza.id} value={raza.id}>
              {raza.nombre}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Sexo">
        <Select value={valor.sexo} onChange={(e) => cambiar("sexo", e.target.value as Sexo | "")}>
          <option value="" disabled={Boolean(original?.sexo)}>
            Sin registrar
          </option>
          <option value="macho">Macho</option>
          <option value="hembra">Hembra</option>
        </Select>
      </Field>
      <Field label="Fecha de nacimiento">
        <Input
          type="date"
          value={valor.fechaNacimiento}
          onChange={(e) => cambiar("fechaNacimiento", e.target.value)}
        />
      </Field>
      <Field label="Lote">
        <Select value={valor.idLote} onChange={(e) => cambiar("idLote", e.target.value)}>
          <option value="" disabled={Boolean(original?.idLote)}>
            Sin lote
          </option>
          {lotes.map((lote) => (
            <option key={lote.id} value={lote.id}>
              Lote {lote.codigo}
              {lote.nombre ? ` · ${lote.nombre}` : ""}
            </option>
          ))}
        </Select>
      </Field>
    </div>
  );
}
