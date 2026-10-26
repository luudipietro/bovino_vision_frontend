import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import AlertasPage from "./features/alertas/AlertasPage";
import FichaAnimalPage from "./features/animales/FichaAnimalPage";
import ListadoAnimalesPage from "./features/animales/ListadoAnimalesPage";
import LoginPage from "./features/auth/LoginPage";
import RedireccionDeInicio from "./features/auth/RedireccionDeInicio";
import RutaProtegida from "./features/auth/RutaProtegida";
import CapturaPage from "./features/captura/CapturaPage";
import ResultadoCapturaPage from "./features/captura/ResultadoCapturaPage";
import SesionCapturaPage from "./features/captura/SesionCapturaPage";
import ListadoLotesPage from "./features/lotes/ListadoLotesPage";
import PanelPage from "./features/panel/PanelPage";
import RolesPage from "./features/roles/RolesPage";
import UsuariosPage from "./features/usuarios/UsuariosPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RutaProtegida />}>
        <Route element={<Layout />}>
          <Route index element={<RedireccionDeInicio />} />
          <Route path="/captura" element={<CapturaPage />} />
          <Route path="/captura/sesiones/:id" element={<SesionCapturaPage />} />
          <Route path="/captura/capturas/:id" element={<ResultadoCapturaPage />} />
          <Route path="/animales" element={<ListadoAnimalesPage />} />
          <Route path="/animales/:id" element={<FichaAnimalPage />} />
          <Route path="/lotes" element={<ListadoLotesPage />} />
          <Route path="/panel" element={<PanelPage />} />
          <Route path="/alertas" element={<AlertasPage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/roles" element={<RolesPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
