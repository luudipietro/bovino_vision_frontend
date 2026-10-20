import { useEffect, useState } from "react";
import { getHealth } from "../api/health";

type Estado = "checking" | "ok" | "error";

const LABELS: Record<Estado, string> = {
  checking: "Verificando conexión…",
  ok: "Backend conectado",
  error: "Sin conexión con el backend",
};

const DOT_COLORS: Record<Estado, string> = {
  checking: "bg-warning-500",
  ok: "bg-green-500",
  error: "bg-danger-500",
};

export default function BackendStatus() {
  const [status, setStatus] = useState<Estado>("checking");

  useEffect(() => {
    getHealth()
      .then(() => setStatus("ok"))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <p role="status" className="flex items-center gap-2 text-xs font-medium text-neutral-600">
      <span className={`h-2 w-2 shrink-0 rounded-full ${DOT_COLORS[status]}`} />
      {LABELS[status]}
    </p>
  );
}
