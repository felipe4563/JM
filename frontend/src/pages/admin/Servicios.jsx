import CrudSimple from '../../components/CrudSimple';
import { Estado, ICONOS, IconoServicio } from '../../components/ui';
import { bs } from '../../api';

export default function Servicios() {
  return (
    <CrudSimple
      titulo="Servicios"
      descripcion="Instalación, mantenimiento y otros servicios que ofrece JM."
      ruta="/admin/servicios"
      nuevoTexto="Nuevo servicio"
      inicial={{ nombre: '', descripcion: '', icono: 'wrench', precio_referencial: '', activo: 1 }}
      campos={[
        { name: 'nombre', label: 'Nombre', required: true, full: true },
        { name: 'icono', label: 'Ícono', type: 'select', options: Object.keys(ICONOS).map((k) => [k, k]) },
        { name: 'precio_referencial', label: 'Precio referencial (Bs, opcional)', type: 'number' },
        { name: 'descripcion', label: 'Descripción', type: 'textarea' },
      ]}
      columnas={[
        { titulo: 'Servicio', render: (s) => (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-azul-50 text-azul-600"><IconoServicio nombre={s.icono} size={18} /></div>
            <span className="font-semibold text-marino-900">{s.nombre}</span>
          </div>
        ) },
        { titulo: 'Descripción', render: (s) => <span className="text-marino-700/70">{s.descripcion}</span> },
        { titulo: 'Precio ref.', render: (s) => (s.precio_referencial ? bs(s.precio_referencial) : '—') },
        { titulo: 'Estado', render: (s) => <Estado activo={s.activo} /> },
      ]}
    />
  );
}
