import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import CapturaPage from "./features/captura/CapturaPage";
import FichaAnimalPage from "./features/animales/FichaAnimalPage";
import ListadoAnimalesPage from "./features/animales/ListadoAnimalesPage";
import ListadoLotesPage from "./features/lotes/ListadoLotesPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/animales" replace />} />
        <Route path="/captura" element={<CapturaPage />} />
        <Route path="/animales" element={<ListadoAnimalesPage />} />
        <Route path="/animales/:id" element={<FichaAnimalPage />} />
        <Route path="/lotes" element={<ListadoLotesPage />} />
      </Route>
    </Routes>
  );
}
