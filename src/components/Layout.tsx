import {
  Bell,
  Camera,
  ChartNoAxesColumn,
  CircleUserRound,
  KeyRound,
  LayoutGrid,
  LogOut,
  PanelLeft,
  PawPrint,
  type LucideIcon,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { type Seccion, seccionesPermitidas } from "../features/auth/permisos";
import { useSesion } from "../features/auth/useSesion";
import { almacenDelNavegador, guardarSidebarColapsada, leerSidebarColapsada } from "./sidebarPreferencia";

const ICONOS: Record<Seccion["to"], LucideIcon> = {
  "/captura": Camera,
  "/animales": PawPrint,
  "/lotes": LayoutGrid,
  "/panel": ChartNoAxesColumn,
  "/alertas": Bell,
  "/usuarios": Users,
  "/roles": KeyRound,
};

function Logo({ compact = false, markOnly = false }: { compact?: boolean; markOnly?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <img
        src="/logo-mark.png"
        alt={markOnly ? "BovinoVision" : ""}
        className={compact ? "h-8 w-8" : "h-10 w-10"}
      />
      {!markOnly && (
        <span className={`font-extrabold tracking-tight ${compact ? "text-lg" : "text-xl"}`}>
          <span className="text-brown-600">Bovino</span>
          <span className="text-green-500">Vision</span>
        </span>
      )}
    </span>
  );
}

function useSidebarColapsada() {
  const [colapsada, setColapsada] = useState(() => leerSidebarColapsada(almacenDelNavegador()));
  function alternar() {
    setColapsada((actual) => {
      guardarSidebarColapsada(almacenDelNavegador(), !actual);
      return !actual;
    });
  }
  return [colapsada, alternar] as const;
}

function useNow(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

function DateTimePill() {
  const now = useNow();
  return (
    <p className="flex h-[31px] items-center gap-3 rounded-full bg-neutral-100 px-5 text-[13px] font-bold tabular-nums text-neutral-800">
      {now.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })}
      <span aria-hidden="true">|</span>
      {now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" })}
    </p>
  );
}

export default function Layout() {
  const { sesion, cerrarSesion } = useSesion();
  const [colapsada, alternarSidebar] = useSidebarColapsada();
  const navItems = seccionesPermitidas(sesion?.permisos ?? []).map((seccion) => ({
    ...seccion,
    icon: ICONOS[seccion.to],
  }));

  return (
    <div className="flex min-h-screen">
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-neutral-200 bg-white pb-10 transition-[width,padding] duration-200 ease-standard md:flex ${
          colapsada ? "w-[88px] px-4 pt-14" : "w-[264px] px-7 pt-10"
        }`}
      >
        <div className={`flex items-center ${colapsada ? "justify-center" : ""}`}>
          <Logo markOnly={colapsada} />
        </div>
        {/* Top-right corner of the sidebar, above the logo row so it never crowds the wordmark. */}
        <button
          type="button"
          onClick={alternarSidebar}
          aria-label={colapsada ? "Expandir menú" : "Colapsar menú"}
          aria-expanded={!colapsada}
          title={colapsada ? "Expandir menú" : "Colapsar menú"}
          className={`absolute top-3 flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-green-50 hover:text-neutral-800 ${
            colapsada ? "left-1/2 -translate-x-1/2" : "right-4"
          }`}
        >
          <PanelLeft className="h-5 w-5" />
        </button>

        <nav className="mt-14 flex flex-1 flex-col gap-2" aria-label="Principal">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={colapsada ? label : undefined}
              className={({ isActive }) =>
                `flex h-[45px] items-center rounded-[10px] text-sm font-semibold transition-colors duration-150 ${
                  colapsada ? "justify-center" : "gap-2.5 pl-[19px] pr-2.5"
                } ${isActive ? "bg-green-800 text-white" : "text-neutral-800 hover:bg-green-50"}`
              }
            >
              <Icon className="h-6 w-6 shrink-0" />
              <span className={colapsada ? "sr-only" : undefined}>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div
          className={`flex items-center gap-3 ${colapsada ? "justify-center" : ""}`}
          title={colapsada ? `${sesion?.usuario.nombre ?? ""} · ${sesion?.usuario.rol ?? ""}` : undefined}
        >
          <CircleUserRound className="h-9 w-9 shrink-0 text-green-500" />
          <div className={colapsada ? "sr-only" : "min-w-0"}>
            <p className="truncate text-[15px] font-semibold text-neutral-800">{sesion?.usuario.nombre}</p>
            <p className="truncate text-xs text-neutral-500">{sesion?.usuario.rol}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={cerrarSesion}
          aria-label={colapsada ? "Cerrar sesión" : undefined}
          title={colapsada ? "Cerrar sesión" : undefined}
          className={`mt-4 flex h-10 items-center rounded-[10px] text-sm font-semibold text-neutral-700 transition-colors hover:bg-green-50 ${
            colapsada ? "justify-center" : "gap-2 px-3"
          }`}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!colapsada && "Cerrar sesión"}
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-3 md:hidden">
          <Logo compact />
          <button
            type="button"
            onClick={cerrarSesion}
            aria-label="Cerrar sesión"
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 hover:bg-green-50"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </header>
        <div className="hidden justify-end px-8 pt-10 md:flex lg:px-12">
          <DateTimePill />
        </div>

        <main className="flex-1 px-4 pb-28 pt-6 md:px-8 md:pb-12 md:pt-4 lg:px-12">
          <Outlet />
        </main>

        <nav
          aria-label="Principal"
          className="fixed inset-x-0 bottom-0 z-20 flex h-16 items-center justify-around border-t border-neutral-200 bg-white md:hidden"
        >
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex min-w-14 flex-col items-center gap-0.5 text-[11px] font-semibold ${
                  isActive ? "text-green-800" : "text-neutral-500"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-8 w-12 items-center justify-center rounded-full transition-colors ${
                      isActive ? "bg-green-100" : ""
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
