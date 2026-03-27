-- ============================================================================
-- FERRETERIA POS - SCHEMA INICIAL
-- Base de Datos: PostgreSQL
-- Descripción: Estructura de tablas para Sistema de Punto de Venta
-- ============================================================================

-- Crear UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear ENUM types
CREATE TYPE user_role AS ENUM (
  'ADMIN',
  'GERENTE',
  'VENDEDOR',
  'ALMACENERO',
  'AUDITOR'
);

CREATE TYPE user_status AS ENUM (
  'ACTIVO',
  'INACTIVO',
  'SUSPENDIDO'
);

CREATE TYPE document_type AS ENUM (
  'DNI',
  'RUC',
  'PASAPORTE'
);

CREATE TYPE product_status AS ENUM (
  'ACTIVO',
  'INACTIVO',
  'DESCONTINUADO'
);

CREATE TYPE sale_status AS ENUM (
  'PENDIENTE',
  'COMPLETADA',
  'CANCELADA',
  'DEVUELTA'
);

CREATE TYPE payment_method AS ENUM (
  'EFECTIVO',
  'TARJETA_DEBITO',
  'TARJETA_CREDITO',
  'TRANSFERENCIA',
  'CHEQUE'
);

CREATE TYPE purchase_status AS ENUM (
  'PENDIENTE',
  'RECIBIDA',
  'DEVUELTA',
  'CANCELADA'
);

-- ============================================================================
-- TABLA: usuarios
-- Descripción: Gestión de usuarios y roles del sistema
-- ============================================================================
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  tipo_documento document_type NOT NULL,
  numero_documento VARCHAR(20) NOT NULL UNIQUE,
  telefono VARCHAR(20),
  direccion TEXT,
  rol user_role NOT NULL DEFAULT 'VENDEDOR',
  estado user_status NOT NULL DEFAULT 'ACTIVO',
  contrasena_hash VARCHAR(255) NOT NULL,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_ultimo_acceso TIMESTAMP,
  creado_por UUID,
  activo BOOLEAN NOT NULL DEFAULT true,
  FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ============================================================================
-- TABLA: categorias
-- Descripción: Categorías de productos
-- ============================================================================
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL UNIQUE,
  descripcion TEXT,
  slug VARCHAR(255) NOT NULL UNIQUE,
  imagen_url VARCHAR(500),
  estado product_status NOT NULL DEFAULT 'ACTIVO',
  orden_visualizacion INT DEFAULT 0,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  creado_por UUID NOT NULL,
  FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE RESTRICT
);

-- ============================================================================
-- TABLA: productos
-- Descripción: Catálogo de productos de la ferretería
-- ============================================================================
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_producto VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  categoria_id UUID NOT NULL,
  precio_costo DECIMAL(12, 2) NOT NULL,
  precio_venta DECIMAL(12, 2) NOT NULL,
  margen_ganancia DECIMAL(5, 2) NOT NULL,
  unidad_medida VARCHAR(20) NOT NULL DEFAULT 'UNIDAD',
  stock_actual INT NOT NULL DEFAULT 0,
  stock_minimo INT NOT NULL DEFAULT 10,
  stock_maximo INT NOT NULL DEFAULT 1000,
  sku VARCHAR(100) UNIQUE,
  codigo_barras VARCHAR(100) UNIQUE,
  imagen_url VARCHAR(500),
  estado product_status NOT NULL DEFAULT 'ACTIVO',
  es_compuesto BOOLEAN NOT NULL DEFAULT false,
  requiere_seguimiento_lote BOOLEAN NOT NULL DEFAULT false,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_ultimo_movimiento TIMESTAMP,
  creado_por UUID NOT NULL,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT,
  FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE RESTRICT
);

