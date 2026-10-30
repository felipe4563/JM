import CrudSimple from '../../components/CrudSimple';
import { Estado, useApi } from '../../components/ui';

export default function Promociones() {
  const { data: productos } = useApi('/admin/productos');
  const { data: kits } = useApi('/admin/kits');
  if (!productos || !kits) return null;

  return (
    <CrudSimple
      titulo="Promociones"
      descripcion="Descuentos y ofertas. Si eliges un producto o kit, su precio con descuento se mostrará en el catálogo."
      ruta="/admin/promociones"
      nuevoTexto="Nueva promoción"
      inicial={{ titulo: '', descripcion: '', descuento: 0, producto_id: '', kit_id: '', fecha_inicio: '', fecha_fin: '', activo: 1 }}
      prepararEdicion={(p) => ({ ...p, producto_id: p.producto_id ?? '', kit_id: p.kit_id ?? '', fecha_inicio: p.fecha_inicio ?? '', fecha_fin: p.fecha_fin ?? '' })}
      campos={[
        { name: 'titulo', label: 'Título', required: true, full: true },
        { name: 'descripcion', label: 'Descripción / condiciones', type: 'textarea' },
        { name: 'descuento', label: 'Descuento (%)', type: 'number' },
        { name: 'producto_id', label: 'Aplica a producto', type: 'select', options: [['', '— Ninguno —'], ...productos.map((p) => [p.id, p.nombre])] },
        { name: 'kit_id', label: 'Aplica a kit', type: 'select', options: [['', '— Ninguno —'], ...kits.map((k) => [k.id, k.nombre])] },
        { name: 'fecha_inicio', label: 'Fecha de inicio', type: 'date' },
        { name: 'fecha_fin', label: 'Fecha de fin', type: 'date' },
      ]}
      columnas={[
        { titulo: 'Promoción', render: (p) => <span className="font-semibold text-marino-900">{p.titulo}</span> },
        { titulo: 'Descuento', render: (p) => (p.descuento > 0 ? <span className="font-bold text-azul-600">-{p.descuento}%</span> : '—') },
        { titulo: 'Aplica a', render: (p) => productos.find((x) => x.id === p.producto_id)?.nombre || kits.find((x) => x.id === p.kit_id)?.nombre || 'General' },
        { titulo: 'Vigencia', render: (p) => (p.fecha_inicio || p.fecha_fin ? `${p.fecha_inicio ?? '…'} → ${p.fecha_fin ?? '…'}` : 'Sin límite') },
        { titulo: 'Estado', render: (p) => <Estado activo={p.activo} /> },
      ]}
    />
  );
}
