import { NavLink, Outlet } from "react-router-dom";
import BackendStatus from "./BackendStatus";

const navLinkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? "bg-emerald-600 text-white" : "text-gray-600 hover:bg-gray-100"
  }`;

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="text-lg font-semibold text-emerald-700">
            BovinoVision
          </span>
          <nav className="flex gap-2">
            <NavLink to="/captura" className={navLinkClass}>
              Captura
            </NavLink>
            <NavLink to="/animales" className={navLinkClass}>
              Rodeo
            </NavLink>
            <NavLink to="/lotes" className={navLinkClass}>
              Lotes
            </NavLink>
            <NavLink to="/panel" className={navLinkClass}>
              Panel
            </NavLink>
            <NavLink to="/alertas" className={navLinkClass}>
              Alertas
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>

      <footer className="mx-auto max-w-5xl px-4 py-4">
        <BackendStatus />
      </footer>
    </div>
  );
}
