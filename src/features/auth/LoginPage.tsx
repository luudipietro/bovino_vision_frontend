import { LogIn } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { mensajeDeError } from "../../api/client";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { Notice } from "../../components/Feedback";
import Field, { Input } from "../../components/Field";
import { rutaDeInicio } from "./permisos";
import { useSesion } from "./useSesion";

export default function LoginPage() {
  const { cargando, sesion, iniciarSesion } = useSesion();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!cargando && sesion) return <Navigate to={rutaDeInicio(sesion.permisos) ?? "/"} replace />;

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await iniciarSesion({ correo: correo.trim(), contrasena });
    } catch (err) {
      // 401, 403 and 429 carry the message to show in `detail`
      setError(mensajeDeError(err));
      setEnviando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="flex items-center justify-center gap-2.5 text-2xl font-extrabold tracking-tight">
          <img src="/logo-mark.png" alt="" className="h-10 w-10" />
          <span>
            <span className="text-brown-600">Bovino</span>
            <span className="text-green-500">Vision</span>
          </span>
        </h1>
        <Card className="md:p-8">
          <form onSubmit={enviar} className="space-y-4">
            <p className="text-lg font-semibold text-neutral-800">Iniciar sesión</p>
            <Field label="Correo electrónico">
              <Input
                type="email"
                required
                autoFocus
                autoComplete="username"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
            </Field>
            <Field label="Contraseña">
              <Input
                type="password"
                required
                autoComplete="current-password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
              />
            </Field>
            {error && <Notice tone="danger">{error}</Notice>}
            <Button type="submit" icon={LogIn} disabled={enviando} className="w-full">
              {enviando ? "Ingresando…" : "Ingresar"}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
