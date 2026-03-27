# 📊 Base de Datos - Ferretería POS

## 📋 Descripción General

Base de datos PostgreSQL diseñada para un **Sistema Integral de Punto de Venta (POS) y Control de Inventario** para una ferretería. Implementa **Clean Architecture** con completa trazabilidad, auditoría y escalabilidad.

### Características Principales

- ✅ **Integridad Referencial**: Relaciones bien definidas con ON DELETE y ON UPDATE
- ✅ **Auditoría Completa**: Seguimiento de todos los cambios en el sistema
- ✅ **Control de Inventario**: Alertas automáticas y seguimiento de lotes
- ✅ **Seguridad**: Roles y permisos basados en RBAC
- ✅ **Escalabilidad**: Índices optimizados y vistas de negocio
- ✅ **Trazabilidad**: Timestamps de creación y actualización en todas las tablas

---

## 🗂️ Estructura de Tablas

### 1. **USUARIOS** - Gestión de Acceso y Roles

```
Tabla: usuarios
├── id (UUID)
├── email (VARCHAR, UNIQUE)
├── nombre (VARCHAR)
├── apellido (VARCHAR)
├── tipo_documento (ENUM: DNI, RUC, PASAPORTE)
├── numero_documento (VARCHAR, UNIQUE)
├── telefono (VARCHAR)
├── direccion (TEXT)
├── rol (ENUM: ADMIN, GERENTE, VENDEDOR, ALMACENERO, AUDITOR)
├── estado (ENUM: ACTIVO, INACTIVO, SUSPENDIDO)
├── contrasena_hash (VARCHAR) - bcrypt
├── fecha_creacion (TIMESTAMP)
├── fecha_actualizacion (TIMESTAMP)
├── fecha_ultimo_acceso (TIMESTAMP)
├── creado_por (UUID) - FK autorreferencial
└── activo (BOOLEAN)
```

**Roles y Permisos:**
- `ADMIN`: Acceso total al sistema
- `GERENTE`: Gestión de inventario, reportes, cajas
- `VENDEDOR`: Crear ventas, consultar inventario
- `ALMACENERO`: Gestión de compras e inventario
- `AUDITOR`: Lectura de auditoría (sin modificaciones)

---

### 2. **CATEGORÍAS** - Clasificación de Productos

```
Tabla: categorias
├── id (UUID)
├── nombre (VARCHAR, UNIQUE)
├── descripcion (TEXT)
├── slug (VARCHAR, UNIQUE)
├── imagen_url (VARCHAR)
├── estado (ENUM: ACTIVO, INACTIVO, DESCONTINUADO)
├── orden_visualizacion (INT)
├── fecha_creacion (TIMESTAMP)
├── fecha_actualizacion (TIMESTAMP)
└── creado_por (UUID) - FK usuarios
```

**Categorías Iniciales:**
- Herramientas Manuales
- Materiales de Construcción
- Pinturas y Acabados
- Electricidad
- Tuberías y Accesorios
- Ferretería General

---

### 3. **PRODUCTOS** - Catálogo de Artículos

```
Tabla: productos
├── id (UUID)
├── codigo_producto (VARCHAR, UNIQUE)
├── nombre (VARCHAR)
├── descripcion (TEXT)
├── categoria_id (UUID) - FK categorias
├── precio_costo (DECIMAL 12,2)
├── precio_venta (DECIMAL 12,2)
├── margen_ganancia (DECIMAL 5,2) - %
├── unidad_medida (VARCHAR)
├── stock_actual (INT)
├── stock_minimo (INT)
├── stock_maximo (INT)
├── sku (VARCHAR, UNIQUE)
├── codigo_barras (VARCHAR, UNIQUE)
├── imagen_url (VARCHAR)
├── estado (ENUM: ACTIVO, INACTIVO, DESCONTINUADO)
├── es_compuesto (BOOLEAN)
├── requiere_seguimiento_lote (BOOLEAN)
├── fecha_creacion (TIMESTAMP)
├── fecha_actualizacion (TIMESTAMP)
├── fecha_ultimo_movimiento (TIMESTAMP)
├── creado_por (UUID) - FK usuarios
└── CONSTRAINT: precio_venta >= precio_costo
```

**Tipos de Unidad de Medida:**
- UNIDAD, KG, LITRO, GALON, CAJA, DOCENA, METRO, PAQUETE, BOLSA

---

### 4. **PROVEEDORES** - Gestión de Proveedores

