-- ============================================================================
-- FERRETERIA POS - DATA SEEDS INICIALES
-- Base de Datos: PostgreSQL
-- Descripción: Datos iniciales para begin el sistema
-- ============================================================================

-- ============================================================================
-- INSERTAR USUARIOS INICIALES
-- ============================================================================

-- Usuario Admin (contraseña: Admin@123 - CAMBIAR EN PRODUCCIÓN)
INSERT INTO usuarios (
  email, nombre, apellido, tipo_documento, numero_documento, 
  telefono, rol, estado, contrasena_hash
) VALUES (
  'admin@ferreteria.com',
  'Gerardo',
  'Ferretero',
  'DNI',
  '12345678',
  '987654321',
  'ADMIN',
  'ACTIVO',
  '$2b$10$WNXrRoXxPVhkk/UofEH/K.Lg5gfDbR.gL/2E0u0d1bRAJHzLC8cS6'
);

-- Usuario Gerente
INSERT INTO usuarios (
  email, nombre, apellido, tipo_documento, numero_documento, 
  telefono, rol, estado, contrasena_hash
) VALUES (
  'gerente@ferreteria.com',
  'Carlos',
  'Manager',
  'DNI',
  '87654321',
  '987654322',
  'GERENTE',
  'ACTIVO',
  '$2b$10$WNXrRoXxPVhkk/UofEH/K.Lg5gfDbR.gL/2E0u0d1bRAJHzLC8cS6'
);

-- Usuario Vendedor 1
INSERT INTO usuarios (
  email, nombre, apellido, tipo_documento, numero_documento, 
  telefono, rol, estado, contrasena_hash
) VALUES (
  'vendedor1@ferreteria.com',
  'Juan',
  'Pérez',
  'DNI',
  '11111111',
  '987654323',
  'VENDEDOR',
  'ACTIVO',
  '$2b$10$WNXrRoXxPVhkk/UofEH/K.Lg5gfDbR.gL/2E0u0d1bRAJHzLC8cS6'
);

-- Usuario Almacenero
INSERT INTO usuarios (
  email, nombre, apellido, tipo_documento, numero_documento, 
  telefono, rol, estado, contrasena_hash
) VALUES (
  'almacen@ferreteria.com',
  'Miguel',
  'Rodríguez',
  'DNI',
  '22222222',
  '987654324',
  'ALMACENERO',
  'ACTIVO',
  '$2b$10$WNXrRoXxPVhkk/UofEH/K.Lg5gfDbR.gL/2E0u0d1bRAJHzLC8cS6'
);

-- ============================================================================
-- INSERTAR CATEGORÍAS
-- ============================================================================

