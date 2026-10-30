import { Router } from 'express';
import { query } from '../db.js';
import { h } from '../middleware.js';

const r = Router();

export const PROMO_VIGENTE = `pr.activo = 1
  AND (pr.fecha_inicio IS NULL OR pr.fecha_inicio <= CURDATE())
  AND (pr.fecha_fin IS NULL OR pr.fecha_fin >= CURDATE())`;

const SELECT_PRODUCTO = `
  SELECT p.*, c.nombre AS categoria, c.tipo,
    (SELECT ruta FROM producto_imagenes i WHERE i.producto_id = p.id ORDER BY orden, id LIMIT 1) AS imagen,
    (SELECT MAX(pr.descuento) FROM promociones pr WHERE pr.producto_id = p.id AND ${PROMO_VIGENTE}) AS descuento
  FROM productos p JOIN categorias c ON c.id = p.categoria_id`;

r.get('/categorias', h(async (req, res) => {
  res.json(await query(`
    SELECT c.*, (SELECT COUNT(*) FROM productos p WHERE p.categoria_id = c.id AND p.activo = 1) AS total
    FROM categorias c WHERE c.activo = 1 ORDER BY c.tipo, c.id`));
}));

r.get('/productos', h(async (req, res) => {
  const { q, categoria, tipo } = req.query;
  const where = ['p.activo = 1', 'c.activo = 1'];
  const params = [];
  if (q) { where.push('(p.nombre LIKE ? OR p.modelo LIKE ? OR p.descripcion LIKE ?)'); params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  if (categoria) { where.push('p.categoria_id = ?'); params.push(categoria); }
  if (tipo) { where.push('c.tipo = ?'); params.push(tipo); }
  const productos = await query(`${SELECT_PRODUCTO} WHERE ${where.join(' AND ')} ORDER BY p.destacado DESC, p.id`, params);

  // Características resumidas para las tarjetas
  if (productos.length) {
    const caracts = await query('SELECT * FROM caracteristicas WHERE producto_id IN (?) ORDER BY id', [productos.map((p) => p.id)]);
    for (const p of productos) p.caracteristicas = caracts.filter((c) => c.producto_id === p.id);
  }
  res.json(productos);
}));

r.get('/productos/:id', h(async (req, res) => {
  const [producto] = await query(`${SELECT_PRODUCTO} WHERE p.id = ? AND p.activo = 1`, [req.params.id]);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
  producto.imagenes = await query('SELECT * FROM producto_imagenes WHERE producto_id = ? ORDER BY orden, id', [producto.id]);
  producto.caracteristicas = await query('SELECT * FROM caracteristicas WHERE producto_id = ? ORDER BY id', [producto.id]);
  res.json(producto);
}));

r.get('/kits', h(async (req, res) => {
  const kits = await query(`
    SELECT k.*, (SELECT MAX(pr.descuento) FROM promociones pr WHERE pr.kit_id = k.id AND ${PROMO_VIGENTE}) AS descuento
    FROM kits k WHERE k.activo = 1 ORDER BY k.cantidad_camaras`);
  if (kits.length) {
    const det = await query(`
      SELECT d.kit_id, d.cantidad, p.nombre, p.modelo FROM kit_detalles d
      JOIN productos p ON p.id = d.producto_id WHERE d.kit_id IN (?) ORDER BY d.id`, [kits.map((k) => k.id)]);
    for (const k of kits) k.detalles = det.filter((d) => d.kit_id === k.id);
  }
  res.json(kits);
}));

r.get('/servicios', h(async (req, res) => {
  res.json(await query('SELECT * FROM servicios WHERE activo = 1 ORDER BY id'));
}));

r.get('/promociones', h(async (req, res) => {
  res.json(await query(`
    SELECT pr.*, p.nombre AS producto, k.nombre AS kit FROM promociones pr
    LEFT JOIN productos p ON p.id = pr.producto_id
    LEFT JOIN kits k ON k.id = pr.kit_id
    WHERE ${PROMO_VIGENTE} ORDER BY pr.descuento DESC, pr.id`));
}));

export default r;
