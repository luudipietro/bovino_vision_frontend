import { useEffect, useState } from "react";
import { getHealth } from "../api/health";

type Estado = "checking" | "ok" | "error";

const LABELS: Record<Estado, string> = {
  checking: "Verificando conexión con el backend…",
  ok: "Backend conectado",
  error: "No se pudo conectar con el backend",
};

const DOT_COLORS: Record<Estado, string> = {
  checking: "bg-amber-400",
  ok: "bg-green-500",
  error: "bg-red-500",
};

export default function BackendStatus() {
  const [status, setStatus] = useState<Estado>("checking");

  useEffect(() => {
    getHealth()
      .then(() => setStatus("ok"))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="flex items-center gap-2 text-xs text-stone-400">
      <span className={`h-2 w-2 shrink-0 rounded-full ${DOT_COLORS[status]}`} />
      {LABELS[status]}
    </div>
  );
}