```
Tabla: proveedores
├── id (UUID)
├── nombre (VARCHAR)
├── tipo_documento (ENUM: DNI, RUC, PASAPORTE)
├── numero_documento (VARCHAR, UNIQUE)
├── contacto_nombre (VARCHAR)
├── contacto_telefono (VARCHAR)
├── contacto_email (VARCHAR)
├── direccion (TEXT)
├── ciudad (VARCHAR)
├── departamento (VARCHAR)
├── pais (VARCHAR)
├── telefono (VARCHAR)
├── email (VARCHAR)
├── sitio_web (VARCHAR)
├── condiciones_pago (VARCHAR)
├── dias_entrega (INT)
├── cuenta_bancaria (VARCHAR)
├── estado (ENUM: ACTIVO, INACTIVO, SUSPENDIDO)
├── es_acreedor (BOOLEAN)
├── saldo_pendiente (DECIMAL 12,2)
├── limite_credito (DECIMAL 12,2)
├── fecha_creacion (TIMESTAMP)
├── fecha_actualizacion (TIMESTAMP)
└── creado_por (UUID) - FK usuarios
```

---

### 5. **COMPRAS** - Registro de Compras a Proveedores

```
Tabla: compras
├── id (UUID)
├── numero_compra (VARCHAR, UNIQUE)
├── proveedor_id (UUID) - FK proveedores
├── fecha_compra (TIMESTAMP)
├── fecha_entrega_esperada (TIMESTAMP)
├── fecha_entrega_real (TIMESTAMP)
├── numero_orden_compra (VARCHAR)
├── numero_factura (VARCHAR)
├── subtotal (DECIMAL 12,2)
├── igv (DECIMAL 12,2)
├── total (DECIMAL 12,2)
├── descuento (DECIMAL 12,2)
├── estado (ENUM: PENDIENTE, RECIBIDA, DEVUELTA, CANCELADA)
├── observaciones (TEXT)
├── creado_por (UUID) - FK usuarios
├── fecha_creacion (TIMESTAMP)
├── fecha_actualizacion (TIMESTAMP)
└── CONSTRAINT: total >= (subtotal - descuento)
```

**Estados de Compra:**
- `PENDIENTE`: Orden generada, no recibida
- `RECIBIDA`: Mercadería recibida en almacén
- `DEVUELTA`: Devolución parcial o total
- `CANCELADA`: Compra cancelada

---

### 6. **DETALLE_COMPRAS** - Ítems de Compras

```
Tabla: detalle_compras
├── id (UUID)
├── compra_id (UUID) - FK compras (CASCADE)
├── producto_id (UUID) - FK productos
├── cantidad (INT)
├── precio_unitario (DECIMAL 12,2)
├── subtotal (DECIMAL 12,2)
├── lote_id (VARCHAR)
├── fecha_vencimiento (DATE)
└── fecha_creacion (TIMESTAMP)
```

---

### 7. **LOTES** - Control de Lotes y Vencimientos

```
Tabla: lotes
├── id (UUID)
├── numero_lote (VARCHAR, UNIQUE)
├── producto_id (UUID) - FK productos
├── cantidad_inicial (INT)
├── cantidad_disponible (INT)
├── fecha_fabricacion (DATE)
├── fecha_vencimiento (DATE)
├── proveedor_id (UUID) - FK proveedores
├── compra_id (UUID) - FK compras
└── fecha_creacion (TIMESTAMP)
```

**Uso:** Para productos que requieren seguimiento de vencimiento (medicinas, químicos, pinturas, etc.)

---

### 8. **VENTAS** - Registro de Transacciones

```
Tabla: ventas
├── id (UUID)
├── numero_venta (VARCHAR, UNIQUE)
├── numero_comprobante (VARCHAR)
├── tipo_comprobante (VARCHAR) - FACTURA, BOLETA, TICKET
├── cliente_nombre (VARCHAR)
├── cliente_documento (VARCHAR)
├── fecha_venta (TIMESTAMP)
├── vendedor_id (UUID) - FK usuarios
├── subtotal (DECIMAL 12,2)
├── igv (DECIMAL 12,2)
├── descuento_total (DECIMAL 12,2)
├── total (DECIMAL 12,2)
├── monto_pagado (DECIMAL 12,2)
├── vuelto (DECIMAL 12,2)
├── metodo_pago (ENUM: EFECTIVO, TARJETA_DEBITO, TARJETA_CREDITO, TRANSFERENCIA, CHEQUE)
├── estado (ENUM: PENDIENTE, COMPLETADA, CANCELADA, DEVUELTA)
├── numero_referencia (VARCHAR)
├── observaciones (TEXT)
├── es_devolucion (BOOLEAN)
├── venta_original_id (UUID) - FK autorreferencial (para devoluciones)
├── fecha_cierre_caja (TIMESTAMP)
├── creado_por (UUID) - FK usuarios
├── fecha_creacion (TIMESTAMP)
├── fecha_actualizacion (TIMESTAMP)
└── CONSTRAINT: total >= (subtotal - descuento_total)
```

