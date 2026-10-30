import { useState } from 'react';
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderTree, Cctv, HardDrive, Package, Percent, Wrench, Users, LogOut, ExternalLink, Menu,
} from 'lucide-react';
import { cerrarSesion, getToken, getUser } from '../../api';

const MENU = [
  ['/admin', 'Dashboard', LayoutDashboard, true],
  ['/admin/categorias', 'Categorías', FolderTree],
  ['/admin/productos', 'Cámaras', Cctv],
  ['/admin/accesorios', 'Accesorios', HardDrive],
  ['/admin/kits', 'Kits', Package],
  ['/admin/promociones', 'Promociones', Percent],
  ['/admin/servicios', 'Servicios', Wrench],
  ['/admin/usuarios', 'Usuarios', Users],
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);
  if (!getToken()) return <Navigate to="/admin/login" />;
  const user = getUser();

  const salir = () => { cerrarSesion(); navigate('/admin/login'); };

  return (
    <div className="min-h-screen lg:pl-64">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-marino-900 text-white transition-transform lg:translate-x-0 ${abierto ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <img src="/logo.png" alt="JM" className="h-11 w-11 rounded-full ring-2 ring-azul-500/60" />
          <div>
            <p className="font-display font-extrabold">JM Admin</p>
            <p className="text-xs text-plata-300">Seguridad y Tecnología</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {MENU.map(([to, t, I, end]) => (
            <NavLink key={to} to={to} end={end} onClick={() => setAbierto(false)}
              className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${isActive ? 'bg-azul-600 text-white shadow-lg shadow-azul-600/30' : 'text-plata-300 hover:bg-white/5 hover:text-white'}`}>
              <I size={19} /> {t}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-1 border-t border-white/10 p-3">
          <a href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-plata-300 hover:bg-white/5 hover:text-white"><ExternalLink size={19} /> Ver catálogo</a>
          <button onClick={salir} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-plata-300 hover:bg-white/5 hover:text-white"><LogOut size={19} /> Cerrar sesión</button>
        </div>
      </aside>
      {abierto && <div className="fixed inset-0 z-30 bg-marino-950/50 lg:hidden" onClick={() => setAbierto(false)} />}

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-plata-300/60 bg-white/90 px-4 py-3 backdrop-blur sm:px-8">
        <button className="rounded-lg p-2 text-marino-900 lg:hidden" onClick={() => setAbierto(true)} aria-label="Menú"><Menu /></button>
        <p className="hidden text-sm text-marino-700/60 lg:block">Panel de administración del catálogo</p>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-marino-900">{user?.nombre}</p>
            <p className="text-xs text-marino-700/60">@{user?.usuario}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-azul-600 font-bold text-white">{user?.nombre?.[0]}</div>
        </div>
      </header>
      <main className="p-4 sm:p-8"><Outlet /></main>
    </div>
  );
}

// Encabezado común de cada módulo
export function Encabezado({ titulo, descripcion, children }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold text-marino-900">{titulo}</h1>
        {descripcion && <p className="mt-1 text-sm text-marino-700/60">{descripcion}</p>}
      </div>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

/**
 * Tabla común y adaptable:
 * - Computadora/tablet (md+): tabla clásica.
 * - Celular: cada fila se muestra como tarjeta (la 1.ª columna es el título).
 * columnas: [{ titulo, render: (fila) => node }]
 * acciones: (fila) => node
 */
export function Tabla({ columnas, filas, acciones, vacio = 'Sin registros' }) {
  if (!filas) return <div className="card h-48 animate-pulse bg-plata-100" />;
  if (!filas.length) return <div className="card px-5 py-12 text-center text-sm text-marino-700/50">{vacio}</div>;
  const [principal, ...resto] = columnas;

  return (
    <>
      {/* Celular: tarjetas */}
      <div className="space-y-3 md:hidden">
        {filas.map((fila) => (
          <div key={fila.id} className="card p-4">
            <div className="min-w-0">{principal.render(fila)}</div>
            {resto.length > 0 && (
              <dl className="mt-3 space-y-2 border-t border-plata-100 pt-3 text-sm">
                {resto.map((c) => (
                  <div key={c.titulo} className="flex items-start justify-between gap-4">
                    <dt className="shrink-0 text-xs font-semibold uppercase tracking-wide text-marino-700/50">{c.titulo}</dt>
                    <dd className="min-w-0 text-right text-marino-800">{c.render(fila)}</dd>
                  </div>
                ))}
              </dl>
            )}
            {acciones && <div className="mt-3 flex justify-end gap-2 border-t border-plata-100 pt-3">{acciones(fila)}</div>}
          </div>
        ))}
      </div>

      {/* Computadora: tabla */}
      <div className="card hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-plata-100 text-left text-xs uppercase tracking-wide text-marino-700/60">
              {columnas.map((c) => <th key={c.titulo} className="px-5 py-3.5 font-semibold">{c.titulo}</th>)}
              {acciones && <th className="px-5 py-3.5 text-right font-semibold">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-plata-100">
            {filas.map((fila) => (
              <tr key={fila.id} className="hover:bg-plata-100/40">
                {columnas.map((c) => <td key={c.titulo} className="px-5 py-3.5">{c.render(fila)}</td>)}
                {acciones && <td className="px-5 py-3.5"><div className="flex justify-end gap-1.5">{acciones(fila)}</div></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// Botón de acción con ícono (editar, eliminar, etc.)
export function BotonAccion({ color = 'azul', children, ...props }) {
  const colores = {
    azul: 'text-azul-600 hover:bg-azul-50 ring-azul-100',
    ambar: 'text-amber-600 hover:bg-amber-50 ring-amber-100',
    rojo: 'text-red-600 hover:bg-red-50 ring-red-100',
  };
  return (
    <button type="button" className={`flex items-center gap-1.5 rounded-lg p-2 text-sm font-medium ring-1 md:ring-0 ${colores[color]}`} {...props}>
      {children}
    </button>
  );
}

