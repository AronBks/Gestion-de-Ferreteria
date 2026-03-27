-- ============================================================================
-- FERRETERIA POS - VISTAS Y QUERIES ÚTILES
-- Base de Datos: PostgreSQL
-- ============================================================================

-- ============================================================================
-- VISTA: Inventario Actual
-- Descripción: Estado actual del inventario con alertas de stock
-- ============================================================================
CREATE OR REPLACE VIEW vw_inventario_actual AS
SELECT
  p.id,
  p.codigo_producto,
  p.nombre AS producto,
  c.nombre AS categoria,
  p.stock_actual,
  p.stock_minimo,
  p.stock_maximo,
  CASE
    WHEN p.stock_actual <= p.stock_minimo THEN 'CRÍTICO'
    WHEN p.stock_actual <= (p.stock_minimo * 1.5) THEN 'BAJO'
    ELSE 'NORMAL'
  END AS estado_stock,
  p.precio_costo,
  p.precio_venta,
  p.margen_ganancia,
  (p.stock_actual * p.precio_costo) AS valor_inventario_costo,
  (p.stock_actual * p.precio_venta) AS valor_inventario_venta,
  p.fecha_ultimo_movimiento,
  p.estado
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
WHERE p.estado = 'ACTIVO'
ORDER BY p.codigo_producto;

-- ============================================================================
-- VISTA: Resumen de Ventas Diarias
-- Descripción: Resumen diario de ventas por vendedor
-- ============================================================================
CREATE OR REPLACE VIEW vw_resumen_ventas_diarias AS
SELECT
  DATE(v.fecha_venta) AS fecha,
  u.nombre || ' ' || u.apellido AS vendedor,
  COUNT(DISTINCT v.id) AS cantidad_transacciones,
  SUM(v.subtotal) AS subtotal,
  SUM(v.igv) AS igv_total,
  SUM(v.descuento_total) AS descuentos,
  SUM(v.total) AS total_ventas,
  AVG(v.total) AS ticket_promedio,
  COUNT(DISTINCT v.metodo_pago) AS formas_pago
FROM ventas v
LEFT JOIN usuarios u ON v.vendedor_id = u.id
WHERE v.estado = 'COMPLETADA'
GROUP BY DATE(v.fecha_venta), u.id, u.nombre, u.apellido
ORDER BY fecha DESC;

-- ============================================================================
-- VISTA: Productos Más Vendidos
-- Descripción: Ranking de productos por volumen de ventas
-- ============================================================================
CREATE OR REPLACE VIEW vw_productos_mas_vendidos AS
SELECT
  p.codigo_producto,
  p.nombre AS producto,
  c.nombre AS categoria,
  SUM(dv.cantidad) AS cantidad_vendida,
  COUNT(DISTINCT dv.venta_id) AS transacciones,
  SUM(dv.subtotal) AS monto_total,
  AVG(dv.precio_unitario) AS precio_promedio_venta,
  ROW_NUMBER() OVER (ORDER BY SUM(dv.cantidad) DESC) AS ranking
FROM detalle_ventas dv
LEFT JOIN productos p ON dv.producto_id = p.id
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN ventas v ON dv.venta_id = v.id
WHERE v.estado = 'COMPLETADA' AND DATE(v.fecha_venta) >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.id, p.codigo_producto, p.nombre, c.id, c.nombre
ORDER BY cantidad_vendida DESC;

-- ============================================================================
-- VISTA: Estado de Compras Pendientes
-- Descripción: Compras en tránsito o pendientes de recepción
-- ============================================================================
CREATE OR REPLACE VIEW vw_compras_pendientes AS
SELECT
  c.id,
  c.numero_compra,
  c.numero_factura,
  pr.nombre AS proveedor,
  c.fecha_compra,
  c.fecha_entrega_esperada,
  (c.fecha_entrega_esperada - CURRENT_DATE) AS dias_para_vencer,
  c.subtotal,
  c.igv,
  c.total,
  c.estado,
  COUNT(DISTINCT dc.producto_id) AS cantidad_items,
  u.nombre || ' ' || u.apellido AS creado_por
FROM compras c
LEFT JOIN proveedores pr ON c.proveedor_id = pr.id
LEFT JOIN detalle_compras dc ON c.id = dc.compra_id
LEFT JOIN usuarios u ON c.creado_por = u.id
WHERE c.estado IN ('PENDIENTE', 'RECIBIDA')
GROUP BY c.id, c.numero_compra, c.numero_factura, pr.id, pr.nombre,
         c.fecha_compra, c.fecha_entrega_esperada, c.subtotal, c.igv, c.total,
         c.estado, u.id, u.nombre, u.apellido
ORDER BY c.fecha_entrega_esperada ASC;

-- ============================================================================
-- VISTA: Alertas de Stock Bajo
-- Descripción: Productos que necesitan reorden
-- ============================================================================
CREATE OR REPLACE VIEW vw_alertas_stock_bajo AS
SELECT
  p.id,
  p.codigo_producto,
  p.nombre AS producto,
  c.nombre AS categoria,
  p.stock_actual,
  p.stock_minimo,
  (p.stock_minimo - p.stock_actual) AS unidades_faltantes,
  p.precio_costo,
  ((p.stock_minimo - p.stock_actual) * p.precio_costo) AS valor_reorden,
  a.id AS alerta_id,
  a.leida
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN alertas_inventario a ON p.id = a.producto_id AND a.leida = false
WHERE p.stock_actual <= p.stock_minimo
  AND p.estado = 'ACTIVO'
ORDER BY (p.stock_minimo - p.stock_actual) DESC;