---

### 9. **DETALLE_VENTAS** - Ítems de Ventas

```
Tabla: detalle_ventas
├── id (UUID)
├── venta_id (UUID) - FK ventas (CASCADE)
├── producto_id (UUID) - FK productos
├── cantidad (INT)
├── precio_unitario (DECIMAL 12,2)
├── descuento_item (DECIMAL 12,2)
├── subtotal (DECIMAL 12,2)
├── lote_id (UUID) - FK lotes
└── fecha_creacion (TIMESTAMP)
```

---

### 10. **CAJA** - Control de Cajas Diarias

```
Tabla: caja
├── id (UUID)
├── numero_caja (VARCHAR, UNIQUE)
├── usuario_apertura (UUID) - FK usuarios
├── fecha_apertura (TIMESTAMP)
├── saldo_inicial (DECIMAL 12,2)
├── saldo_esperado (DECIMAL 12,2)
├── saldo_real (DECIMAL 12,2)
├── diferencia (DECIMAL 12,2)
├── usuario_cierre (UUID) - FK usuarios
├── fecha_cierre (TIMESTAMP)
├── observaciones (TEXT)
├── estado (VARCHAR: ABIERTA, CERRADA)
├── fecha_creacion (TIMESTAMP)
└── fecha_actualizacion (TIMESTAMP)
```

---

### 11. **MOVIMIENTOS_CAJA** - Detalle de Movimientos

```
Tabla: movimientos_caja
├── id (UUID)
├── caja_id (UUID) - FK caja (RESTRICT)
├── tipo_movimiento (VARCHAR: INGRESO, EGRESO)
├── descripcion (TEXT)
├── monto (DECIMAL 12,2)
├── venta_id (UUID) - FK ventas (nullable)
├── referencia (VARCHAR)
├── usuario_id (UUID) - FK usuarios
└── fecha_creacion (TIMESTAMP)
```

---

### 12. **ALERTAS_INVENTARIO** - Sistema de Alertas

```
Tabla: alertas_inventario
├── id (UUID)
├── producto_id (UUID) - FK productos (CASCADE)
├── tipo_alerta (VARCHAR: STOCK_BAJO, VENCIMIENTO_PROXIMO, SIN_STOCK)
├── stock_actual (INT)
├── stock_minimo (INT)
├── mensaje (TEXT)
├── leida (BOOLEAN)
├── fecha_creacion (TIMESTAMP)
└── fecha_actualizacion (TIMESTAMP)
```

---

### 13. **AUDITORÍA** - Log de Cambios

```
Tabla: auditoria
├── id (UUID)
├── usuario_id (UUID) - FK usuarios
├── entidad (VARCHAR)
├── id_entidad (UUID)
├── accion (VARCHAR: CREATE, UPDATE, DELETE, READ)
├── datos_anterior (JSONB)
├── datos_nuevo (JSONB)
├── ip_address (VARCHAR)
├── user_agent (TEXT)
└── fecha_creacion (TIMESTAMP)
```

---

## 🔗 Diagrama de Relaciones

```
    ┌─────────────────┐
    │    USUARIOS     │ (Roles: ADMIN, GERENTE, VENDEDOR, ALMACENERO, AUDITOR)
    └────────┬────────┘
         ◄───┼───►
             │
    ┌────────┴─────────┬─────────────────┬───────────────────┐
    │                  │                 │                   │
    ▼                  ▼                 ▼                   ▼
┌─────────┐      ┌──────────┐      ┌──────────┐         ┌─────────┐
│CATEGORÍAS       │PROVEEDORES       │ VENTAS   │        │ COMPRAS │
└────┬────┘      └──────┬───┘      └────┬─────┘        └────┬────┘
     │                  │               │                    │
     ▼                  ▼               ▼                    ▼
┌──────────┐      ┌──────────────┐ ┌──────────────┐    ┌──────────────┐
│PRODUCTOS ◄──┬───┤DETALLE_COMPRAS   │DETALLE_VENTAS    │DETALLE_COMPRAS
└──────┬───┘  │   └──────────────┘ └──────┬───────┘    └──────────────┘
       │      │                           │
       ▼      ▼                           ▼
    ┌─────────────┐                  ┌────────┐
    │   LOTES     │                  │ CAJA   │
    └─────────────┘                  └───┬────┘
                                         │
                                         ▼
                            ┌──────────────────────┐
                            │ MOVIMIENTOS_CAJA     │
                            └──────────────────────┘

    ┌──────────────────────┐
    │ ALERTAS_INVENTARIO   │
    └──────────────────────┘

    ┌──────────────────────┐
    │   AUDITORIA          │
    └──────────────────────┘
```

