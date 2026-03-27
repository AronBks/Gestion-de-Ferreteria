-- ============================================================================
-- FERRETERIA POS - SCRIPTS DE MANTENIMIENTO Y UTILIDADES
-- Base de Datos: PostgreSQL
-- ============================================================================

-- ============================================================================
-- 1. PROCEDIMIENTOS PARA GESTIÓN DE CAJA
-- ============================================================================

-- Crear función para cerrar caja
CREATE OR REPLACE FUNCTION cerrar_caja(
  p_caja_id UUID,
  p_saldo_real DECIMAL,
  p_observaciones TEXT DEFAULT NULL
) RETURNS TABLE (
  caja_id UUID,
  numero_caja VARCHAR,
  saldo_inicial DECIMAL,
  saldo_calculado DECIMAL,
  saldo_real DECIMAL,
  diferencia DECIMAL,
  resultado VARCHAR
) AS $$
DECLARE
  v_saldo_calculado DECIMAL;
  v_ingresos DECIMAL;
  v_egresos DECIMAL;
BEGIN
  -- Calcular saldo esperado
  SELECT
    c.saldo_inicial +
    COALESCE(SUM(CASE WHEN mc.tipo_movimiento = 'INGRESO' THEN mc.monto ELSE 0 END), 0) -
    COALESCE(SUM(CASE WHEN mc.tipo_movimiento = 'EGRESO' THEN mc.monto ELSE 0 END), 0)
  INTO v_saldo_calculado
  FROM caja c
  LEFT JOIN movimientos_caja mc ON c.id = mc.caja_id
  WHERE c.id = p_caja_id
  GROUP BY c.id, c.saldo_inicial;

  -- Actualizar caja
  UPDATE caja
  SET
    saldo_real = p_saldo_real,
    saldo_esperado = v_saldo_calculado,
    diferencia = p_saldo_real - v_saldo_calculado,
    estado = 'CERRADA',
    fecha_cierre = CURRENT_TIMESTAMP,
    observaciones = p_observaciones
  WHERE id = p_caja_id;

  -- Retornar resultado
  RETURN QUERY
  SELECT
    p_caja_id,
    c.numero_caja,
    c.saldo_inicial,
    v_saldo_calculado,
    p_saldo_real,
    p_saldo_real - v_saldo_calculado,
    CASE
      WHEN p_saldo_real = v_saldo_calculado THEN 'CUADRADO'
      WHEN p_saldo_real > v_saldo_calculado THEN 'SOBRANTE'
      ELSE 'FALTANTE'
    END
  FROM caja c
  WHERE c.id = p_caja_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. PROCEDIMIENTOS PARA GESTIÓN DE INVENTARIO
-- ============================================================================

