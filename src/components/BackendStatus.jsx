import { useEffect, useState } from "react";
import { getHealth } from "../api/health";

export default function BackendStatus() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    getHealth()
      .then(() => setStatus("ok"))
      .catch(() => setStatus("error"));
  }, []);

  const label = {
    checking: "Verificando conexión con el backend…",
    ok: "Backend conectado",
    error: "No se pudo conectar con el backend",
  }[status];

  const dotColor = {
    checking: "bg-amber-400",
    ok: "bg-green-500",
    error: "bg-red-500",
  }[status];

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <span className={`h-2 w-2 rounded-full ${dotColor}`} />
      {label}
    </div>
  );
}