-- ============================================================================
-- TABLA: proveedores
-- Descripción: Información de proveedores
-- ============================================================================
CREATE TABLE proveedores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  tipo_documento document_type NOT NULL,
  numero_documento VARCHAR(20) NOT NULL UNIQUE,
  contacto_nombre VARCHAR(255),
  contacto_telefono VARCHAR(20),
  contacto_email VARCHAR(255),
  direccion TEXT NOT NULL,
  ciudad VARCHAR(100),
  departamento VARCHAR(100),
  pais VARCHAR(100) DEFAULT 'Perú',
  telefono VARCHAR(20),
  email VARCHAR(255),
  sitio_web VARCHAR(255),
  condiciones_pago VARCHAR(255),
  dias_entrega INT,
  cuenta_bancaria VARCHAR(50),
  estado user_status NOT NULL DEFAULT 'ACTIVO',
  es_acreedor BOOLEAN NOT NULL DEFAULT false,
  saldo_pendiente DECIMAL(12, 2) DEFAULT 0,
  limite_credito DECIMAL(12, 2),
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  creado_por UUID NOT NULL,
  FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE RESTRICT
);

-- ============================================================================
-- TABLA: compras
-- Descripción: Registro de compras a proveedores
-- ============================================================================
CREATE TABLE compras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_compra VARCHAR(20) NOT NULL UNIQUE,
  proveedor_id UUID NOT NULL,
  fecha_compra TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_entrega_esperada TIMESTAMP,
  fecha_entrega_real TIMESTAMP,
  numero_orden_compra VARCHAR(50),
  numero_factura VARCHAR(50),
  subtotal DECIMAL(12, 2) NOT NULL,
  igv DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL,
  descuento DECIMAL(12, 2) DEFAULT 0,
  estado purchase_status NOT NULL DEFAULT 'PENDIENTE',
  observaciones TEXT,
  creado_por UUID NOT NULL,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE RESTRICT,
  FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE RESTRICT
);

-- ============================================================================
-- TABLA: detalle_compras
-- Descripción: Ítems individuales de cada compra
-- ============================================================================
CREATE TABLE detalle_compras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  compra_id UUID NOT NULL,
  producto_id UUID NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(12, 2) NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  lote_id VARCHAR(100),
  fecha_vencimiento DATE,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT
);

-- ============================================================================
-- TABLA: lotes
-- Descripción: Seguimiento de lotes de productos
-- ============================================================================
CREATE TABLE lotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_lote VARCHAR(100) NOT NULL UNIQUE,
  producto_id UUID NOT NULL,
  cantidad_inicial INT NOT NULL,
  cantidad_disponible INT NOT NULL,
  fecha_fabricacion DATE,
  fecha_vencimiento DATE NOT NULL,
  proveedor_id UUID,
  compra_id UUID,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE SET NULL,
  FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE SET NULL
);

-- ============================================================================
-- TABLA: ventas
-- Descripción: Registro de transacciones de venta
-- ============================================================================
CREATE TABLE ventas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_venta VARCHAR(20) NOT NULL UNIQUE,
  numero_comprobante VARCHAR(50),
  tipo_comprobante VARCHAR(20) DEFAULT 'FACTURA',
  cliente_nombre VARCHAR(255),
  cliente_documento VARCHAR(20),
  fecha_venta TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  vendedor_id UUID NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  igv DECIMAL(12, 2) NOT NULL DEFAULT 0,
  descuento_total DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL,
  monto_pagado DECIMAL(12, 2) NOT NULL,
  vuelto DECIMAL(12, 2) DEFAULT 0,
  metodo_pago payment_method NOT NULL DEFAULT 'EFECTIVO',
  estado sale_status NOT NULL DEFAULT 'COMPLETADA',
  numero_referencia VARCHAR(100),
  observaciones TEXT,
  es_devolucion BOOLEAN NOT NULL DEFAULT false,
  venta_originalid UUID,
  fecha_cierre_caja TIMESTAMP,
  creado_por UUID,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendedor_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
  FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (venta_originalid) REFERENCES ventas(id) ON DELETE SET NULL
);

