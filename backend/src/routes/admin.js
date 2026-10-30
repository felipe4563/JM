import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool, query } from '../db.js';
import { auth, upload, borrarArchivo, h } from '../middleware.js';

const r = Router();
r.use(auth);

// Toma solo los campos permitidos del body; '' se guarda como NULL
function pick(body, campos) {
  const out = {};
  for (const c of campos) if (c in body) out[c] = body[c] === '' ? null : body[c];
  return out;
}

// ---------- CRUD genérico para tablas simples ----------
function crud(tabla, campos, orden = 'id') {
  r.get(`/${tabla}`, h(async (req, res) => res.json(await query(`SELECT * FROM ${tabla} ORDER BY ${orden}`))));
  r.post(`/${tabla}`, h(async (req, res) => {
    const result = await query(`INSERT INTO ${tabla} SET ?`, [pick(req.body, campos)]);
    res.status(201).json({ id: result.insertId });
  }));
  r.put(`/${tabla}/:id`, h(async (req, res) => {
    await query(`UPDATE ${tabla} SET ? WHERE id = ?`, [pick(req.body, campos), req.params.id]);
    res.json({ ok: true });
  }));
  r.delete(`/${tabla}/:id`, h(async (req, res) => {
    await query(`DELETE FROM ${tabla} WHERE id = ?`, [req.params.id]);
    res.json({ ok: true });
  }));
}

// ---------- Dashboard ----------
r.get('/dashboard', h(async (req, res) => {
  const [totales] = await query(`SELECT
    (SELECT COUNT(*) FROM productos p JOIN categorias c ON c.id = p.categoria_id WHERE c.tipo = 'camara') AS camaras,
    (SELECT COUNT(*) FROM productos p JOIN categorias c ON c.id = p.categoria_id WHERE c.tipo = 'accesorio') AS accesorios,
    (SELECT COUNT(*) FROM categorias) AS categorias,
    (SELECT COUNT(*) FROM kits) AS kits,
    (SELECT COUNT(*) FROM servicios) AS servicios,
    (SELECT COUNT(*) FROM promociones WHERE activo = 1) AS promociones`);
  const porCategoria = await query(`
    SELECT c.nombre, c.tipo, COUNT(p.id) AS total FROM categorias c
    LEFT JOIN productos p ON p.categoria_id = c.id GROUP BY c.id ORDER BY c.tipo, c.id`);
  const recientes = await query(`
    SELECT p.id, p.nombre, p.modelo, p.precio, c.nombre AS categoria FROM productos p
    JOIN categorias c ON c.id = p.categoria_id ORDER BY p.id DESC LIMIT 5`);
  res.json({ totales, porCategoria, recientes });
}));

// ---------- Categorías ----------
r.delete('/categorias/:id', h(async (req, res, next) => {
  const [{ total }] = await query('SELECT COUNT(*) AS total FROM productos WHERE categoria_id = ?', [req.params.id]);
  if (total > 0) return res.status(400).json({ error: `La categoría tiene ${total} producto(s). Desactívala en lugar de eliminarla.` });
  next();
}));
crud('categorias', ['nombre', 'descripcion', 'tipo', 'activo'], 'tipo, id');

// ---------- Servicios y promociones ----------
crud('servicios', ['nombre', 'descripcion', 'icono', 'precio_referencial', 'activo']);
crud('promociones', ['titulo', 'descripcion', 'descuento', 'producto_id', 'kit_id', 'fecha_inicio', 'fecha_fin', 'activo'], 'id DESC');

// ---------- Productos ----------
const CAMPOS_PRODUCTO = ['categoria_id', 'nombre', 'modelo', 'descripcion', 'precio', 'destacado', 'activo'];

r.get('/productos', h(async (req, res) => {
  const params = [];
  let where = '';
  if (req.query.tipo) { where = 'WHERE c.tipo = ?'; params.push(req.query.tipo); }
  res.json(await query(`
    SELECT p.*, c.nombre AS categoria, c.tipo,
      (SELECT ruta FROM producto_imagenes i WHERE i.producto_id = p.id ORDER BY orden, id LIMIT 1) AS imagen
    FROM productos p JOIN categorias c ON c.id = p.categoria_id ${where} ORDER BY p.id DESC`, params));
}));

r.get('/productos/:id', h(async (req, res) => {
  const [producto] = await query('SELECT * FROM productos WHERE id = ?', [req.params.id]);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
  producto.imagenes = await query('SELECT * FROM producto_imagenes WHERE producto_id = ? ORDER BY orden, id', [producto.id]);
  producto.caracteristicas = await query('SELECT * FROM caracteristicas WHERE producto_id = ? ORDER BY id', [producto.id]);
  res.json(producto);
}));

async function guardarCaracteristicas(conn, productoId, lista) {
  if (!Array.isArray(lista)) return;
  await conn.query('DELETE FROM caracteristicas WHERE producto_id = ?', [productoId]);
  const filas = lista.filter((c) => c.nombre?.trim() && c.valor?.trim()).map((c) => [productoId, c.nombre.trim(), c.valor.trim()]);
  if (filas.length) await conn.query('INSERT INTO caracteristicas (producto_id, nombre, valor) VALUES ?', [filas]);
}

r.post('/productos', h(async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query('INSERT INTO productos SET ?', [pick(req.body, CAMPOS_PRODUCTO)]);
    await guardarCaracteristicas(conn, result.insertId, req.body.caracteristicas);
    await conn.commit();
    res.status(201).json({ id: result.insertId });
  } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
}));

