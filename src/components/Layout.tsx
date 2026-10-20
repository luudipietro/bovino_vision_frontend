import { Beef, Bell, Camera, LayoutDashboard, LayoutGrid, PawPrint } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import BackendStatus from "./BackendStatus";

const NAV_ITEMS = [
  { to: "/captura", label: "Captura", icon: Camera },
  { to: "/animales", label: "Rodeo", icon: PawPrint },
  { to: "/lotes", label: "Lotes", icon: LayoutGrid },
  { to: "/panel", label: "Panel", icon: LayoutDashboard },
  { to: "/alertas", label: "Alertas", icon: Bell },
];

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-stone-50">
      <aside className="hidden w-64 flex-col border-r border-stone-200 bg-white md:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-900 text-white">
            <Beef className="h-5 w-5" />
          </span>
          <div>
            <p className="text-base font-bold leading-tight text-green-900">BovinoVision</p>
            <p className="text-xs text-stone-400">Gestión de rodeo</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive ? "bg-lime-300 text-green-900" : "text-stone-500 hover:bg-stone-100"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-stone-200 px-5 py-4">
          <BackendStatus />
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center gap-2.5 border-b border-stone-200 bg-white px-4 py-3 md:hidden">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-900 text-white">
            <Beef className="h-4 w-4" />
          </span>
          <p className="text-base font-bold text-green-900">BovinoVision</p>
        </header>

        <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:pb-10">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-around border-t border-stone-200 bg-white py-2 md:hidden">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] font-medium ${
                  isActive ? "text-green-900" : "text-stone-400"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      isActive ? "bg-lime-300" : ""
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
