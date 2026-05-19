-- ============================================================================
-- FERRETERIA POS - MIGRACIÓN: FACTURACIÓN ELECTRÓNICA SIAT (Bolivia)
-- Base de Datos: PostgreSQL
-- Descripción: Estructura para soporte de Facturación Electrónica SIAT
-- Fecha: 2026-05-19
-- ============================================================================

-- ============================================================================
-- PASO 1: Crear ENUM para estados de factura SIAT
-- ============================================================================
CREATE TYPE estado_siat AS ENUM (
  'PENDIENTE',
  'EMITIDA',
  'ANULADA',
  'RECHAZADA',
  'OBSERVADA'
);

CREATE TYPE canal_envio AS ENUM (
  'WHATSAPP',
  'EMAIL',
  'NINGUNO'
);

-- ============================================================================
-- PASO 2: Agregar campo cliente_telefono a la tabla ventas
-- ============================================================================
ALTER TABLE ventas
ADD COLUMN cliente_telefono VARCHAR(20);

COMMENT ON COLUMN ventas.cliente_telefono IS 'Teléfono del cliente para envío de factura electrónica';

-- ============================================================================
-- PASO 3: Crear tabla de facturas electrónicas
-- ============================================================================
CREATE TABLE facturas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relación 1:1 con venta
  venta_id UUID NOT NULL UNIQUE,

  -- Datos fiscales SIAT
  cuf VARCHAR(150),
  cufd VARCHAR(150),
  numero_factura BIGINT NOT NULL,
  fecha_emision TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  codigo_control VARCHAR(50),
  numero_autorizacion VARCHAR(100),

  -- Leyenda obligatoria del SIAT
  leyenda_siat TEXT,

  -- Estado fiscal
  estado_siat estado_siat NOT NULL DEFAULT 'PENDIENTE',
  motivo_anulacion TEXT,
  fecha_anulacion TIMESTAMPTZ,

  -- Datos de la empresa/sucursal
  actividad_economica VARCHAR(20) NOT NULL DEFAULT '477310',
  punto_venta INT NOT NULL DEFAULT 0,
  sucursal INT NOT NULL DEFAULT 0,

  -- Documentos generados
  xml_content TEXT,
  pdf_url VARCHAR(500),

  -- Control de envío al cliente
  enviada_cliente BOOLEAN NOT NULL DEFAULT false,
  canal_envio canal_envio NOT NULL DEFAULT 'NINGUNO',
  fecha_envio TIMESTAMPTZ,
  destino_envio VARCHAR(255),

  -- Auditoría
  creado_por UUID,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Foreign Keys
  FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE RESTRICT,
  FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ============================================================================
-- PASO 4: Índices para optimización de consultas
-- ============================================================================
CREATE INDEX idx_facturas_venta ON facturas(venta_id);
CREATE INDEX idx_facturas_cuf ON facturas(cuf);
CREATE INDEX idx_facturas_cufd ON facturas(cufd);
CREATE INDEX idx_facturas_numero ON facturas(numero_factura);
CREATE INDEX idx_facturas_estado_siat ON facturas(estado_siat);
CREATE INDEX idx_facturas_fecha_emision ON facturas(fecha_emision);
CREATE INDEX idx_facturas_enviada ON facturas(enviada_cliente);

CREATE INDEX idx_ventas_cliente_telefono ON ventas(cliente_telefono);

-- ============================================================================
-- PASO 5: Constraints de validación
-- ============================================================================

-- Numero de factura debe ser positivo
ALTER TABLE facturas
ADD CONSTRAINT chk_numero_factura_positivo
CHECK (numero_factura > 0);

-- Punto de venta y sucursal no negativos
ALTER TABLE facturas
ADD CONSTRAINT chk_punto_venta_no_negativo
CHECK (punto_venta >= 0);

ALTER TABLE facturas
ADD CONSTRAINT chk_sucursal_no_negativa
CHECK (sucursal >= 0);

-- ============================================================================
-- PASO 6: Documentación
-- ============================================================================
COMMENT ON TABLE facturas IS 'Facturas electrónicas según modelo SIAT de Bolivia';
COMMENT ON COLUMN facturas.cuf IS 'Código Único de Facturación - generado por el SIAT';
COMMENT ON COLUMN facturas.cufd IS 'Código Único de Factura Diaria - autorización diaria del SIAT';
COMMENT ON COLUMN facturas.numero_factura IS 'Número secuencial de factura emitida';
COMMENT ON COLUMN facturas.fecha_emision IS 'Fecha y hora precisa de emisión de la factura';
COMMENT ON COLUMN facturas.leyenda_siat IS 'Leyenda asignada por el SIAT que debe imprimirse en la factura';
COMMENT ON COLUMN facturas.estado_siat IS 'Estado fiscal de la factura ante el SIAT';
COMMENT ON COLUMN facturas.codigo_control IS 'Código de control generado para la factura';
COMMENT ON COLUMN facturas.numero_autorizacion IS 'Número de autorización otorgado por el SIAT';
COMMENT ON COLUMN facturas.actividad_economica IS 'Código de actividad económica según clasificación SIAT';
COMMENT ON COLUMN facturas.punto_venta IS 'Identificador del punto de venta registrado en el SIAT';
COMMENT ON COLUMN facturas.sucursal IS 'Identificador de la sucursal registrada en el SIAT';
COMMENT ON COLUMN facturas.xml_content IS 'Contenido XML de la factura electrónica generada';
COMMENT ON COLUMN facturas.pdf_url IS 'URL o ruta del archivo PDF de la factura';
COMMENT ON COLUMN facturas.enviada_cliente IS 'Indica si la factura fue enviada exitosamente al cliente';
COMMENT ON COLUMN facturas.canal_envio IS 'Canal utilizado para el envío de la factura al cliente';
