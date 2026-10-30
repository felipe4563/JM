import { useCallback, useEffect, useState } from 'react';
import {
  Cctv, Smartphone, Wrench, ShieldCheck, Monitor, Headset, Cable, Wifi, Camera, Router, HardDrive, X,
} from 'lucide-react';
import { api } from '../api';

// ---------- Carga de datos ----------
export function useApi(ruta) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const recargar = useCallback(() => {
    api(ruta).then(setData).catch((e) => setError(e.message));
  }, [ruta]);
  useEffect(recargar, [recargar]);
  return { data, error, recargar };
}

// ---------- Íconos de servicios ----------
export const ICONOS = {
  cctv: Cctv, smartphone: Smartphone, wrench: Wrench, 'shield-check': ShieldCheck,
  monitor: Monitor, headset: Headset, cable: Cable, wifi: Wifi, camera: Camera, router: Router, 'hard-drive': HardDrive,
};
export function IconoServicio({ nombre, ...props }) {
  const Icono = ICONOS[nombre] || Wrench;
  return <Icono {...props} />;
}

// ---------- Imagen con respaldo ----------
export function FotoProducto({ src, alt, tipo, className = '' }) {
  if (src) return <img src={src} alt={alt} className={`h-full w-full object-contain ${className}`} loading="lazy" />;
  const Icono = tipo === 'accesorio' ? HardDrive : Cctv;
  return (
    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-azul-50 to-plata-100 ${className}`}>
      <Icono className="h-14 w-14 text-azul-500/60" strokeWidth={1.4} />
    </div>
  );
}

// ---------- Modal ----------
export function Modal({ abierto, onClose, titulo, children, ancho = 'max-w-2xl' }) {
  useEffect(() => {
    if (!abierto) return;
    const esc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, [abierto, onClose]);
  if (!abierto) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-marino-950/60 p-2 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={onClose}>
      <div className={`card w-full ${ancho} my-2 sm:my-8`} onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        {titulo && (
          <div className="flex items-center justify-between border-b border-plata-100 px-4 py-4 sm:px-6">
            <h3 className="text-lg font-bold text-marino-900">{titulo}</h3>
            <button onClick={onClose} className="rounded-lg p-1.5 text-marino-700 hover:bg-plata-100" aria-label="Cerrar"><X size={20} /></button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function Campo({ label, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

export function Estado({ activo }) {
  return activo
    ? <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Activo</span>
    : <span className="rounded-full bg-plata-100 px-2.5 py-1 text-xs font-semibold text-marino-700/60">Inactivo</span>;
}

export function Alerta({ children }) {
  if (!children) return null;
  return <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{children}</div>;
}