INSERT INTO categorias (nombre, descripcion, slug, orden_visualizacion, creado_por)
SELECT 'Herramientas Manuales', 'Herramientas de mano para trabajos diversos', 'herramientas-manuales', 1, 
  (SELECT id FROM usuarios WHERE email = 'admin@ferreteria.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE slug = 'herramientas-manuales');

INSERT INTO categorias (nombre, descripcion, slug, orden_visualizacion, creado_por)
SELECT 'Materiales de Construcción', 'Ladrillos, cemento, arena y similares', 'materiales-construccion', 2,
  (SELECT id FROM usuarios WHERE email = 'admin@ferreteria.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE slug = 'materiales-construccion');

INSERT INTO categorias (nombre, descripcion, slug, orden_visualizacion, creado_por)
SELECT 'Pinturas y Acabados', 'Pinturas, barnices y acabados', 'pinturas-acabados', 3,
  (SELECT id FROM usuarios WHERE email = 'admin@ferreteria.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE slug = 'pinturas-acabados');

INSERT INTO categorias (nombre, descripcion, slug, orden_visualizacion, creado_por)
SELECT 'Electricidad', 'Cables, alambres, interruptores y material eléctrico', 'electricidad', 4,
  (SELECT id FROM usuarios WHERE email = 'admin@ferreteria.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE slug = 'electricidad');

INSERT INTO categorias (nombre, descripcion, slug, orden_visualizacion, creado_por)
SELECT 'Tuberías y Accesorios', 'PVC, cobre, accesorios de tubería', 'tuberias-accesorios', 5,
  (SELECT id FROM usuarios WHERE email = 'admin@ferreteria.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE slug = 'tuberias-accesorios');

INSERT INTO categorias (nombre, descripcion, slug, orden_visualizacion, creado_por)
SELECT 'Ferretería General', 'Clavos, tornillos, pernos y accesorios variados', 'ferreteria-general', 6,
  (SELECT id FROM usuarios WHERE email = 'admin@ferreteria.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE slug = 'ferreteria-general');

-- ============================================================================
-- INSERTAR PROVEEDORES
-- ============================================================================

INSERT INTO proveedores (
  nombre, tipo_documento, numero_documento, contacto_nombre, contacto_email,
  direccion, ciudad, departamento, telefono, email, dias_entrega, creado_por
) VALUES (
  'Constructora Central S.A.C.',
  'RUC',
  '20123456789',
  'Roberto Flores',
  'ventas@constructoracentral.pe',
  'Av. Industrial 450, Lima',
  'Lima',
  'Lima',
  '01-2456789',
  'contacto@constructoracentral.pe',
  3,
  (SELECT id FROM usuarios WHERE email = 'admin@ferreteria.com' LIMIT 1)
)
ON CONFLICT (numero_documento) DO NOTHING;

INSERT INTO proveedores (
  nombre, tipo_documento, numero_documento, contacto_nombre, contacto_email,
  direccion, ciudad, departamento, telefono, email, dias_entrega, creado_por
) VALUES (
  'Distribuidora Nacional de Materiales',
  'RUC',
  '20234567890',
  'Patricia González',
  'despachos@dnamdm.com',
  'Jr. Comercio 123, Lima',
  'Lima',
  'Lima',
  '01-3456789',
  'info@dnamdm.com',
  2,
  (SELECT id FROM usuarios WHERE email = 'admin@ferreteria.com' LIMIT 1)
)
ON CONFLICT (numero_documento) DO NOTHING;

INSERT INTO proveedores (
  nombre, tipo_documento, numero_documento, contacto_nombre, contacto_email,
  direccion, ciudad, departamento, telefono, email, dias_entrega, creado_por
) VALUES (
  'Químicos y Pinturas Industrial',
  'RUC',
  '20345678901',
  'Alexander Mendez',
  'ventas@quipindustrial.com',
  'Km. 12 Panamericana Sur, Lima',
  'Lima',
  'Lima',
  '01-4567890',
  'contacto@quipindustrial.com',
  2,
  (SELECT id FROM usuarios WHERE email = 'admin@ferreteria.com' LIMIT 1)
)
ON CONFLICT (numero_documento) DO NOTHING;

-- ============================================================================
-- INSERTAR PRODUCTOS DE EJEMPLO
-- ============================================================================

-- Herramientas
INSERT INTO productos (
  codigo_producto, nombre, descripcion, categoria_id,
  precio_costo, precio_venta, margen_ganancia,
  stock_actual, stock_minimo, stock_maximo, creado_por
) VALUES (
  'MART-001',
  'Martillo de Garra 1000g',
  'Martillo de acero forjado con mango de madera',
  (SELECT id FROM categorias WHERE slug = 'herramientas-manuales' LIMIT 1),
  15.00, 25.00, 66.67,
  50, 10, 200,
  (SELECT id FROM usuarios WHERE email = 'admin@ferreteria.com' LIMIT 1)
)
ON CONFLICT (codigo_producto) DO NOTHING;

-- Materiales de Construcción
INSERT INTO productos (
  codigo_producto, nombre, descripcion, categoria_id,
  precio_costo, precio_venta, margen_ganancia,
  unidad_medida, stock_actual, stock_minimo, stock_maximo, creado_por
) VALUES (
  'LADRIL-001',
  'Ladrillo 6 Huecos King Kong',
  'Ladrillo de arcilla cocida para construcción',
  (SELECT id FROM categorias WHERE slug = 'materiales-construccion' LIMIT 1),
  0.80, 1.20, 50.00,
  'DOCENA',
  120, 50, 500,
  (SELECT id FROM usuarios WHERE email = 'admin@ferreteria.com' LIMIT 1)
)
ON CONFLICT (codigo_producto) DO NOTHING;

INSERT INTO productos (
  codigo_producto, nombre, descripcion, categoria_id,
  precio_costo, precio_venta, margen_ganancia,
  unidad_medida, stock_actual, stock_minimo, stock_maximo, creado_por
) VALUES (
  'CEME-001',
  'Cemento Portland Tipo I - 42.5kg',
  'Cemento de alta resistencia para construcción',
  (SELECT id FROM categorias WHERE slug = 'materiales-construccion' LIMIT 1),
  18.50, 22.00, 18.92,
  'BOLSA',
  200, 50, 1000,
  (SELECT id FROM usuarios WHERE email = 'admin@ferreteria.com' LIMIT 1)
)
ON CONFLICT (codigo_producto) DO NOTHING;

-- Pinturas
INSERT INTO productos (
  codigo_producto, nombre, descripcion, categoria_id,
  precio_costo, precio_venta, margen_ganancia,
  unidad_medida, stock_actual, stock_minimo, stock_maximo, creado_por
) VALUES (
  'PINT-001',
  'Pintura Latex Blanca - 4 litros',
  'Pintura de látex para interior, acabado mate',
  (SELECT id FROM categorias WHERE slug = 'pinturas-acabados' LIMIT 1),
  28.00, 45.00, 60.71,
  'GALON',
  80, 20, 300,
  (SELECT id FROM usuarios WHERE email = 'admin@ferreteria.com' LIMIT 1)
)
ON CONFLICT (codigo_producto) DO NOTHING;

-- Accesorios de Ferretería
INSERT INTO productos (
  codigo_producto, nombre, descripcion, categoria_id,
  precio_costo, precio_venta, margen_ganancia,
  unidad_medida, stock_actual, stock_minimo, stock_maximo, creado_por
) VALUES (
  'CLAVO-001',
  'Clavos Galvanizados 3"',
  'Clavos de acero galvanizado, paquete de 1kg',
  (SELECT id FROM categorias WHERE slug = 'ferreteria-general' LIMIT 1),
  3.50, 6.00, 71.43,
  'KG',
  300, 100, 1000,
  (SELECT id FROM usuarios WHERE email = 'admin@ferreteria.com' LIMIT 1)
)
ON CONFLICT (codigo_producto) DO NOTHING;

INSERT INTO productos (
  codigo_producto, nombre, descripcion, categoria_id,
  precio_costo, precio_venta, margen_ganancia,
  unidad_medida, stock_actual, stock_minimo, stock_maximo, creado_por
) VALUES (
  'TORN-001',
  'Tornillos Madera 2½" x 1/4"',
  'Tornillos de madera con cabeza Phillips, caja de 100 unidades',
  (SELECT id FROM categorias WHERE slug = 'ferreteria-general' LIMIT 1),
  5.00, 8.50, 70.00,
  'CAJA',
  150, 50, 500,
  (SELECT id FROM usuarios WHERE email = 'admin@ferreteria.com' LIMIT 1)
)
ON CONFLICT (codigo_producto) DO NOTHING;

-- ============================================================================
-- FIN DEL SEED
-- ============================================================================
