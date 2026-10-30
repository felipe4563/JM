import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { LogIn, ArrowLeft } from 'lucide-react';
import { api, getToken, guardarSesion } from '../../api';
import { Alerta, InputPassword } from '../../components/ui';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ usuario: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  if (getToken()) return <Navigate to="/admin" />;

  async function enviar(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      guardarSesion(await api('/auth/login', { method: 'POST', body: form }));
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-marino-900 p-4">
      <div className="grid-bg absolute inset-0" />
      <div className="absolute left-1/2 top-1/3 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-azul-600/30 blur-3xl" />
      <form onSubmit={enviar} className="card relative w-full max-w-sm p-8">
        <img src="/logo.png" alt="JM" className="mx-auto h-24 w-24 rounded-full ring-4 ring-azul-50" />
        <h1 className="mt-4 text-center text-xl font-extrabold text-marino-900">Panel administrativo</h1>
        <p className="text-center text-sm text-marino-700/60">JM Seguridad y Tecnología</p>
        <div className="mt-6 space-y-4">
          <Alerta>{error}</Alerta>
          <label className="block">
            <span className="label">Usuario</span>
            <input className="input" autoFocus required value={form.usuario} onChange={(e) => setForm({ ...form, usuario: e.target.value })} />
          </label>
          <label className="block">
            <span className="label">Contraseña</span>
            <InputPassword required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </label>
          <button className="btn-primary w-full py-3" disabled={cargando}>
            <LogIn size={18} /> {cargando ? 'Ingresando…' : 'Iniciar sesión'}
          </button>
        </div>
        <Link to="/" className="mt-6 flex items-center justify-center gap-1 text-sm text-marino-700/60 hover:text-azul-600">
          <ArrowLeft size={16} /> Volver al catálogo
        </Link>
      </form>
    </div>
  );
}
