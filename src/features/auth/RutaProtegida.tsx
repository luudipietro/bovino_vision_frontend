import { Navigate, Outlet, useLocation } from "react-router-dom";
import Button from "../../components/Button";
import { Loading, Notice } from "../../components/Feedback";
import { puedeAcceder, rutaDeInicio } from "./permisos";
import { useSesion } from "./useSesion";

/** Session guard: no session goes to the login, a route without permission goes to the user's home. */
export default function RutaProtegida() {
  const { cargando, sesion, cerrarSesion } = useSesion();
  const { pathname } = useLocation();

  if (cargando) {
    return (
      <div className="px-4 py-10">
        <Loading />
      </div>
    );
  }
  if (!sesion) return <Navigate to="/login" replace />;

  if (!puedeAcceder(sesion.permisos, pathname)) {
    const inicio = rutaDeInicio(sesion.permisos);
    if (inicio) return <Navigate to={inicio} replace />;
    return (
      <div className="mx-auto max-w-md space-y-4 px-4 py-16">
        <Notice
          tone="warning"
          action={
            <Button variant="ghost" onClick={cerrarSesion}>
              Cerrar sesión
            </Button>
          }
        >
          Tu rol no tiene permisos para usar el sistema. Pedile a un administrador que te los asigne.
        </Notice>
      </div>
    );
  }
  return <Outlet />;
}
