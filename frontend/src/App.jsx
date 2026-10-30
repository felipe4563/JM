import { Navigate, Route, Routes } from 'react-router-dom';
import Catalogo from './pages/Catalogo';
import Login from './pages/admin/Login';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Categorias from './pages/admin/Categorias';
import Productos from './pages/admin/Productos';
import Kits from './pages/admin/Kits';
import Promociones from './pages/admin/Promociones';
import Servicios from './pages/admin/Servicios';
import Usuarios from './pages/admin/Usuarios';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Catalogo />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="categorias" element={<Categorias />} />
        <Route path="productos" element={<Productos key="camara" tipo="camara" />} />
        <Route path="accesorios" element={<Productos key="accesorio" tipo="accesorio" />} />
        <Route path="kits" element={<Kits />} />
        <Route path="promociones" element={<Promociones />} />
        <Route path="servicios" element={<Servicios />} />
        <Route path="usuarios" element={<Usuarios />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
