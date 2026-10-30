import CrudSimple from '../../components/CrudSimple';
import { Estado } from '../../components/ui';

export default function Categorias() {
  return (
    <CrudSimple
      titulo="Categorías"
      descripcion="Organiza las cámaras y accesorios del catálogo."
      ruta="/admin/categorias"
      nuevoTexto="Nueva categoría"
      inicial={{ nombre: '', descripcion: '', tipo: 'camara', activo: 1 }}
      campos={[
        { name: 'nombre', label: 'Nombre', required: true },
        { name: 'tipo', label: 'Tipo', type: 'select', options: [['camara', 'Cámara'], ['accesorio', 'Accesorio / material']] },
        { name: 'descripcion', label: 'Descripción', type: 'textarea' },
      ]}
      columnas={[
        { titulo: 'Nombre', render: (c) => <span className="font-semibold text-marino-900">{c.nombre}</span> },
        { titulo: 'Tipo', render: (c) => (c.tipo === 'camara' ? 'Cámara' : 'Accesorio') },
        { titulo: 'Descripción', render: (c) => <span className="text-marino-700/70">{c.descripcion}</span> },
        { titulo: 'Estado', render: (c) => <Estado activo={c.activo} /> },
      ]}
    />
  );
}
