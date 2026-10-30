import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { auth, h } from '../middleware.js';

const r = Router();

r.post('/login', h(async (req, res) => {
  const { usuario, password } = req.body;
  const [user] = await query('SELECT * FROM usuarios WHERE usuario = ? AND activo = 1', [usuario || '']);
  if (!user || !(await bcrypt.compare(password || '', user.password))) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }
  const token = jwt.sign({ id: user.id, usuario: user.usuario, nombre: user.nombre }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, user: { id: user.id, usuario: user.usuario, nombre: user.nombre } });
}));

r.get('/me', auth, (req, res) => res.json(req.user));

// Crea el administrador inicial si no existe ningún usuario
export async function crearAdminInicial() {
  const [{ total }] = await query('SELECT COUNT(*) AS total FROM usuarios');
  if (total === 0) {
    const hash = await bcrypt.hash('admin123', 10);
    await query('INSERT INTO usuarios (nombre, usuario, password) VALUES (?, ?, ?)', ['Administrador', 'admin', hash]);
    console.log('👤 Usuario inicial creado → usuario: admin | contraseña: admin123');
  }
}

export default r;