-- ============================================================================
-- TABLA: detalle_ventas
-- Descripción: Ítems individuales de cada venta
-- ============================================================================
CREATE TABLE detalle_ventas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venta_id UUID NOT NULL,
  producto_id UUID NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(12, 2) NOT NULL,
  descuento_item DECIMAL(12, 2) DEFAULT 0,
  subtotal DECIMAL(12, 2) NOT NULL,
  lote_id UUID,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
  FOREIGN KEY (lote_id) REFERENCES lotes(id) ON DELETE SET NULL
);

-- ============================================================================
-- TABLA: caja
-- Descripción: Control de caja diaria
-- ============================================================================
CREATE TABLE caja (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_caja VARCHAR(20) NOT NULL UNIQUE,
  usuario_apertura UUID NOT NULL,
  fecha_apertura TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  saldo_inicial DECIMAL(12, 2) NOT NULL,
  saldo_esperado DECIMAL(12, 2) DEFAULT 0,
  saldo_real DECIMAL(12, 2) DEFAULT 0,
  diferencia DECIMAL(12, 2) DEFAULT 0,
  usuario_cierre UUID,
  fecha_cierre TIMESTAMP,
  observaciones TEXT,
  estado VARCHAR(20) NOT NULL DEFAULT 'ABIERTA',
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_apertura) REFERENCES usuarios(id) ON DELETE RESTRICT,
  FOREIGN KEY (usuario_cierre) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ============================================================================
-- TABLA: movimientos_caja
-- Descripción: Registro de todos los movimientos en caja
-- ============================================================================
CREATE TABLE movimientos_caja (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caja_id UUID NOT NULL,
  tipo_movimiento VARCHAR(50) NOT NULL,
  descripcion TEXT NOT NULL,
  monto DECIMAL(12, 2) NOT NULL,
  venta_id UUID,
  referencia VARCHAR(100),
  usuario_id UUID NOT NULL,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (caja_id) REFERENCES caja(id) ON DELETE RESTRICT,
  FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE SET NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT
);