-- ============================================================================
-- VISTA: Caja Diaria
-- Descripción: Resumen de movimientos de caja del día
-- ============================================================================
CREATE OR REPLACE VIEW vw_caja_diaria AS
SELECT
  ca.id,
  ca.numero_caja,
  u1.nombre || ' ' || u1.apellido AS usuario_apertura,
  ca.fecha_apertura,
  ca.saldo_inicial,
  SUM(CASE WHEN mc.tipo_movimiento = 'INGRESO' THEN mc.monto ELSE 0 END) AS total_ingresos,
  SUM(CASE WHEN mc.tipo_movimiento = 'EGRESO' THEN mc.monto ELSE 0 END) AS total_egresos,
  ca.saldo_inicial +
    SUM(CASE WHEN mc.tipo_movimiento = 'INGRESO' THEN mc.monto ELSE 0 END) -
    SUM(CASE WHEN mc.tipo_movimiento = 'EGRESO' THEN mc.monto ELSE 0 END) AS saldo_esperado,
  ca.saldo_real,
  (ca.saldo_real - (ca.saldo_inicial +
    SUM(CASE WHEN mc.tipo_movimiento = 'INGRESO' THEN mc.monto ELSE 0 END) -
    SUM(CASE WHEN mc.tipo_movimiento = 'EGRESO' THEN mc.monto ELSE 0 END))) AS diferencia,
  ca.estado
FROM caja ca
LEFT JOIN usuarios u1 ON ca.usuario_apertura = u1.id
LEFT JOIN movimientos_caja mc ON ca.id = mc.caja_id
WHERE DATE(ca.fecha_apertura) = CURRENT_DATE
GROUP BY ca.id, ca.numero_caja, u1.id, u1.nombre, u1.apellido,
         ca.fecha_apertura, ca.saldo_inicial, ca.saldo_real, ca.estado;

-- ============================================================================
-- VISTA: Performance de Vendedores
-- Descripción: Estadísticas de desempeño por vendedor
-- ============================================================================
CREATE OR REPLACE VIEW vw_performance_vendedores AS
SELECT
  u.id,
  u.nombre || ' ' || u.apellido AS vendedor,
  COUNT(DISTINCT v.id) AS total_transacciones,
  SUM(v.total) AS monto_total_vendido,
  AVG(v.total) AS ticket_promedio,
  SUM(v.monto_pagado) AS efectivo_recaudado,
  COUNT(DISTINCT DATE(v.fecha_venta)) AS dias_trabajados,
  (SUM(v.total) / NULLIF(COUNT(DISTINCT DATE(v.fecha_venta)), 0)) AS promedio_diario,
  MAX(v.fecha_venta) AS ultima_venta,
  u.estado
FROM usuarios u
LEFT JOIN ventas v ON u.id = v.vendedor_id
  AND v.estado = 'COMPLETADA'
  AND DATE(v.fecha_venta) >= CURRENT_DATE - INTERVAL '30 days'
WHERE u.rol = 'VENDEDOR' AND u.estado = 'ACTIVO'
GROUP BY u.id, u.nombre, u.apellido, u.estado
ORDER BY monto_total_vendido DESC;

-- ============================================================================
-- VISTA: Cuentas por Cobrar
-- Descripción: Deudas de clientes (si se implementa crédito)
-- ============================================================================
CREATE OR REPLACE VIEW vw_cuentas_por_pagar AS
SELECT
  pr.id,
  pr.nombre AS proveedor,
  pr.numero_documento,
  pr.contacto_nombre,
  pr.email,
  SUM(c.total) AS total_deuda,
  COUNT(DISTINCT c.id) AS cantidad_compras,
  MAX(c.fecha_compra) AS ultima_compra,
  pr.limite_credito,
  CASE
    WHEN pr.saldo_pendiente IS NULL THEN 0
    ELSE pr.saldo_pendiente
  END AS saldo_actual
FROM proveedores pr
LEFT JOIN compras c ON pr.id = c.proveedor_id
  AND c.estado IN ('PENDIENTE', 'RECIBIDA')
WHERE pr.es_acreedor = true AND pr.estado = 'ACTIVO'
GROUP BY pr.id, pr.nombre, pr.numero_documento, pr.contacto_nombre,
         pr.email, pr.limite_credito, pr.saldo_pendiente
ORDER BY total_deuda DESC;

-- ============================================================================
-- VISTA: Análisis de Márgenes
-- Descripción: Análisis de rentabilidad por categoría
-- ============================================================================
CREATE OR REPLACE VIEW vw_analisis_margenes AS
SELECT
  c.nombre AS categoria,
  p.codigo_producto,
  p.nombre AS producto,
  COUNT(DISTINCT dv.venta_id) AS cantidad_vendidas,
  SUM(dv.cantidad) AS total_unidades,
  AVG(dv.precio_unitario) AS precio_venta_promedio,
  p.precio_costo,
  (AVG(dv.precio_unitario) - p.precio_costo) AS ganancia_unitaria,
  ((AVG(dv.precio_unitario) - p.precio_costo) / p.precio_costo * 100) AS margen_porcentaje,
  SUM(dv.subtotal) AS ingresos_totales,
  (SUM(dv.cantidad) * p.precio_costo) AS costo_total,
  (SUM(dv.subtotal) - (SUM(dv.cantidad) * p.precio_costo)) AS ganancia_total
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN detalle_ventas dv ON p.id = dv.producto_id
LEFT JOIN ventas v ON dv.venta_id = v.id
WHERE v.estado = 'COMPLETADA'
  AND DATE(v.fecha_venta) >= CURRENT_DATE - INTERVAL '90 days'
  AND p.estado = 'ACTIVO'
GROUP BY c.id, c.nombre, p.id, p.codigo_producto, p.nombre, p.precio_costo
ORDER BY ganancia_total DESC NULLS LAST;
