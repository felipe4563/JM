// Copia las fotos de productos y kits de tu PC (XAMPP) al sistema en producción.
//
// Uso (desde la carpeta backend, con MySQL de XAMPP encendido):
//   npm run subir-fotos -- https://camarasjm.rusoft.dev            → sube las fotos
//   npm run subir-fotos -- https://camarasjm.rusoft.dev --probar   → solo muestra qué haría
//   npm run subir-fotos -- https://camarasjm.rusoft.dev --forzar   → también a los que ya tienen foto
//
// Cómo empareja: productos por modelo (o por nombre si no tienen modelo) y kits por nombre.
// Por defecto se salta los que ya tienen foto en el servidor, así se puede correr varias veces
// sin duplicar nada.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';
import { query, pool } from '../src/db.js';
import { UPLOAD_DIR } from '../src/middleware.js';

const args = process.argv.slice(2);
const base = args.find((a) => a.startsWith('http'))?.replace(/\/+$/, '');
const probar = args.includes('--probar');
const forzar = args.includes('--forzar');

if (!base) {
  console.log('Falta la URL del servidor. Ejemplo:\n  npm run subir-fotos -- https://camarasjm.rusoft.dev');
  process.exit(1);
}

const TIPOS = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif', '.bmp': 'image/bmp' };
const clave = (s) => (s || '').trim().toLowerCase();

async function api(ruta, token, opciones = {}) {
  const res = await fetch(base + ruta, { ...opciones, headers: { ...opciones.headers, Authorization: `Bearer ${token}` } });
  const datos = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${ruta}: ${datos.error || res.status}`);
  return datos;
}

async function archivo(ruta) {
  const nombre = path.basename(ruta);
  const tipo = TIPOS[path.extname(nombre).toLowerCase()] || 'image/jpeg';
  return [new Blob([await readFile(path.join(UPLOAD_DIR, nombre))], { type: tipo }), nombre];
}

async function main() {
  // 1. Lo que hay en tu PC
  const productos = await query('SELECT id, nombre, modelo FROM productos');
  const imagenes = await query('SELECT producto_id, ruta FROM producto_imagenes ORDER BY orden, id');
  const kits = await query('SELECT nombre, imagen FROM kits WHERE imagen IS NOT NULL');
  for (const p of productos) p.imagenes = imagenes.filter((i) => i.producto_id === p.id).map((i) => i.ruta);

  // 2. Iniciar sesión en el servidor
  const rl = createInterface({ input: process.stdin });
  const lineas = rl[Symbol.asyncIterator]();
  const preguntar = async (texto) => { process.stdout.write(texto); return ((await lineas.next()).value ?? '').trim(); };
  const usuario = await preguntar('Usuario del panel en el servidor: ');
  const password = await preguntar('Contraseña: ');
  rl.close();
  const login = await fetch(`${base}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ usuario, password }),
  });
  const sesion = await login.json().catch(() => ({}));
  if (!login.ok) throw new Error(`No se pudo iniciar sesión: ${sesion.error || login.status}`);
  const token = sesion.token;

  const remotos = await api('/api/admin/productos', token);
  const kitsRemotos = await api('/api/admin/kits', token);
  const porModelo = new Map(remotos.map((p) => [clave(p.modelo || p.nombre), p]));
  const kitPorNombre = new Map(kitsRemotos.map((k) => [clave(k.nombre), k]));
  let subidas = 0;

  // 3. Fotos de productos
  console.log(`\n== Productos ${probar ? '(modo prueba, no se sube nada)' : ''}`);
  for (const p of productos.filter((x) => x.imagenes.length)) {
    const remoto = porModelo.get(clave(p.modelo || p.nombre));
    if (!remoto) { console.log(`  ✗ ${p.nombre}: no existe en el servidor`); continue; }
    if (remoto.imagen && !forzar) { console.log(`  = ${p.nombre}: ya tiene foto, se salta`); continue; }
    if (probar) { console.log(`  → ${p.nombre}: subiría ${p.imagenes.length} foto(s)`); continue; }
    const form = new FormData();
    for (const ruta of p.imagenes) form.append('imagenes', ...(await archivo(ruta)));
    await api(`/api/admin/productos/${remoto.id}/imagenes`, token, { method: 'POST', body: form });
    subidas += p.imagenes.length;
    console.log(`  ✓ ${p.nombre}: ${p.imagenes.length} foto(s)`);
  }

  // 4. Imagen de los kits
  console.log('\n== Kits');
  for (const k of kits) {
    const remoto = kitPorNombre.get(clave(k.nombre));
    if (!remoto) { console.log(`  ✗ ${k.nombre}: no existe en el servidor`); continue; }
    if (remoto.imagen && !forzar) { console.log(`  = ${k.nombre}: ya tiene imagen, se salta`); continue; }
    if (probar) { console.log(`  → ${k.nombre}: subiría la imagen`); continue; }
    const form = new FormData();
    form.append('imagen', ...(await archivo(k.imagen)));
    await api(`/api/admin/kits/${remoto.id}/imagen`, token, { method: 'POST', body: form });
    subidas += 1;
    console.log(`  ✓ ${k.nombre}`);
  }

  console.log(probar ? '\nModo prueba: no se subió nada.' : `\nListo: ${subidas} imagen(es) subidas a ${base}`);
}

main()
  .catch((e) => { console.error('\n❌', e.message); process.exitCode = 1; })
  .finally(() => pool.end());