r.put('/productos/:id', h(async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('UPDATE productos SET ? WHERE id = ?', [pick(req.body, CAMPOS_PRODUCTO), req.params.id]);
    await guardarCaracteristicas(conn, req.params.id, req.body.caracteristicas);
    await conn.commit();
    res.json({ ok: true });
  } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
}));

r.delete('/productos/:id', h(async (req, res) => {
  const imagenes = await query('SELECT ruta FROM producto_imagenes WHERE producto_id = ?', [req.params.id]);
  await query('DELETE FROM productos WHERE id = ?', [req.params.id]);
  imagenes.forEach((i) => borrarArchivo(i.ruta));
  res.json({ ok: true });
}));

// ---------- Fotografías ----------
r.post('/productos/:id/imagenes', upload.array('imagenes', 8), h(async (req, res) => {
  const filas = (req.files || []).map((f, i) => [req.params.id, `/uploads/${f.filename}`, i]);
  if (filas.length) await query('INSERT INTO producto_imagenes (producto_id, ruta, orden) VALUES ?', [filas]);
  res.status(201).json({ subidas: filas.length });
}));

r.delete('/imagenes/:id', h(async (req, res) => {
  const [img] = await query('SELECT * FROM producto_imagenes WHERE id = ?', [req.params.id]);
  if (img) {
    await query('DELETE FROM producto_imagenes WHERE id = ?', [img.id]);
    borrarArchivo(img.ruta);
  }
  res.json({ ok: true });
}));

// ---------- Kits ----------
const CAMPOS_KIT = ['nombre', 'descripcion', 'cantidad_camaras', 'precio', 'activo'];

r.get('/kits', h(async (req, res) => {
  const kits = await query('SELECT * FROM kits ORDER BY cantidad_camaras, id');
  const det = await query(`SELECT d.*, p.nombre FROM kit_detalles d JOIN productos p ON p.id = d.producto_id ORDER BY d.id`);
  for (const k of kits) k.detalles = det.filter((d) => d.kit_id === k.id);
  res.json(kits);
}));

async function guardarDetalles(conn, kitId, detalles) {
  if (!Array.isArray(detalles)) return;
  await conn.query('DELETE FROM kit_detalles WHERE kit_id = ?', [kitId]);
  const filas = detalles.filter((d) => d.producto_id).map((d) => [kitId, d.producto_id, Math.max(1, Number(d.cantidad) || 1)]);
  if (filas.length) await conn.query('INSERT INTO kit_detalles (kit_id, producto_id, cantidad) VALUES ?', [filas]);
}

r.post('/kits', h(async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query('INSERT INTO kits SET ?', [pick(req.body, CAMPOS_KIT)]);
    await guardarDetalles(conn, result.insertId, req.body.detalles);
    await conn.commit();
    res.status(201).json({ id: result.insertId });
  } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
}));

r.put('/kits/:id', h(async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('UPDATE kits SET ? WHERE id = ?', [pick(req.body, CAMPOS_KIT), req.params.id]);
    await guardarDetalles(conn, req.params.id, req.body.detalles);
    await conn.commit();
    res.json({ ok: true });
  } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
}));

r.delete('/kits/:id', h(async (req, res) => {
  const [kit] = await query('SELECT imagen FROM kits WHERE id = ?', [req.params.id]);
  await query('DELETE FROM kits WHERE id = ?', [req.params.id]);
  borrarArchivo(kit?.imagen);
  res.json({ ok: true });
}));

r.post('/kits/:id/imagen', upload.single('imagen'), h(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Selecciona una imagen' });
  const [kit] = await query('SELECT imagen FROM kits WHERE id = ?', [req.params.id]);
  await query('UPDATE kits SET imagen = ? WHERE id = ?', [`/uploads/${req.file.filename}`, req.params.id]);
  borrarArchivo(kit?.imagen);
  res.json({ ok: true });
}));

// ---------- Usuarios ----------
r.get('/usuarios', h(async (req, res) => {
  res.json(await query('SELECT id, nombre, usuario, activo, creado_en FROM usuarios ORDER BY id'));
}));

r.post('/usuarios', h(async (req, res) => {
  const { nombre, usuario, password } = req.body;
  if (!nombre || !usuario || !password) return res.status(400).json({ error: 'Completa nombre, usuario y contraseña' });
  const hash = await bcrypt.hash(password, 10);
  const result = await query('INSERT INTO usuarios (nombre, usuario, password, activo) VALUES (?, ?, ?, ?)', [nombre, usuario, hash, req.body.activo ?? 1]);
  res.status(201).json({ id: result.insertId });
}));

r.put('/usuarios/:id', h(async (req, res) => {
  const datos = pick(req.body, ['nombre', 'usuario', 'activo']);
  if (req.body.password) datos.password = await bcrypt.hash(req.body.password, 10);
  if (Number(req.params.id) === req.user.id && Number(datos.activo) === 0) {
    return res.status(400).json({ error: 'No puedes desactivar tu propio usuario' });
  }
  await query('UPDATE usuarios SET ? WHERE id = ?', [datos, req.params.id]);
  res.json({ ok: true });
}));

r.delete('/usuarios/:id', h(async (req, res) => {
  if (Number(req.params.id) === req.user.id) return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
  await query('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
}));

export default r;
