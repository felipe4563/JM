import { Link } from 'react-router-dom';
import { Cctv, HardDrive, FolderTree, Package, Wrench, Percent, Plus } from 'lucide-react';
import { bs } from '../../api';
import { useApi } from '../../components/ui';
import { Encabezado } from './AdminLayout';

export default function Dashboard() {
  const { data } = useApi('/admin/dashboard');
  if (!data) return <div className="h-64 animate-pulse rounded-2xl bg-plata-100" />;
  const t = data.totales;
  const tarjetas = [
    ['Cámaras', t.camaras, Cctv, '/admin/productos'],
    ['Accesorios', t.accesorios, HardDrive, '/admin/accesorios'],
    ['Categorías', t.categorias, FolderTree, '/admin/categorias'],
    ['Kits', t.kits, Package, '/admin/kits'],
    ['Servicios', t.servicios, Wrench, '/admin/servicios'],
    ['Promociones activas', t.promociones, Percent, '/admin/promociones'],
  ];
  const max = Math.max(1, ...data.porCategoria.map((c) => c.total));

  return (
    <div>
      <Encabezado titulo="Dashboard" descripcion="Resumen general del catálogo.">
        <Link to="/admin/productos" className="btn-primary"><Plus size={18} /> Registrar cámara</Link>
      </Encabezado>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tarjetas.map(([titulo, valor, I, to], i) => (
          <Link key={titulo} to={to} className={`flex items-center gap-4 rounded-2xl p-5 transition hover:-translate-y-0.5 ${i === 0 ? 'bg-marino-900 text-white shadow-lg shadow-marino-900/20' : 'card'}`}>
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${i === 0 ? 'bg-azul-600' : 'bg-azul-50 text-azul-600'}`}><I size={24} /></div>
            <div>
              <p className={`text-sm ${i === 0 ? 'text-plata-300' : 'text-marino-700/60'}`}>{titulo}</p>
              <p className="font-display text-3xl font-extrabold">{valor}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-bold text-marino-900">Productos por categoría</h2>
          <div className="mt-5 space-y-3">
            {data.porCategoria.map((c) => (
              <div key={c.nombre}>
                <div className="mb-1 flex justify-between text-sm"><span className="text-marino-800">{c.nombre}</span><span className="font-semibold text-marino-900">{c.total}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-plata-100">
                  <div className={`h-full rounded-full ${c.tipo === 'camara' ? 'bg-azul-600' : 'bg-cian-400'}`} style={{ width: `${(c.total / max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex gap-4 text-xs text-marino-700/60">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-azul-600" /> Cámaras</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-cian-400" /> Accesorios</span>
          </div>
        </div>
        <div className="card p-6">
          <h2 className="font-bold text-marino-900">Últimos productos registrados</h2>
          <ul className="mt-4 divide-y divide-plata-100">
            {data.recientes.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-3 text-sm">
                <div><p className="font-semibold text-marino-900">{p.nombre}</p><p className="text-xs text-marino-700/60">{p.categoria} · {p.modelo}</p></div>
                <span className="font-semibold text-azul-700">{bs(p.precio)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
