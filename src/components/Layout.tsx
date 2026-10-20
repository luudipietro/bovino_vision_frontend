import { Bell, Camera, ChartNoAxesColumn, CircleUserRound, LayoutGrid, PawPrint } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import BackendStatus from "./BackendStatus";

const NAV_ITEMS = [
  { to: "/captura", label: "Captura", icon: Camera },
  { to: "/animales", label: "Rodeo", icon: PawPrint },
  { to: "/lotes", label: "Lotes", icon: LayoutGrid },
  { to: "/panel", label: "Panel", icon: ChartNoAxesColumn },
  { to: "/alertas", label: "Alertas", icon: Bell },
];

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <img src="/logo-mark.png" alt="" className={compact ? "h-8 w-8" : "h-10 w-10"} />
      <span className={`font-extrabold tracking-tight ${compact ? "text-lg" : "text-xl"}`}>
        <span className="text-brown-600">Bovino</span>
        <span className="text-green-500">Vision</span>
      </span>
    </span>
  );
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
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col border-r border-neutral-200 bg-white px-7 py-10 md:flex">
        <Logo />

        <nav className="mt-14 flex flex-1 flex-col gap-2" aria-label="Principal">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex h-[45px] items-center gap-2.5 rounded-[10px] pl-[19px] pr-2.5 text-sm font-semibold transition-colors duration-150 ${
                  isActive ? "bg-green-800 text-white" : "text-neutral-800 hover:bg-green-50"
                }`
              }
            >
              <Icon className="h-6 w-6" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <CircleUserRound className="h-9 w-9 shrink-0 text-green-500" />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-neutral-800">Usuario Sistema</p>
            <p className="text-xs text-neutral-500">Establecimiento único</p>
          </div>
        </div>
        <div className="mt-5 rounded-[10px] border border-neutral-200 px-3 py-2.5 shadow-xs">
          <BackendStatus />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-3 md:hidden">
          <Logo compact />
        </header>
        <div className="hidden justify-end px-8 pt-10 md:flex lg:px-12">
          <DateTimePill />
        </div>

        <main className="flex-1 px-4 pb-28 pt-6 md:px-8 md:pb-12 md:pt-4 lg:px-12">
          <div className="mx-auto max-w-[1326px]">
            <Outlet />
          </div>
        </main>

        <nav
          aria-label="Principal"
          className="fixed inset-x-0 bottom-0 z-20 flex h-16 items-center justify-around border-t border-neutral-200 bg-white md:hidden"
        >
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
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
