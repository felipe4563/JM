import { useState } from 'react';
import { Plus, Pencil, Trash2, Power } from 'lucide-react';
import { api } from '../api';
import { useApi, Modal, Campo, Alerta } from './ui';
import { Encabezado, Tabla, BotonAccion } from '../pages/admin/AdminLayout';

/**
 * Módulo CRUD reutilizable para tablas simples.
 * campos: [{ name, label, type: 'text'|'textarea'|'number'|'date'|'select'|'password', options, required, full }]
 * columnas: [{ titulo, render: (fila) => node }]
 */
export default function CrudSimple({ titulo, descripcion, ruta, campos, columnas, inicial, nuevoTexto = 'Nuevo', permitirEliminar = true, prepararEdicion }) {
  const { data, error, recargar } = useApi(ruta);
  const [form, setForm] = useState(null);
  const [errForm, setErrForm] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState('');

  const abrir = (fila) => {
    setErrForm('');
    setForm(fila ? (prepararEdicion ? prepararEdicion(fila) : { ...fila }) : { ...inicial });
  };

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    setErrForm('');
    try {
      if (form.id) await api(`${ruta}/${form.id}`, { method: 'PUT', body: form });
      else await api(ruta, { method: 'POST', body: form });
      setForm(null);
      recargar();
    } catch (err) {
      setErrForm(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function alternar(fila) {
    try {
      await api(`${ruta}/${fila.id}`, { method: 'PUT', body: { activo: fila.activo ? 0 : 1 } });
      recargar();
    } catch (err) { setAviso(err.message); }
  }

  async function eliminar(fila) {
    if (!confirm('¿Seguro que deseas eliminar este registro?')) return;
    try {
      await api(`${ruta}/${fila.id}`, { method: 'DELETE' });
      recargar();
    } catch (err) { setAviso(err.message); }
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <Encabezado titulo={titulo} descripcion={descripcion}>
        <button className="btn-primary" onClick={() => abrir(null)}><Plus size={18} /> {nuevoTexto}</button>
      </Encabezado>
      <div className="mb-4 space-y-2"><Alerta>{error || aviso}</Alerta></div>

      <Tabla
        columnas={columnas}
        filas={data}
        acciones={(fila) => (
          <>
            <BotonAccion onClick={() => abrir(fila)} title="Editar"><Pencil size={17} /><span className="md:hidden">Editar</span></BotonAccion>
            {'activo' in fila && (
              <BotonAccion color="ambar" onClick={() => alternar(fila)} title={fila.activo ? 'Desactivar' : 'Activar'}>
                <Power size={17} /><span className="md:hidden">{fila.activo ? 'Desactivar' : 'Activar'}</span>
              </BotonAccion>
            )}
            {permitirEliminar && <BotonAccion color="rojo" onClick={() => eliminar(fila)} title="Eliminar"><Trash2 size={17} /><span className="md:hidden">Eliminar</span></BotonAccion>}
          </>
        )}
      />

      <Modal abierto={!!form} onClose={() => setForm(null)} titulo={form?.id ? `Editar ${titulo.toLowerCase()}` : nuevoTexto}>
        {form && (
          <form onSubmit={guardar} className="p-4 sm:p-6">
            <Alerta>{errForm}</Alerta>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              {campos.map((c) => (
                <Campo key={c.name} label={c.label} className={c.full || c.type === 'textarea' ? 'sm:col-span-2' : ''}>
                  {c.type === 'textarea' ? (
                    <textarea className="input min-h-24" value={form[c.name] ?? ''} required={c.required} onChange={(e) => set(c.name, e.target.value)} />
                  ) : c.type === 'select' ? (
                    <select className="input" value={form[c.name] ?? ''} required={c.required} onChange={(e) => set(c.name, e.target.value)}>
                      {c.options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                    </select>
                  ) : (
                    <input className="input" type={c.type || 'text'} step={c.type === 'number' ? '0.01' : undefined} value={form[c.name] ?? ''}
                      required={c.required && !(c.type === 'password' && form.id)} placeholder={c.placeholder}
                      onChange={(e) => set(c.name, e.target.value)} />
                  )}
                </Campo>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={() => setForm(null)}>Cancelar</button>
              <button className="btn-primary" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar'}</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
