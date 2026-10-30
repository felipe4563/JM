import { useEffect, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { api, bs, conDescuento } from '../api';
import { waLink } from '../config';
import { Modal, FotoProducto } from './ui';

export default function ProductoModal({ id, onClose }) {
  const [p, setP] = useState(null);
  const [foto, setFoto] = useState(0);

  useEffect(() => {
    setP(null);
    setFoto(0);
    if (id) api(`/public/productos/${id}`).then(setP).catch(onClose);
  }, [id]);

  return (
    <Modal abierto={!!id} onClose={onClose} ancho="max-w-4xl">
      {!p ? (
        <div className="h-96 animate-pulse rounded-2xl bg-plata-100" />
      ) : (
        <div className="relative grid md:grid-cols-2">
          <button onClick={onClose} className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 text-marino-800 shadow hover:bg-white" aria-label="Cerrar"><X size={20} /></button>
          <div className="rounded-t-2xl bg-plata-100 p-4 sm:p-6 md:rounded-l-2xl md:rounded-tr-none">
            <div className="aspect-[4/3] overflow-hidden rounded-xl bg-white md:aspect-square">
              <FotoProducto src={p.imagenes[foto]?.ruta} alt={p.nombre} tipo={p.tipo} />
            </div>
            {p.imagenes.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {p.imagenes.map((img, i) => (
                  <button key={img.id} onClick={() => setFoto(i)} className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white ring-2 ${i === foto ? 'ring-azul-600' : 'ring-transparent'}`}>
                    <img src={img.ruta} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col p-5 sm:p-8">
            <span className="self-start rounded-full bg-azul-50 px-3 py-1 text-xs font-semibold text-azul-700">{p.categoria}</span>
            <h3 className="mt-3 text-2xl font-extrabold text-marino-900">{p.nombre}</h3>
            {p.modelo && <p className="text-sm font-semibold tracking-wider text-azul-600">Modelo {p.modelo}</p>}
            {p.descripcion && <p className="mt-3 text-marino-700/80">{p.descripcion}</p>}

            {p.caracteristicas.length > 0 && (
              <div className="mt-5 overflow-hidden rounded-xl ring-1 ring-plata-300/70">
                <table className="w-full text-sm">
                  <tbody>
                    {p.caracteristicas.map((c, i) => (
                      <tr key={c.id} className={i % 2 ? 'bg-white' : 'bg-plata-100/60'}>
                        <td className="px-4 py-2.5 font-semibold text-marino-800">{c.nombre}</td>
                        <td className="px-4 py-2.5 text-marino-700/80">{c.valor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-auto pt-6">
              {p.descuento > 0 && (
                <p className="text-sm text-marino-700/60"><span className="line-through">{bs(p.precio)}</span> <span className="ml-1 font-bold text-azul-600">-{p.descuento}%</span></p>
              )}
              <p className="font-display text-4xl font-black text-azul-700">{bs(conDescuento(p.precio, p.descuento))}</p>
              <a href={waLink(`Hola JM, quiero consultar por: ${p.nombre}${p.modelo ? ` (${p.modelo})` : ''}.`)} target="_blank" rel="noreferrer" className="btn-wa mt-4 w-full py-3 text-base">
                <MessageCircle size={20} /> Consultar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
