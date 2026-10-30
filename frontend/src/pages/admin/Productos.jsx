import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, ImagePlus, X, Star } from 'lucide-react';
import { api, bs } from '../../api';
import { useApi, Modal, Campo, Alerta, Estado, FotoProducto } from '../../components/ui';
import { Encabezado, Tabla, BotonAccion } from './AdminLayout';

const SUGERENCIAS = {
  camara: ['Resolución', 'Visión nocturna', 'Conexión', 'Detección de movimiento', 'Uso'],
  accesorio: ['Capacidad', 'Medida', 'Compatibilidad'],
};

export default function Productos({ tipo }) {
  const { data: productos, error, recargar } = useApi(`/admin/productos?tipo=${tipo}`);
  const { data: todasCategorias } = useApi('/admin/categorias');
  const categorias = todasCategorias?.filter((c) => c.tipo === tipo) ?? [];
  const [buscar, setBuscar] = useState('');
  const [form, setForm] = useState(null);
  const [errForm, setErrForm] = useState('');
  const [errFotos, setErrFotos] = useState('');
  const [guardando, setGuardando] = useState(false);
  const esCamara = tipo === 'camara';

  async function abrir(p) {
    setErrForm('');
    setErrFotos('');
    if (!p) {
      setForm({
        nombre: '', modelo: '', descripcion: '', precio: '', categoria_id: categorias[0]?.id ?? '', destacado: 0, activo: 1,
        caracteristicas: SUGERENCIAS[tipo].map((nombre) => ({ nombre, valor: '' })), imagenes: [], archivos: [],
      });
    } else {
      const det = await api(`/admin/productos/${p.id}`);
      setForm({ ...det, archivos: [] });
    }
  }

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    setErrForm('');
    try {
      const { archivos, imagenes, ...datos } = form;
      let id = form.id;
      if (id) await api(`/admin/productos/${id}`, { method: 'PUT', body: datos });
      else {
        ({ id } = await api('/admin/productos', { method: 'POST', body: datos }));
        setForm((f) => ({ ...f, id })); // si falla la foto, reintentar no duplica el producto
      }

      if (archivos.length) {
        const fd = new FormData();
        archivos.forEach((f) => fd.append('imagenes', f));
        try {
          await api(`/admin/productos/${id}/imagenes`, { method: 'POST', form: fd });
        } catch (err) {
          throw new Error(`Los datos se guardaron, pero no se pudo subir la foto: ${err.message}`);
        }
      }
      setForm(null);
      recargar();
    } catch (err) {
      setErrForm(err.message);
      recargar();
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(p) {
    if (!confirm(`¿Eliminar "${p.nombre}"? También se borrarán sus fotografías.`)) return;
    await api(`/admin/productos/${p.id}`, { method: 'DELETE' });
    recargar();
  }

  async function borrarImagen(img) {
    await api(`/admin/imagenes/${img.id}`, { method: 'DELETE' });
    setForm((f) => ({ ...f, imagenes: f.imagenes.filter((i) => i.id !== img.id) }));
    recargar();
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Valida las fotos al elegirlas para avisar de inmediato
  function elegirFotos(e) {
    const validas = [];
    const rechazadas = [];
    for (const f of e.target.files) {
      if (!/^image\/(jpeg|pjpeg|png|webp|gif|avif|bmp)$/.test(f.type)) rechazadas.push(`"${f.name}" no es JPG, PNG, WEBP, GIF ni AVIF`);
      else if (f.size > 10 * 1024 * 1024) rechazadas.push(`"${f.name}" pesa más de 10 MB`);
      else validas.push(f);
    }
    e.target.value = '';
    setErrFotos(rechazadas.join(' · '));
    if (validas.length) setForm((f) => ({ ...f, archivos: [...f.archivos, ...validas] }));
  }
  const setCaract = (i, k, v) => set('caracteristicas', form.caracteristicas.map((c, j) => (j === i ? { ...c, [k]: v } : c)));

  const lista = productos?.filter((p) => `${p.nombre} ${p.modelo ?? ''} ${p.categoria}`.toLowerCase().includes(buscar.toLowerCase()));

  return (
    <div>
      <Encabezado
        titulo={esCamara ? 'Cámaras' : 'Accesorios y materiales'}
        descripcion={esCamara ? 'Productos, fotografías, características técnicas y precios.' : 'Materiales y equipos complementarios.'}>
        <button className="btn-primary" onClick={() => abrir(null)}><Plus size={18} /> {esCamara ? 'Nueva cámara' : 'Nuevo accesorio'}</button>
      </Encabezado>

      <div className="relative mb-4 max-w-sm">
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-marino-700/50" />
        <input className="input pl-10" placeholder="Buscar…" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
      </div>
      <div className="mb-4"><Alerta>{error}</Alerta></div>

      <Tabla
        filas={lista}
        vacio="No hay productos que coincidan."
        columnas={[
          { titulo: 'Producto', render: (p) => (
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-plata-100"><FotoProducto src={p.imagen} alt="" tipo={tipo} /></div>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 font-semibold text-marino-900">{p.nombre} {p.destacado ? <Star size={14} className="shrink-0 fill-amber-400 text-amber-400" /> : null}</p>
                <p className="text-xs text-marino-700/60">{p.modelo}</p>
              </div>
            </div>
          ) },
          { titulo: 'Categoría', render: (p) => p.categoria },
          { titulo: 'Precio', render: (p) => <span className="whitespace-nowrap font-semibold text-azul-700">{bs(p.precio)}</span> },
          { titulo: 'Estado', render: (p) => <Estado activo={p.activo} /> },
        ]}
        acciones={(p) => (
          <>
            <BotonAccion onClick={() => abrir(p)} title="Editar"><Pencil size={17} /><span className="md:hidden">Editar</span></BotonAccion>
            <BotonAccion color="rojo" onClick={() => eliminar(p)} title="Eliminar"><Trash2 size={17} /><span className="md:hidden">Eliminar</span></BotonAccion>
          </>
        )}
      />

      <Modal abierto={!!form} onClose={() => setForm(null)} titulo={form?.id ? 'Editar producto' : 'Nuevo producto'} ancho="max-w-3xl">
        {form && (
          <form onSubmit={guardar} className="space-y-6 p-4 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Nombre"><input className="input" required value={form.nombre} onChange={(e) => set('nombre', e.target.value)} /></Campo>
              <Campo label="Modelo"><input className="input" value={form.modelo ?? ''} onChange={(e) => set('modelo', e.target.value)} placeholder="Ej. JM-DC2" /></Campo>
              <Campo label="Categoría">
                <select className="input" required value={form.categoria_id} onChange={(e) => set('categoria_id', e.target.value)}>
                  {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </Campo>
              <Campo label="Precio (Bs)"><input className="input" type="number" step="0.01" min="0" required value={form.precio} onChange={(e) => set('precio', e.target.value)} /></Campo>
              <Campo label="Descripción" className="sm:col-span-2">
                <textarea className="input min-h-20" value={form.descripcion ?? ''} onChange={(e) => set('descripcion', e.target.value)} />
              </Campo>
              <div className="flex flex-wrap gap-x-6 gap-y-3 sm:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" className="h-4 w-4 accent-azul-600" checked={!!form.activo} onChange={(e) => set('activo', e.target.checked ? 1 : 0)} /> Visible en el catálogo</label>
                <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" className="h-4 w-4 accent-azul-600" checked={!!form.destacado} onChange={(e) => set('destacado', e.target.checked ? 1 : 0)} /> Destacado</label>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="label !mb-0">Características técnicas</span>
                <button type="button" className="text-sm font-semibold text-azul-600 hover:underline" onClick={() => set('caracteristicas', [...form.caracteristicas, { nombre: '', valor: '' }])}>+ Agregar</button>
              </div>
              <div className="space-y-2">
                {form.caracteristicas.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-xl bg-plata-100/60 p-2 sm:bg-transparent sm:p-0">
                    <div className="grid flex-1 gap-2 sm:grid-cols-2">
                      <input className="input" placeholder="Ej. Resolución" value={c.nombre} onChange={(e) => setCaract(i, 'nombre', e.target.value)} />
                      <input className="input" placeholder="Ej. 4 MP" value={c.valor} onChange={(e) => setCaract(i, 'valor', e.target.value)} />
                    </div>
                    <button type="button" className="self-center rounded-lg p-2 text-red-500 hover:bg-red-50" onClick={() => set('caracteristicas', form.caracteristicas.filter((_, j) => j !== i))} aria-label="Quitar"><X size={18} /></button>
                  </div>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-marino-700/50">Las filas vacías no se guardan.</p>
            </div>

            <div>
              <span className="label">Fotografías</span>
              <div className="flex flex-wrap gap-3">
                {form.imagenes?.map((img) => (
                  <div key={img.id} className="group relative h-24 w-24 overflow-hidden rounded-xl bg-plata-100 ring-1 ring-plata-300">
                    <img src={img.ruta} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => borrarImagen(img)} className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white opacity-0 transition group-hover:opacity-100" aria-label="Eliminar foto"><X size={14} /></button>
                  </div>
                ))}
                {form.archivos.map((f, i) => (
                  <div key={i} className="relative h-24 w-24 overflow-hidden rounded-xl ring-2 ring-azul-500">
                    <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => set('archivos', form.archivos.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-marino-900/80 p-1 text-white" aria-label="Quitar"><X size={14} /></button>
                  </div>
                ))}
                <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-plata-300 text-xs font-medium text-marino-700/60 hover:border-azul-500 hover:text-azul-600">
                  <ImagePlus size={22} /> Subir
                  <input type="file" accept="image/*" multiple className="hidden" onChange={elegirFotos} />
                </label>
              </div>
              {errFotos && <p className="mt-2 text-sm font-medium text-red-600">{errFotos}</p>}
              <p className="mt-1.5 text-xs text-marino-700/50">JPG, PNG, WEBP o AVIF de hasta 10 MB. La primera foto es la portada.</p>
            </div>

            <Alerta>{errForm}</Alerta>
            <div className="flex justify-end gap-2 border-t border-plata-100 pt-4">
              <button type="button" className="btn-ghost" onClick={() => setForm(null)}>Cancelar</button>
              <button className="btn-primary" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar producto'}</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
