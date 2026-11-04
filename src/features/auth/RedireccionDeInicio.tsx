import { Navigate } from "react-router-dom";
import { Notice } from "../../components/Feedback";
import { rutaDeInicio } from "./permisos";
import { usePermisos } from "./useSesion";

/** Root path: sends each user to the home screen of their permissions. */
export default function RedireccionDeInicio() {
  const inicio = rutaDeInicio(usePermisos());
  if (inicio) return <Navigate to={inicio} replace />;
  return <Notice tone="warning">Tu rol no tiene pantallas disponibles. Pedile a un administrador que te asigne permisos.</Notice>;
}