---

## 📊 Vistas Disponibles

### 1. **vw_inventario_actual**
Estado actual del inventario con alertas de stock (CRÍTICO, BAJO, NORMAL)

### 2. **vw_resumen_ventas_diarias**
Resumen diario de ventas por vendedor con estadísticas

### 3. **vw_productos_mas_vendidos**
Ranking de productos más vendidos en últimos 30 días

### 4. **vw_compras_pendientes**
Compras en tránsito o pendientes de recepción

### 5. **vw_alertas_stock_bajo**
Productos que necesitan reorden inmediato

### 6. **vw_caja_diaria**
Resumen de movimientos de caja del día actual

### 7. **vw_performance_vendedores**
Estadísticas de desempeño por vendedor

### 8. **vw_cuentas_por_pagar**
Deudas con proveedores activas

### 9. **vw_analisis_margenes**
Análisis de rentabilidad por categoría y producto

---

## 🔑 Tipos de Datos PostgreSQL

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| UUID | Identificador único | `'550e8400-e29b-41d4-a716-446655440000'` |
| VARCHAR(n) | Texto de longitud variable | `'Juan Pérez'` |
| TEXT | Texto de longitud ilimitada | Descripciones largas |
| DECIMAL(12,2) | Número decimal con 2 decimales | `123.45` |
| INT | Número entero | `100` |
| DATE | Fecha sin hora | `'2026-03-27'` |
| TIMESTAMP | Fecha y hora | `'2026-03-27 14:30:00'` |
| BOOLEAN | Verdadero/Falso | `true`, `false` |
| ENUM | Enumeración | `'ACTIVO'`, `'INACTIVO'` |
| JSONB | JSON binario | `'{"key": "value"}'` |

---

## 🔐 Constraints y Validaciones

1. **Integridad de Precios**: Precio venta >= precio costo
2. **Orden de Stock**: Stock mínimo <= stock máximo
3. **Montos**: Total >= subtotal (después de descuentos)
4. **Cascadas**: Eliminación de compras elimina detalles
4. **Restricciones**: No se pueden eliminar categorías si tienen productos

---

## 🚀 Instalación

### 1. Crear Base de Datos

```bash
createdb ferreteria_pos
```

### 2. Ejecutar Scripts en Orden

```bash
# Crear esquema y tablas
psql ferreteria_pos -f 01_create_schema.sql

# Insertar datos iniciales
psql ferreteria_pos -f 02_insert_seeds.sql

# Crear vistas
psql ferreteria_pos -f 03_create_views.sql
```

### 3. Verificar Instalación

```sql
-- Listar todas las tablas
\dt

-- Listar todas las vistas
\dv

-- Ver estructura de una tabla
\d usuarios
```

---

## 📈 Estrategia de Indexación

Los índices están optimizados para:
- Búsquedas por email y documento (usuarios)
- Filtros por rol y estado
- Búsquedas de productos por código, categoría
- Búsquedas de efectividad de ventas y fechas
- Alertas de inventario

---

## 🔄 Transacciones Atómicas

Para operaciones críticas:

```sql
BEGIN TRANSACTION;
  -- Crear venta
  INSERT INTO ventas ...;
  -- Crear detalle
  INSERT INTO detalle_ventas ...;
  -- Actualizar inventario
  UPDATE productos SET stock_actual = stock_actual - cantidad WHERE id = ...;
COMMIT;
```

---

## 📝 Notas Importantes

1. **Contraseñas**: Las contraseñas se almacenan hasheadas con bcrypt (implementar en backend)
2. **Timestamps**: Todos los registros tienen `fecha_creacion` y `fecha_actualizacion`
3. **Auditoría**: Se recomienda implementar triggers para auditar cambios
4. **Backup**: Realizar backups diarios de la base de datos
5. **Índices**: Ya incluidos para optimización de queries
6. **Sequences**: Las UUIDs se generan automáticamente

---

## 🛠️ Próximas Iteraciones

- [ ] Implementar triggers para auditoría automática
- [ ] Crear stored procedures para operaciones complejas
- [ ] Implementar materialized views para reportes pesados
- [ ] Configurar replicación para alta disponibilidad
- [ ] Implementar particionamiento de tablas grandes

---

**Versión**: 1.0.0  
**Última Actualización**: 27 Marzo 2026  
**Autor**: Sistema POS - Ferretería  

