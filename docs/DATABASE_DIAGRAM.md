# 📊 Diagrama Entidad-Relación - Ferretería POS

## Diagrama Completo

```mermaid
erDiagram
    USUARIOS ||--o{ CATEGORIAS : crea
    USUARIOS ||--o{ PRODUCTOS : crea
    USUARIOS ||--o{ PROVEEDORES : crea
    USUARIOS ||--o{ COMPRAS : crea
    USUARIOS ||--o{ VENTAS : crea
    USUARIOS ||--o{ CAJA : abre
    USUARIOS ||--o{ MOVIMIENTOS_CAJA : registra
    USUARIOS ||--o{ AUDITORIA : realiza
    USUARIOS ||--o{ USUARIOS : "auto-referencial"

    CATEGORIAS ||--o{ PRODUCTOS : contiene

    PROVEEDORES ||--o{ COMPRAS : suministra
    PROVEEDORES ||--o{ LOTES : provee

    PRODUCTOS ||--o{ DETALLE_COMPRAS : tiene
    PRODUCTOS ||--o{ DETALLE_VENTAS : tiene
    PRODUCTOS ||--o{ LOTES : tiene
    PRODUCTOS ||--o{ ALERTAS_INVENTARIO : genera

    COMPRAS ||--o{ DETALLE_COMPRAS : contiene
    COMPRAS ||--o{ LOTES : origina

    LOTES ||--o{ DETALLE_VENTAS : referencia

    VENTAS ||--o{ DETALLE_VENTAS : contiene
    VENTAS ||--o{ MOVIMIENTOS_CAJA : genera
    VENTAS ||--o{ VENTAS : "devolucion de"
    VENTAS ||--o{ CAJA : cierra

    CAJA ||--o{ MOVIMIENTOS_CAJA : registra
    CAJA ||--o{ CAJA : "cierre"

    AUDITORIA : registra_cambios
```

---

## Relaciones Detalladas

### 1. USUARIOS (Central de Acceso)
```
USUARIOS
├── 1:N ──► CATEGORIAS (creado_por)
├── 1:N ──► PRODUCTOS (creado_por)
├── 1:N ──► PROVEEDORES (creado_por)
├── 1:N ──► COMPRAS (creado_por)
├── 1:N ──► VENTAS (creado_por, vendedor_id)
├── 1:N ──► CAJA (usuario_apertura, usuario_cierre)
├── 1:N ──► MOVIMIENTOS_CAJA (usuario_id)
├── 1:N ──► AUDITORIA (usuario_id)
└── 1:N ──► USUARIOS (creado_por - autorreferencial)
```

### 2. PRODUCTOS (Centro del Negocio)
```
PRODUCTOS
├── N:1 ◄── CATEGORIAS
├── 1:N ──► DETALLE_COMPRAS
├── 1:N ──► DETALLE_VENTAS
├── 1:N ──► LOTES
└── 1:N ──► ALERTAS_INVENTARIO
```

### 3. COMPRAS (Flujo de Entrada)
```
COMPRAS
├── N:1 ◄── PROVEEDORES
├── 1:N ──► DETALLE_COMPRAS (CASCADE DELETE)
├── 1:N ──► LOTES
└── N:1 ◄── USUARIOS (creado_por)
```

### 4. VENTAS (Flujo de Salida)
```
VENTAS
├── N:1 ◄── USUARIOS (vendedor_id)
├── 1:N ──► DETALLE_VENTAS (CASCADE DELETE)
├── 1:N ──► MOVIMIENTOS_CAJA
├── 1:0/1 ──► CAJA (fecha_cierre_caja)
└── 0/1:1 ──► VENTAS (venta_original_id - para devoluciones)
```

### 5. CAJA (Control Financiero Diario)
```
CAJA
├── N:1 ◄── USUARIOS (usuario_apertura, usuario_cierre)
├── 1:N ──► MOVIMIENTOS_CAJA
└── 1:N ──► VENTAS (fecha_cierre_caja)
```

### 6. LOTES (Trazabilidad de Productos)
```
LOTES
├── N:1 ◄── PRODUCTOS
├── N:1 ◄── PROVEEDORES
├── N:1 ◄── COMPRAS
└── 1:N ──► DETALLE_VENTAS
```

---

## Flujos de Datos

### Flujo 1: Compra a Almacén

```
PROVEEDOR
    │
    ▼
COMPRA (1 registro)
    │
    ├──► DETALLE_COMPRAS (múltiples items)
    │
    ├──► PRODUCTOS (stock_actual += cantidad)
    │
    └──► LOTES (si requiere seguimiento)
```

### Flujo 2: Venta en POS

```
CLIENTE
    │
    ▼
VENTA (1 registro)
    │
    ├──► DETALLE_VENTAS (múltiples items)
    │
    ├──► PRODUCTOS (stock_actual -= cantidad)
    │
    ├──► MOVIMIENTOS_CAJA (registro en caja)
    │
    └──► AUDITORIA (log del cambio)
```

### Flujo 3: Devolución

```
VENTA ORIGINAL
    │
    ▼
VENTA (con es_devolucion=true)
    │
    ├──► DETALLE_VENTAS (cantidades negativas)
    │
    ├──► PRODUCTOS (stock_actual += cantidad)
    │
    └──► AUDITORIA (log de reversión)
```

