import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { UPLOAD_DIR } from './middleware.js';
import publicRoutes from './routes/public.js';
import authRoutes, { crearAdminInicial } from './routes/auth.js';
import adminRoutes from './routes/admin.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// Manejador global de errores
app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Ese registro ya existe' });
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'La imagen supera los 10 MB' });
  res.status(err.status || 500).json({ error: err.message || 'Error en el servidor' });
});

const PORT = process.env.PORT || 4000;
// Reintenta la conexión: en Docker, MySQL puede tardar en estar listo la primera vez
for (let intento = 1; ; intento++) {
  try {
    await crearAdminInicial();
    break;
  } catch (e) {
    if (intento >= 20) {
      console.error('❌ No se pudo conectar a MySQL. ¿Encendiste MySQL en XAMPP e importaste database/jm_seguridad.sql?');
      console.error(e.message);
      process.exit(1);
    }
    console.log(`⏳ Esperando a MySQL (${e.code || e.message})... intento ${intento}/20`);
    await new Promise((r) => setTimeout(r, 3000));
  }
}
app.listen(PORT, () => console.log(`✅ API JM lista en http://localhost:${PORT}`));
