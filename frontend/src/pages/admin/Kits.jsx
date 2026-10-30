import { useState } from 'react';
import { Plus, Pencil, Trash2, X, ImagePlus, Package } from 'lucide-react';
import { api, bs } from '../../api';
import { useApi, Modal, Campo, Alerta, Estado } from '../../components/ui';
import { Encabezado } from './AdminLayout';

export default function Kits() {
  const { data: kits, error, recargar } = useApi('/admin/kits');
  const { data: productos } = useApi('/admin/productos');
  const [form, setForm] = useState(null);
  const [errForm, setErrForm] = useState('');
  const [guardando, setGuardando] = useState(false);

  const abrir = (k) => {
    setErrForm('');
    setForm(k ? { ...k, detalles: k.detalles.map((d) => ({ producto_id: d.producto_id, cantidad: d.cantidad })), archivo: null }
      : { nombre: '', descripcion: '', cantidad_camaras: 2, precio: '', activo: 1, detalles: [], archivo: null });
  };

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    try {
      const { archivo, ...datos } = form;
      let id = form.id;
      if (id) await api(`/admin/kits/${id}`, { method: 'PUT', body: datos });
      else ({ id } = await api('/admin/kits', { method: 'POST', body: datos }));
      if (archivo) {
        const fd = new FormData();
        fd.append('imagen', archivo);
        await api(`/admin/kits/${id}/imagen`, { method: 'POST', form: fd });
      }
      setForm(null);
      recargar();
    } catch (err) {
      setErrForm(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(k) {
    if (!confirm(`¿Eliminar el ${k.nombre}?`)) return;
    await api(`/admin/kits/${k.id}`, { method: 'DELETE' });
    recargar();
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setDet = (i, k, v) => set('detalles', form.detalles.map((d, j) => (j === i ? { ...d, [k]: v } : d)));

  return (
    <div>
      <Encabezado titulo="Kits de cámaras" descripcion="Paquetes con cámaras, grabador, disco y accesorios.">
        <button className="btn-primary" onClick={() => abrir(null)}><Plus size={18} /> Nuevo kit</button>
      </Encabezado>
      <div className="mb-4"><Alerta>{error}</Alerta></div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {kits?.map((k) => (
          <div key={k.id} className="card flex flex-col p-5">
            {k.imagen
              ? <img src={k.imagen} alt="" className="mb-3 aspect-video w-full rounded-xl object-cover" />
              : <div className="mb-3 flex aspect-video items-center justify-center rounded-xl bg-azul-50 text-azul-500"><Package size={36} /></div>}
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-marino-900">{k.nombre}</h3>
              <Estado activo={k.activo} />
            </div>
            <p className="text-sm text-azul-600">{k.cantidad_camaras} cámaras</p>
            <ul className="mt-2 flex-1 text-sm text-marino-700/70">
              {k.detalles.map((d) => <li key={d.id}>• {d.cantidad} × {d.nombre}</li>)}
            </ul>
            <p className="mt-3 font-display text-xl font-extrabold text-azul-700">{bs(k.precio)}</p>
            <div className="mt-3 flex gap-2">
              <button className="btn-ghost flex-1" onClick={() => abrir(k)}><Pencil size={16} /> Editar</button>
              <button className="btn-danger" onClick={() => eliminar(k)} aria-label="Eliminar"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      <Modal abierto={!!form} onClose={() => setForm(null)} titulo={form?.id ? 'Editar kit' : 'Nuevo kit'}>
        {form && (
          <form onSubmit={guardar} className="space-y-5 p-4 sm:p-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Campo label="Nombre" className="col-span-2 sm:col-span-3"><input className="input" required value={form.nombre} onChange={(e) => set('nombre', e.target.value)} /></Campo>
              <Campo label="N.º de cámaras"><input className="input" type="number" min="0" value={form.cantidad_camaras} onChange={(e) => set('cantidad_camaras', e.target.value)} /></Campo>
              <Campo label="Precio (Bs)"><input className="input" type="number" step="0.01" min="0" required value={form.precio} onChange={(e) => set('precio', e.target.value)} /></Campo>
              <Campo label="Estado" className="col-span-2 sm:col-span-1">
                <select className="input" value={form.activo} onChange={(e) => set('activo', Number(e.target.value))}>
                  <option value={1}>Activo</option><option value={0}>Inactivo</option>
                </select>
              </Campo>
              <Campo label="Descripción" className="col-span-2 sm:col-span-3"><textarea className="input min-h-20" value={form.descripcion ?? ''} onChange={(e) => set('descripcion', e.target.value)} /></Campo>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="label !mb-0">Productos incluidos</span>
                <button type="button" className="text-sm font-semibold text-azul-600 hover:underline" onClick={() => set('detalles', [...form.detalles, { producto_id: productos?.[0]?.id ?? '', cantidad: 1 }])}>+ Agregar</button>
              </div>
              <div className="space-y-2">
                {form.detalles.map((d, i) => (
                  <div key={i} className="flex gap-2">
                    <input className="input w-16 shrink-0 sm:w-24" type="number" min="1" value={d.cantidad} onChange={(e) => setDet(i, 'cantidad', e.target.value)} />
                    <select className="input min-w-0 flex-1" value={d.producto_id} onChange={(e) => setDet(i, 'producto_id', e.target.value)}>
                      {productos?.map((p) => <option key={p.id} value={p.id}>{p.nombre} {p.modelo ? `(${p.modelo})` : ''}</option>)}
                    </select>
                    <button type="button" className="rounded-lg px-2 text-red-500 hover:bg-red-50" onClick={() => set('detalles', form.detalles.filter((_, j) => j !== i))} aria-label="Quitar"><X size={18} /></button>
                  </div>
                ))}
                {!form.detalles.length && <p className="text-sm text-marino-700/50">Aún no agregaste productos.</p>}
              </div>
            </div>

            <div>
              <span className="label">Imagen del kit</span>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-plata-300 p-3 text-sm text-marino-700/70 hover:border-azul-500">
                {form.archivo ? <img src={URL.createObjectURL(form.archivo)} alt="" className="h-14 w-20 rounded-lg object-cover" />
                  : form.imagen ? <img src={form.imagen} alt="" className="h-14 w-20 rounded-lg object-cover" />
                  : <ImagePlus className="text-azul-500" />}
                {form.archivo?.name || (form.imagen ? 'Cambiar imagen' : 'Seleccionar imagen (opcional)')}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => set('archivo', e.target.files[0] || null)} />
              </label>
            </div>

            <Alerta>{errForm}</Alerta>
            <div className="flex justify-end gap-2 border-t border-plata-100 pt-4">
              <button type="button" className="btn-ghost" onClick={() => setForm(null)}>Cancelar</button>
              <button className="btn-primary" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar kit'}</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
