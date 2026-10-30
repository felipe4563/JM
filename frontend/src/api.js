// Cliente de la API REST. Las rutas /api y /uploads pasan por el proxy de Vite.
export const getToken = () => localStorage.getItem('jm_token');
export const getUser = () => JSON.parse(localStorage.getItem('jm_user') || 'null');

export function guardarSesion({ token, user }) {
  localStorage.setItem('jm_token', token);
  localStorage.setItem('jm_user', JSON.stringify(user));
}

export function cerrarSesion() {
  localStorage.removeItem('jm_token');
  localStorage.removeItem('jm_user');
}

export async function api(ruta, { method = 'GET', body, form } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';

  const res = await fetch(`/api${ruta}`, {
    method,
    headers,
    body: form ?? (body ? JSON.stringify(body) : undefined),
  });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && ruta.startsWith('/admin')) {
    cerrarSesion();
    window.location.href = '/admin/login';
  }
  if (!res.ok) throw new Error(data.error || 'Ocurrió un error');
  return data;
}

export const bs = (n) =>
  'Bs ' + Number(n || 0).toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export const conDescuento = (precio, descuento) =>
  descuento ? Math.round(precio * (1 - descuento / 100) * 100) / 100 : precio;
