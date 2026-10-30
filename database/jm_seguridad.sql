-- =====================================================
--  JM Seguridad y Tecnología - Base de datos
--  Importar en phpMyAdmin (XAMPP) o con:
--  mysql -u root < jm_seguridad.sql
-- =====================================================

SET NAMES utf8mb4;
DROP DATABASE IF EXISTS jm_seguridad;
CREATE DATABASE jm_seguridad CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE jm_seguridad;

-- ---------- Usuarios ----------
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  usuario VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Usuario inicial: admin / admin123 (contraseña cifrada con bcrypt)
INSERT INTO usuarios (nombre, usuario, password) VALUES ('Administrador', 'admin', '$2b$10$RHu3GFshV.iKufTH2M.9u.EA/VPDi3x9iAVpusNeYFaCuJADI95iW');

-- ---------- Categorías ----------
CREATE TABLE categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255),
  tipo ENUM('camara','accesorio') NOT NULL DEFAULT 'camara',
  activo TINYINT(1) NOT NULL DEFAULT 1
);

-- ---------- Productos ----------
CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  categoria_id INT NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  modelo VARCHAR(50),
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL DEFAULT 0,
  destacado TINYINT(1) NOT NULL DEFAULT 0,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

CREATE TABLE producto_imagenes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  ruta VARCHAR(255) NOT NULL,
  orden INT NOT NULL DEFAULT 0,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

CREATE TABLE caracteristicas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  valor VARCHAR(150) NOT NULL,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

-- ---------- Kits ----------
CREATE TABLE kits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  cantidad_camaras INT NOT NULL DEFAULT 0,
  precio DECIMAL(10,2) NOT NULL DEFAULT 0,
  imagen VARCHAR(255),
  activo TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE kit_detalles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kit_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  FOREIGN KEY (kit_id) REFERENCES kits(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

-- ---------- Servicios ----------
CREATE TABLE servicios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  descripcion VARCHAR(255),
  icono VARCHAR(50) DEFAULT 'wrench',
  precio_referencial DECIMAL(10,2) NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1
);

-- ---------- Promociones ----------
CREATE TABLE promociones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  descripcion VARCHAR(255),
  descuento DECIMAL(5,2) NOT NULL DEFAULT 0,      -- porcentaje
  producto_id INT NULL,
  kit_id INT NULL,
  fecha_inicio DATE NULL,
  fecha_fin DATE NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE SET NULL,
  FOREIGN KEY (kit_id) REFERENCES kits(id) ON DELETE SET NULL
);

-- =====================================================
--  DATOS DE EJEMPLO (ilustrativos)
-- =====================================================
INSERT INTO categorias (nombre, descripcion, tipo) VALUES
('Cámara Domo',  'Ideal para interiores y oficinas. Diseño discreto.', 'camara'),
('Cámara Bala',  'Para patios, entradas y exteriores. Mayor alcance.', 'camara'),
('Cámara PTZ',   'Gira, inclina y hace zoom. Ideal para grandes espacios.', 'camara'),
('Cámara IP',    'Se conecta a la red. Alta definición y acceso remoto.', 'camara'),
('Cámara Wi-Fi', 'Conexión inalámbrica, fácil de instalar.', 'camara'),
('Cámara Dual',  'Dos lentes en un solo equipo. Mayor cobertura.', 'camara'),
('Grabadores y almacenamiento', 'DVR, NVR y discos duros.', 'accesorio'),
('Cableado y conectores', 'Cable UTP, conectores BNC y más.', 'accesorio'),
('Redes', 'Switch PoE y routers.', 'accesorio'),
('Energía', 'Fuentes de poder.', 'accesorio'),
('Monitores y soportes', 'Monitores, canaletas y soportes.', 'accesorio');

INSERT INTO productos (categoria_id, nombre, modelo, descripcion, precio, destacado) VALUES
(1, 'Domo 2MP',     'JM-DC2',  'Cámara domo discreta para interiores, oficinas y tiendas.', 350, 1),
(2, 'Bala 4MP',     'JM-BC4',  'Cámara bala resistente al agua para exteriores.', 480, 1),
(3, 'PTZ 5MP',      'JM-PTZ5', 'Cámara motorizada con giro 360° y zoom óptico.', 1250, 1),
(4, 'IP 4MP PoE',   'JM-IP4',  'Cámara IP con alimentación PoE y acceso remoto desde el celular.', 550, 0),
(5, 'IP Wi-Fi 3MP', 'JM-WF3',  'Cámara inalámbrica con audio bidireccional para casas y oficinas.', 620, 1),
(6, 'Dual 4MP',     'JM-DU4',  'Dos lentes en un solo equipo para visión panorámica.', 780, 1),
(7, 'DVR / NVR 8 canales', 'JM-NVR8', 'Grabador para sistemas de hasta 8 cámaras.', 950, 0),
(7, 'Disco duro 1TB', 'HDD-1TB', 'Disco duro especial para videovigilancia.', 450, 0),
(8, 'Cable UTP (100 m)', 'UTP-100', 'Rollo de cable UTP categoría 6.', 280, 0),
(8, 'Conectores BNC', 'BNC-01', 'Conector BNC para cable coaxial.', 15, 0),
(9, 'Switch PoE 8 puertos', 'SW-POE8', 'Alimenta y conecta cámaras IP por un solo cable.', 320, 0),
(10,'Fuente de poder 12V', 'PSU-12', 'Fuente de alimentación para cámaras.', 120, 0),
(11,'Monitor 22"', 'MON-22', 'Monitor Full HD para visualizar las cámaras.', 1250, 0),
(9, 'Router', 'RT-AC', 'Router inalámbrico doble banda.', 320, 0),
(11,'Canaletas y soportes', 'CAN-01', 'Canaletas y soportes para una instalación ordenada.', 80, 0);