-- ============================================================================
-- TABLA: alertas_inventario
-- Descripción: Alertas automáticas por stock bajo
-- ============================================================================
CREATE TABLE alertas_inventario (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id UUID NOT NULL,
  tipo_alerta VARCHAR(50) NOT NULL,
  stock_actual INT NOT NULL,
  stock_minimo INT NOT NULL,
  mensaje TEXT NOT NULL,
  leida BOOLEAN NOT NULL DEFAULT false,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

-- ============================================================================
-- TABLA: auditoria
-- Descripción: Log de cambios y acciones en el sistema
-- ============================================================================
CREATE TABLE auditoria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL,
  entidad VARCHAR(255) NOT NULL,
  id_entidad UUID NOT NULL,
  accion VARCHAR(50) NOT NULL,
  datos_anterior JSONB,
  datos_nuevo JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ============================================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================================================
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_numero_documento ON usuarios(numero_documento);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_estado ON usuarios(estado);

CREATE INDEX idx_categorias_slug ON categorias(slug);
CREATE INDEX idx_categorias_estado ON categorias(estado);

CREATE INDEX idx_productos_codigo ON productos(codigo_producto);
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_estado ON productos(estado);
CREATE INDEX idx_productos_stock ON productos(stock_actual, stock_minimo);
CREATE INDEX idx_productos_codigo_barras ON productos(codigo_barras);

CREATE INDEX idx_proveedores_numero_documento ON proveedores(numero_documento);
CREATE INDEX idx_proveedores_estado ON proveedores(estado);

CREATE INDEX idx_compras_proveedor ON compras(proveedor_id);
CREATE INDEX idx_compras_estado ON compras(estado);
CREATE INDEX idx_compras_fecha ON compras(fecha_compra);
CREATE INDEX idx_compras_numero ON compras(numero_compra);

CREATE INDEX idx_detalle_compras_compra ON detalle_compras(compra_id);
CREATE INDEX idx_detalle_compras_producto ON detalle_compras(producto_id);

CREATE INDEX idx_lotes_producto ON lotes(producto_id);
CREATE INDEX idx_lotes_fecha_vencimiento ON lotes(fecha_vencimiento);
CREATE INDEX idx_lotes_numero ON lotes(numero_lote);

CREATE INDEX idx_ventas_vendedor ON ventas(vendedor_id);
CREATE INDEX idx_ventas_estado ON ventas(estado);
CREATE INDEX idx_ventas_fecha ON ventas(fecha_venta);
CREATE INDEX idx_ventas_numero ON ventas(numero_venta);
CREATE INDEX idx_ventas_cliente ON ventas(cliente_documento);

CREATE INDEX idx_detalle_ventas_venta ON detalle_ventas(venta_id);
CREATE INDEX idx_detalle_ventas_producto ON detalle_ventas(producto_id);
CREATE INDEX idx_detalle_ventas_lote ON detalle_ventas(lote_id);

CREATE INDEX idx_caja_usuario_apertura ON caja(usuario_apertura);
CREATE INDEX idx_caja_estado ON caja(estado);
CREATE INDEX idx_caja_fecha ON caja(fecha_apertura);

CREATE INDEX idx_movimientos_caja_caja ON movimientos_caja(caja_id);
CREATE INDEX idx_movimientos_caja_usuario ON movimientos_caja(usuario_id);
CREATE INDEX idx_movimientos_caja_fecha ON movimientos_caja(fecha_creacion);

CREATE INDEX idx_alertas_inventario_producto ON alertas_inventario(producto_id);
CREATE INDEX idx_alertas_inventario_leida ON alertas_inventario(leida);

CREATE INDEX idx_auditoria_usuario ON auditoria(usuario_id);
CREATE INDEX idx_auditoria_entidad ON auditoria(entidad);
CREATE INDEX idx_auditoria_fecha ON auditoria(fecha_creacion);

-- ============================================================================
-- CONSTRAINTS DE VALIDACIÓN
-- ============================================================================

-- Validar que precio_venta >= precio_costo
ALTER TABLE productos
ADD CONSTRAINT chk_precio_venta_mayor_costo
CHECK (precio_venta >= precio_costo);

-- Validar que stock_minimo < stock_maximo
ALTER TABLE productos
ADD CONSTRAINT chk_stock_minimo_maximo
CHECK (stock_minimo <= stock_maximo);

-- Validar que total >= subtotal (sin descuentos)
ALTER TABLE compras
ADD CONSTRAINT chk_total_compra
CHECK (total >= (subtotal - COALESCE(descuento, 0)));

-- Validar que total >= subtotal en ventas
ALTER TABLE ventas
ADD CONSTRAINT chk_total_venta
CHECK (total >= (subtotal - COALESCE(descuento_total, 0)));

ALTER TABLE ventas
ADD CONSTRAINT chk_monto_pagado
CHECK (monto_pagado >= 0);

-- ============================================================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- ============================================================================
COMMENT ON TABLE usuarios IS 'Gestión de usuarios con roles y permisos del sistema';
COMMENT ON TABLE categorias IS 'Categorización de productos para mejor organización';
COMMENT ON TABLE productos IS 'Catálogo completo de productos con precios y stocks';
COMMENT ON TABLE proveedores IS 'Información de proveedores y gestión de acreeduría';
COMMENT ON TABLE compras IS 'Registro de compras a proveedores con trazabilidad';
COMMENT ON TABLE detalle_compras IS 'Ítems detallados de cada compra realizada';
COMMENT ON TABLE lotes IS 'Control de lotes para productos con vencimiento';
COMMENT ON TABLE ventas IS 'Registro de todas las transacciones de venta';
COMMENT ON TABLE detalle_ventas IS 'Ítems detallados de cada venta realizada';
COMMENT ON TABLE caja IS 'Control de cajas diarias del punto de venta';
COMMENT ON TABLE movimientos_caja IS 'Trazabilidad completa de movimientos en caja';
COMMENT ON TABLE alertas_inventario IS 'Sistema automático de alertas por stock bajo';
COMMENT ON TABLE auditoria IS 'Log de auditoría completo del sistema';
