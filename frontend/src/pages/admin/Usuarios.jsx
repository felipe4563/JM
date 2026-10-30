import CrudSimple from '../../components/CrudSimple';
import { Estado } from '../../components/ui';

export default function Usuarios() {
  return (
    <CrudSimple
      titulo="Usuarios"
      descripcion="Personas con acceso al panel administrativo. Las contraseñas se guardan cifradas con bcrypt."
      ruta="/admin/usuarios"
      nuevoTexto="Nuevo usuario"
      inicial={{ nombre: '', usuario: '', password: '', activo: 1 }}
      prepararEdicion={(u) => ({ id: u.id, nombre: u.nombre, usuario: u.usuario, password: '' })}
      campos={[
        { name: 'nombre', label: 'Nombre completo', required: true, full: true },
        { name: 'usuario', label: 'Usuario', required: true },
        { name: 'password', label: 'Contraseña', type: 'password', required: true, placeholder: 'Dejar vacío para no cambiar' },
      ]}
      columnas={[
        { titulo: 'Nombre', render: (u) => <span className="font-semibold text-marino-900">{u.nombre}</span> },
        { titulo: 'Usuario', render: (u) => `@${u.usuario}` },
        { titulo: 'Creado', render: (u) => u.creado_en?.slice(0, 10) },
        { titulo: 'Estado', render: (u) => <Estado activo={u.activo} /> },
      ]}
    />
  );
}