-- Función para actualizar stock por venta
CREATE OR REPLACE FUNCTION actualizar_stock_venta(
  p_detalle_venta_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_producto_id UUID;
  v_cantidad INT;
  v_stock_actual INT;
BEGIN
  -- Obtener datos de la venta
  SELECT dv.producto_id, dv.cantidad
  INTO v_producto_id, v_cantidad
  FROM detalle_ventas dv
  WHERE dv.id = p_detalle_venta_id;

  -- Obtener stock actual
  SELECT p.stock_actual
  INTO v_stock_actual
  FROM productos p
  WHERE p.id = v_producto_id;

  -- Validar que hay stock suficiente
  IF v_stock_actual < v_cantidad THEN
    RAISE EXCEPTION 'Stock insuficiente para el producto';
  END IF;

  -- Actualizar stock
  UPDATE productos
  SET
    stock_actual = stock_actual - v_cantidad,
    fecha_ultimo_movimiento = CURRENT_TIMESTAMP
  WHERE id = v_producto_id;

  -- Verificar si se alcanzó stock mínimo
  PERFORM crear_alerta_inverntario(v_producto_id);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar stock por compra
CREATE OR REPLACE FUNCTION actualizar_stock_compra(
  p_detalle_compra_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_producto_id UUID;
  v_cantidad INT;
BEGIN
  -- Obtener datos de la compra
  SELECT dc.producto_id, dc.cantidad
  INTO v_producto_id, v_cantidad
  FROM detalle_compras dc
  WHERE dc.id = p_detalle_compra_id;

  -- Actualizar stock
  UPDATE productos
  SET
    stock_actual = stock_actual + v_cantidad,
    fecha_ultimo_movimiento = CURRENT_TIMESTAMP
  WHERE id = v_producto_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. PROCEDIMIENTOS PARA ALERTAS
-- ============================================================================

-- Función para crear alerta de inventario
CREATE OR REPLACE FUNCTION crear_alerta_inverntario(
  p_producto_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_stock_actual INT;
  v_stock_minimo INT;
  v_tipo_alerta VARCHAR;
  v_mensaje TEXT;
BEGIN
  -- Obtener datos del producto
  SELECT p.stock_actual, p.stock_minimo
  INTO v_stock_actual, v_stock_minimo
  FROM productos p
  WHERE p.id = p_producto_id;

  -- Determinar tipo de alerta
  IF v_stock_actual <= 0 THEN
    v_tipo_alerta := 'SIN_STOCK';
    v_mensaje := 'Producto agotado - Reorden urgente';
  ELSIF v_stock_actual <= v_stock_minimo THEN
    v_tipo_alerta := 'STOCK_BAJO';
    v_mensaje := 'Stock bajo - Consideraar reorden';
  ELSE
    RETURN TRUE;
  END IF;

  -- Crear alerta si no existe una activa
  INSERT INTO alertas_inventario (
    producto_id, tipo_alerta, stock_actual,
    stock_minimo, mensaje, leida
  )
  SELECT
    p_producto_id, v_tipo_alerta, v_stock_actual,
    v_stock_minimo, v_mensaje, false
  FROM productos p
  WHERE p.id = p_producto_id
    AND NOT EXISTS (
      SELECT 1 FROM alertas_inventario
      WHERE producto_id = p_producto_id AND leida = false
    );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. PROCEDIMIENTOS PARA DEVOLUCIONES
-- ============================================================================

-- Función para procesar devolución de venta
CREATE OR REPLACE FUNCTION procesar_devolucion_venta(
  p_venta_original_id UUID,
  p_observaciones TEXT DEFAULT NULL
) RETURNS TABLE (
  venta_id UUID,
  numero_venta VARCHAR,
  monto_original DECIMAL,
  monto_reembolso DECIMAL,
  resultado VARCHAR
) AS $$
DECLARE
  v_venta_original_id UUID;
  v_nueva_venta_id UUID;
  v_total_original DECIMAL;
  v_cliente_nombre VARCHAR;
  v_numero_venta VARCHAR;
BEGIN
  -- Obtener datos de venta original
  SELECT v.id, v.total, v.cliente_nombre, v.numero_venta
  INTO v_venta_original_id, v_total_original, v_cliente_nombre, v_numero_venta
  FROM ventas v
  WHERE v.id = p_venta_original_id AND v.estado = 'COMPLETADA';

  IF v_venta_original_id IS NULL THEN
    RAISE EXCEPTION 'Venta original no encontrada o ya fue devuelta';
  END IF;

  -- Generar nueva venta de devolución
  INSERT INTO ventas (
    numero_venta,
    cliente_nombre,
    fecha_venta,
    vendedor_id,
    subtotal,
    igv,
    descuento_total,
    total,
    monto_pagado,
    metodo_pago,
    estado,
    es_devolucion,
    venta_original_id,
    observaciones,
    creado_por
  )
  SELECT
    'DEV-' || v.numero_venta,
    v.cliente_nombre,
    CURRENT_TIMESTAMP,
    v.vendedor_id,
    v.subtotal,
    v.igv,
    v.descuento_total,
    -(v.total),
    v.total,
    v.metodo_pago,
    'COMPLETADA',
    true,
    p_venta_original_id,
    p_observaciones,
    v.creado_por
  FROM ventas v
  WHERE v.id = p_venta_original_id
  RETURNING id INTO v_nueva_venta_id;

  -- Copiar ítems de la venta original (con cantidades negativas)
  INSERT INTO detalle_ventas (
    venta_id,
    producto_id,
    cantidad,
    precio_unitario,
    descuento_item,
    subtotal,
    lote_id
  )
  SELECT
    v_nueva_venta_id,
    dv.producto_id,
    -(dv.cantidad),
    dv.precio_unitario,
    dv.descuento_item,
    -(dv.subtotal),
    dv.lote_id
  FROM detalle_ventas dv
  WHERE dv.venta_id = p_venta_original_id;

  -- Actualizar estado de venta original
  UPDATE ventas
  SET estado = 'DEVUELTA'
  WHERE id = p_venta_original_id;

  -- Restaurar inventario
  UPDATE productos p
  SET stock_actual = stock_actual + dv.cantidad
  FROM detalle_ventas dv
  WHERE dv.venta_id = p_venta_original_id AND dv.producto_id = p.id;

  RETURN QUERY
  SELECT
    p_venta_original_id,
    v_numero_venta,
    v_total_original,
    v_total_original,
    'DEVOLUCION_PROCESADA'::VARCHAR;

END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. VISTAS COMPLEMENTARIAS PARA REPORTES
-- ============================================================================

-- Vista: Stock en Peligro (próximo a vencerse)
CREATE OR REPLACE VIEW vw_stock_proximo_vencer AS
SELECT
  p.id,
  p.codigo_producto,
  p.nombre,
  c.nombre AS categoria,
  l.numero_lote,
  l.fecha_vencimiento,
  (l.fecha_vencimiento - CURRENT_DATE)::INT AS dias_para_vencer,
  l.cantidad_disponible,
  p.precio_costo,
  (l.cantidad_disponible * p.precio_costo) AS valor_afectado
FROM lotes l
LEFT JOIN productos p ON l.producto_id = p.id
LEFT JOIN categorias c ON p.categoria_id = c.id
WHERE
  l.fecha_vencimiento <= CURRENT_DATE + INTERVAL '30 days'
  AND l.cantidad_disponible > 0
  AND p.estado = 'ACTIVO'
ORDER BY l.fecha_vencimiento ASC;

-- Vista: Productos sin movimiento
CREATE OR REPLACE VIEW vw_productos_sin_movimiento AS
SELECT
  p.id,
  p.codigo_producto,
  p.nombre,
  c.nombre AS categoria,
  p.stock_actual,
  p.precio_venta,
  (p.stock_actual * p.precio_venta) AS valor_stock,
  COALESCE(p.fecha_ultimo_movimiento, p.fecha_creacion) AS ultima_actividad,
  (CURRENT_DATE - DATE(COALESCE(p.fecha_ultimo_movimiento, p.fecha_creacion)))::INT AS dias_sin_movimiento
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
WHERE
  p.estado = 'ACTIVO'
  AND (p.fecha_ultimo_movimiento IS NULL OR p.fecha_ultimo_movimiento < CURRENT_TIMESTAMP - INTERVAL '90 days')
ORDER BY dias_sin_movimiento DESC;

-- Vista: Desempeño de Categorías
CREATE OR REPLACE VIEW vw_desempeno_categorias AS
SELECT
  c.id,
  c.nombre AS categoria,
  COUNT(DISTINCT p.id) AS cantidad_productos,
  SUM(p.stock_actual * p.precio_costo) AS valor_inventario_costo,
  SUM(p.stock_actual * p.precio_venta) AS valor_inventario_venta,
  COUNT(DISTINCT dv.venta_id) AS transacciones_30dias,
  SUM(dv.cantidad) AS unidades_vendidas_30dias,
  SUM(dv.subtotal) AS monto_vendido_30dias,
  ROUND(
    (SUM(dv.subtotal) / NULLIF(SUM(p.stock_actual * p.precio_venta), 0) * 100)::NUMERIC,
    2
  ) AS rotacion_porcentaje
FROM categorias c
LEFT JOIN productos p ON c.id = p.categoria_id
LEFT JOIN detalle_ventas dv ON p.id = dv.producto_id
LEFT JOIN ventas v ON dv.venta_id = v.id
  AND v.estado = 'COMPLETADA'
  AND DATE(v.fecha_venta) >= CURRENT_DATE - INTERVAL '30 days'
WHERE c.estado = 'ACTIVO'
GROUP BY c.id, c.nombre
ORDER BY monto_vendido_30dias DESC;

-- ============================================================================
-- 6. UTILIDADES DE LIMPIEZA Y MANTENIMIENTO
-- ============================================================================

-- Función para limpiar alertas antiguas
CREATE OR REPLACE FUNCTION limpiar_alertas_antiguas(
  p_dias_antiguedad INT DEFAULT 60
) RETURNS INT AS $$
DECLARE
  v_registros_eliminados INT;
BEGIN
  DELETE FROM alertas_inventario
  WHERE
    leida = true
    AND (CURRENT_TIMESTAMP - fecha_actualizacion) > (p_dias_antiguedad || ' days')::INTERVAL;

  GET DIAGNOSTICS v_registros_eliminados = ROW_COUNT;
  RETURN v_registros_eliminados;
END;
$$ LANGUAGE plpgsql;

-- Función para generar número único de comprobante
CREATE OR REPLACE FUNCTION generar_numero_venta(
  p_prefijo VARCHAR DEFAULT 'VENTA'
) RETURNS VARCHAR AS $$
DECLARE
  v_numero VARCHAR;
  v_contador INT;
BEGIN
  SELECT COUNT(*) + 1
  INTO v_contador
  FROM ventas
  WHERE DATE(fecha_venta) = CURRENT_DATE;

  v_numero := p_prefijo || '-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' ||
              LPAD(v_contador::TEXT, 6, '0');

  RETURN v_numero;
END;
$$ LANGUAGE plpgsql;

-- Función para generar número único de compra
CREATE OR REPLACE FUNCTION generar_numero_compra(
  p_prefijo VARCHAR DEFAULT 'COMPRA'
) RETURNS VARCHAR AS $$
DECLARE
  v_numero VARCHAR;
  v_contador INT;
BEGIN
  SELECT COUNT(*) + 1
  INTO v_contador
  FROM compras
  WHERE DATE(fecha_compra) = CURRENT_DATE;

  v_numero := p_prefijo || '-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' ||
              LPAD(v_contador::TEXT, 6, '0');

  RETURN v_numero;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. QUERIES ÚTILES DE NEGOCIO
-- ============================================================================

-- TOP 5 Clientes por monto gastado (últimos 90 días)
SELECT
  v.cliente_nombre,
  v.cliente_documento,
  COUNT(DISTINCT v.id) AS transacciones,
  SUM(v.total) AS monto_total,
  AVG(v.total) AS ticket_promedio
FROM ventas v
WHERE
  v.estado = 'COMPLETADA'
  AND DATE(v.fecha_venta) >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY v.cliente_nombre, v.cliente_documento
ORDER BY monto_total DESC
LIMIT 5;

-- Productos por Vencer en 30 días
SELECT
  p.codigo_producto,
  p.nombre,
  l.numero_lote,
  l.fecha_vencimiento,
  l.cantidad_disponible,
  (l.cantidad_disponible * p.precio_costo) AS valor_afectado
FROM lotes l
LEFT JOIN productos p ON l.producto_id = p.id
WHERE
  l.fecha_vencimiento <= CURRENT_DATE + INTERVAL '30 days'
  AND l.cantidad_disponible > 0
ORDER BY l.fecha_vencimiento ASC;

-- Rentabilidad por Vendedor (últimos 30 días)
SELECT
  u.nombre || ' ' || u.apellido AS vendedor,
  COUNT(DISTINCT v.id) AS transacciones,
  SUM(v.subtotal) AS subtotal_vendido,
  SUM(v.igv) AS igv_recaudado,
  SUM(v.total) AS total_venta,
  (SUM(v.total) - SUM(dv.cantidad * p.precio_costo)) AS ganancia_bruta
FROM ventas v
LEFT JOIN usuarios u ON v.vendedor_id = u.id
LEFT JOIN detalle_ventas dv ON v.id = dv.venta_id
LEFT JOIN productos p ON dv.producto_id = p.id
WHERE
  v.estado = 'COMPLETADA'
  AND DATE(v.fecha_venta) >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY u.id, u.nombre, u.apellido
ORDER BY ganancia_bruta DESC;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
