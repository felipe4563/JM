# JM Seguridad y Tecnología — Sistema web de catálogo

Catálogo público de cámaras de seguridad + panel administrativo.

| Parte | Tecnología |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express (API REST) |
| Base de datos | MySQL / MariaDB (XAMPP) |
| Seguridad | JWT + bcrypt |
| Fotografías | Multer (se guardan en `backend/uploads/`) |

## Estructura

```
SISTEMA JM/
├── database/jm_seguridad.sql   ← tablas + datos de ejemplo
├── backend/                    ← API (puerto 4000)
│   └── src/
│       ├── server.js
│       ├── db.js
│       ├── middleware.js       ← JWT y carga de imágenes
│       └── routes/ (public.js, auth.js, admin.js)
└── frontend/                   ← React (puerto 5173)
    └── src/
        ├── pages/Catalogo.jsx  ← catálogo público
        ├── pages/admin/        ← panel administrativo
        └── config.js           ← WhatsApp, dirección, horario
```

## Cómo ejecutarlo

1. **Encender MySQL** en el panel de XAMPP (botón *Start* de MySQL; Apache no es necesario).
2. **Importar la base de datos**: en phpMyAdmin → *Importar* → `database/jm_seguridad.sql`
   (o por consola: `C:\xampp\mysql\bin\mysql -u root < database\jm_seguridad.sql`).
3. **Backend** (en una terminal):
   ```
   cd backend
   npm install
   npm run dev
   ```
4. **Frontend** (en otra terminal):
   ```
   cd frontend
   npm install
   npm run dev
   ```
5. Abrir **http://localhost:5173**

- Catálogo público: `http://localhost:5173/`
- Panel administrativo: `http://localhost:5173/admin`
  Usuario: **admin** · Contraseña: **admin123**

> Si tu MySQL tiene contraseña, edítala en `backend/.env` (`DB_PASSWORD`).
> Para cambiar el número de WhatsApp y los datos de contacto, edita `frontend/src/config.js`.

## Paleta de colores (extraída del logotipo)

| Color | Hex | Uso |
|---|---|---|
| Azul marino | `#071A3D` | Encabezados, menú lateral, fondos oscuros |
| Azul JM | `#1366E8` | Color principal: botones, precios, enlaces |
| Cian eléctrico | `#22C3FF` | Acentos, descuentos, detalles brillantes |
| Plateado | `#C5CDD8` | Bordes y textos secundarios |
| Fondo | `#F4F7FB` | Fondo general |

Tipografías: **Montserrat** (títulos) e **Inter** (texto).

## Tablas

`usuarios`, `categorias`, `productos`, `producto_imagenes`, `caracteristicas`, `kits`, `kit_detalles`, `servicios`, `promociones`.

Las promociones con un producto o kit asignado aplican su descuento automáticamente en el catálogo mientras estén vigentes.

*Los datos y precios son ilustrativos.*

## Despliegue en producción (camarasjm.rusoft.dev)

CI/CD con **GitHub Actions + ghcr.io**: GitHub construye las imágenes con cada push a `main`
y el VPS solo las descarga (no gasta RAM ni CPU en builds).

| Archivo | Qué hace |
|---|---|
| `.github/workflows/imagenes.yml` | Construye y publica `ghcr.io/felipe4563/camarasjm-api` y `camarasjm-web` |
| `docker-compose.yml` | MySQL 8 + API + web (nginx), con `image: ghcr.io/...:${TAG:-latest}` |
| `deploy.sh` | `git pull`, `docker compose pull`, `up -d` y limpieza de imágenes viejas |
| `nginx/camarasjm.rusoft.dev.conf` | Plantilla para el nginx del VPS |
| `.env.example` | Contraseñas de MySQL, `JWT_SECRET` y puerto (copiar a `.env` en el VPS) |

```
internet → nginx del VPS (HTTPS) → 127.0.0.1:3120 → contenedor web (React)
                                                      ├─ /api      → contenedor api → mysql
                                                      └─ /uploads  → contenedor api (volumen uploads_data)
```

- La base se crea **la primera vez** desde `database/jm_seguridad.sql` (volumen `mysql_data` vacío).
  No hay migraciones automáticas: los cambios de tablas se aplican a mano.
- Las fotos viven en el volumen `uploads_data`, no dentro de las imágenes.

**Uso diario:** `git push` → en el VPS `bash deploy.sh`.
**Volver a una versión anterior:** `TAG=<sha del commit> docker compose up -d`.
