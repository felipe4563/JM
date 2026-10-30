import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// ---------- Autenticación JWT ----------
export function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No autorizado' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Sesión expirada, inicia sesión de nuevo' });
  }
}

// ---------- Carga de imágenes (Multer) ----------
// Carpeta backend/uploads, sin importar desde dónde se inicie el servidor
export const UPLOAD_DIR = fileURLToPath(new URL('../uploads', import.meta.url));
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\/(jpeg|pjpeg|png|webp|gif|avif|bmp)$/.test(file.mimetype);
    if (ok) return cb(null, true);
    const err = new Error(`"${file.originalname}" no es una imagen válida. Usa JPG, PNG, WEBP, GIF o AVIF.`);
    err.status = 400;
    cb(err);
  },
});

export function borrarArchivo(ruta) {
  if (!ruta) return;
  const file = path.join(UPLOAD_DIR, path.basename(ruta));
  fs.promises.unlink(file).catch(() => {});
}

// Envuelve handlers async para enviar errores al manejador global
export const h = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