### Flujo 4: Generación de Alertas

```
PRODUCTO (stock_actual ≤ stock_minimo)
    │
    ▼
ALERTAS_INVENTARIO
    │
    ├──► USUARIO (notificación)
    │
    ├──► REPORTES (dashboard)
    │
    └──► AUTOMATIZACIÓN (sugerencia de compra)
```

---

## Cardinalidades Explicadas

| Símbolo | Significado | Ejemplo |
|---------|-------------|---------|
| `1:N` ó `1:0/N` | Uno a muchos | Una categoría tiene muchos productos |
| `1:1` ó `0/1:1` | Uno a uno | Una venta se cierra con una caja |
| `N:1` ó `0/N:1` | Muchos a uno | Muchos productos en una categoría |
| `N:N` | Muchos a muchos | (No usado directamente aquí) |

---

## Constraints Importantes

### Cascadas de Eliminación

```
COMPRA → DETALLE_COMPRAS (CASCADE)
  └─ Si se elimina compra, elimina detalles

VENTA → DETALLE_VENTAS (CASCADE)
  └─ Si se elimina venta, elimina detalles
```

### Restricciones de Eliminación

```
CATEGORIA → PRODUCTOS (RESTRICT)
  └─ No se puede eliminar categoría si tiene productos

PROVEEDOR → COMPRAS (RESTRICT)
  └─ No se puede eliminar proveedor si tiene compras
```

### Restricciones de Actualización

```
USUARIOS → CATEGORIAS (RESTRICT)
USUARIOS → PRODUCTOS (RESTRICT)
  └─ Usuario que crea no puede ser eliminado
```

---

## Índices por Tabla

### usuarios
- `idx_usuarios_email` (búsqueda rápida por email)
- `idx_usuarios_rol` (filtros por rol)
- `idx_usuarios_estado` (filtros por estado)

### productos
- `idx_productos_codigo` (código de barra, ISBN)
- `idx_productos_categoria` (búsqueda por categoría)
- `idx_productos_estado` (filtros estado)
- `idx_productos_stock` (alertas de inventario)

### ventas
- `idx_ventas_fecha` (reportes por período)
- `idx_ventas_estado` (filtros de ventas)
- `idx_ventas_vendedor` (performance de vendedores)

### compras
- `idx_compras_fecha` (reportes de flujo)
- `idx_compras_estado` (seguimiento)
- `idx_compras_proveedor` (análisis de proveedores)

---

## Queries Comunes

### Producto Best Seller (últimos 30 días)
```sql
SELECT 
    p.nombre,
    SUM(dv.cantidad) as total_vendido,
    SUM(dv.subtotal) as ingresos
FROM productos p
INNER JOIN detalle_ventas dv ON p.id = dv.producto_id
INNER JOIN ventas v ON dv.venta_id = v.id
WHERE v.fecha_venta >= NOW() - INTERVAL '30 days'
GROUP BY p.id
ORDER BY total_vendido DESC;
```

### Estado de Caja del Día
```sql
SELECT 
    ca.numero_caja,
    u.nombre,
    ca.saldo_inicial,
    SUM(CASE WHEN mc.tipo = 'INGRESO' THEN mc.monto ELSE 0 END) as ingresos,
    SUM(CASE WHEN mc.tipo = 'EGRESO' THEN mc.monto ELSE 0 END) as egresos,
    ca.saldo_esperado,
    ca.saldo_real,
    ca.diferencia
FROM caja ca
LEFT JOIN usuarios u ON ca.usuario_apertura = u.id
LEFT JOIN movimientos_caja mc ON ca.id = mc.caja_id
WHERE DATE(ca.fecha_apertura) = CURRENT_DATE
GROUP BY ca.id;
```

### Stock Bajo
```sql
SELECT 
    p.nombre,
    p.stock_actual,
    p.stock_minimo,
    (p.stock_minimo - p.stock_actual) as faltante
FROM productos p
WHERE p.stock_actual <= p.stock_minimo
ORDER BY faltante DESC;
```

### Proveedores Deudores
```sql
SELECT 
    pr.nombre,
    SUM(c.total) as total_deuda,
    MAX(c.fecha_compra) as ultima_compra
FROM proveedores pr
INNER JOIN compras c ON pr.id = c.proveedor_id
WHERE c.estado IN ('PENDIENTE', 'RECIBIDA')
GROUP BY pr.id
ORDER BY total_deuda DESC;
```

---

## Notas de Diseño

1. **UUID vs INT**: Se usa UUID para mayor seguridad y escalabilidad futura
2. **JSONB**: Usado en auditoría para flexibilidad en cambios
3. **Timestamps**: Toda tabla tiene `fecha_creacion` y `fecha_actualizacion`
4. **Soft Deletes**: Considerar para datos críticos (no implementado aún)
5. **Versionado**: Para auditoría completa de cambios
6. **Particionamiento**: Futuro para tablas muy grandes (ventas, auditoria)

---

**Versión**: 1.0  
**Última Actualización**: 27 Marzo 2026