INSERT INTO caracteristicas (producto_id, nombre, valor) VALUES
(1,'Resolución','1080p (2 MP)'), (1,'Visión nocturna','20 m'), (1,'Detección de movimiento','Sí'), (1,'Uso','Interior'),
(2,'Resolución','4 MP'), (2,'Visión nocturna','30 m'), (2,'Protección','IP67 resistente al agua'), (2,'Uso','Exterior'),
(3,'Resolución','5 MP'), (3,'Movimiento','360° / Zoom 10x'), (3,'Seguimiento de movimiento','Sí'), (3,'Uso','Exterior / Interior'),
(4,'Resolución','4 MP'), (4,'Conexión','Red cableada PoE'), (4,'Acceso remoto','App en el celular'), (4,'Uso','Exterior / Interior'),
(5,'Resolución','3 MP'), (5,'Conexión','Wi-Fi'), (5,'Audio','Bidireccional'), (5,'Uso','Interior'),
(6,'Lentes','Dos lentes'), (6,'Visión','Panorámica'), (6,'Detección de movimiento','Sí'), (6,'Uso','Exterior'),
(7,'Canales','8'), (7,'Salida','HDMI / VGA'),
(8,'Capacidad','1 TB'),
(9,'Longitud','100 m'), (9,'Categoría','Cat 6'),
(11,'Puertos','8 PoE'),
(13,'Tamaño','22 pulgadas'), (13,'Resolución','Full HD');

INSERT INTO kits (nombre, descripcion, cantidad_camaras, precio) VALUES
('Kit Básico',     '2 cámaras HD, DVR/NVR, disco duro de 1 TB y accesorios.', 2, 1850),
('Kit Familiar',   '4 cámaras HD, DVR/NVR, disco duro de 1 TB y accesorios.', 4, 2950),
('Kit Avanzado',   '8 cámaras HD, DVR/NVR, disco duro de 2 TB y accesorios.', 8, 4850),
('Kit Empresarial','16 cámaras HD, DVR/NVR, disco duro de 4 TB y accesorios.', 16, 8950);

INSERT INTO kit_detalles (kit_id, producto_id, cantidad) VALUES
(1,1,2),(1,7,1),(1,8,1),(1,12,1),
(2,1,2),(2,2,2),(2,7,1),(2,8,1),(2,12,1),
(3,1,4),(3,2,4),(3,7,1),(3,8,2),(3,9,1),
(4,1,8),(4,2,8),(4,7,2),(4,8,4),(4,9,2),(4,11,2);

INSERT INTO servicios (nombre, descripcion, icono) VALUES
('Instalación de cámaras', 'Instalación profesional de cámaras de seguridad en hogares y negocios.', 'cctv'),
('Configuración en celulares y computadoras', 'Te dejamos tus cámaras listas para verlas desde cualquier lugar.', 'smartphone'),
('Mantenimiento preventivo y correctivo', 'Revisión, limpieza y ajuste de tu sistema de vigilancia.', 'wrench'),
('Reparación de sistemas de vigilancia', 'Diagnóstico y reparación de cámaras, DVR y cableado.', 'shield-check'),
('Venta de equipos tecnológicos', 'Cámaras, grabadores, redes y accesorios de calidad.', 'monitor'),
('Asesoramiento personalizado', 'Te ayudamos a elegir la mejor solución según tu necesidad.', 'headset');

INSERT INTO promociones (titulo, descripcion, descuento, producto_id, kit_id, fecha_inicio, fecha_fin) VALUES
('Descuento en Kit Familiar', 'Protege tu hogar con 4 cámaras y llévate un 10% de descuento.', 10, NULL, 2, '2026-01-01', '2026-12-31'),
('Domo 2MP en oferta', 'La cámara ideal para interiores con 5% de descuento.', 5, 1, NULL, '2026-01-01', '2026-12-31'),
('Paquetes con instalación incluida', 'Compra cualquier kit y la instalación corre por nuestra cuenta.', 0, NULL, NULL, NULL, NULL),
('Precios especiales para negocios', 'Tarifas especiales para hogares, tiendas y negocios.', 0, NULL, NULL, NULL, NULL);
