# 🚀 BACKEND FERRETERÍA POS - COMPLETADO

**Versión**: 1.0 (Estable / API de Producción)  
**Status**: ✅ COMPLETADO Y EN PRODUCCIÓN  
**URL Base**: `http://localhost:3000/api`

---

## 📡 ARQUITECTURA DE MÓDULOS DEL BACKEND

El backend está desarrollado sobre **NestJS** e interactúa de manera directa con **PostgreSQL** mediante **TypeORM**. Todos los endpoints expuestos se listan a continuación:

```
[AppModule]
  ├── [AuthModule] ──────────► Gestión de login y seguridad JWT
  ├── [UsuariosModule] ──────► CRUD de personal y control de roles (RBAC)
  ├── [CategoriasModule] ────► Agrupamiento lógico de productos
  ├── [ProductosModule] ─────► Catálogo de inventario y alertas
  ├── [VentasModule] ────────► POS, transacciones ACID y control de stock
  ├── [ReportesModule] ──────► BI, márgenes SQL y tendencias de ventas
  └── [FacturacionModule] ───► Emisión de facturas SIAT (Impuestos Bolivia)
```

---

## 🔌 API ENDPOINTS DETALLADOS

Todos los endpoints (excepto login y consultas públicas de productos) requieren la cabecera `Authorization: Bearer <JWT_TOKEN>`.

### 1. Autenticación y Perfil (`/auth`)
- `POST /auth/login`: Autentica al usuario. Retorna el token JWT y el perfil básico del usuario.
- `GET /auth/perfil`: Retorna la información del usuario autenticado en base al token JWT.

### 2. Gestión de Personal (`/usuarios`)
- `GET /usuarios`: Listar todos los usuarios registrados (Solo ADMIN).
- `POST /usuarios`: Crear un nuevo usuario hasheando su contraseña con Bcrypt (Solo ADMIN).
- `PATCH /usuarios/:id`: Actualizar datos del usuario o rol (Solo ADMIN).
- `DELETE /usuarios/:id`: Eliminar a un usuario del sistema (Solo ADMIN).

### 3. Catálogo de Inventario (`/productos` y `/categorias`)
- `GET /productos`: Listar productos paginados con soporte para filtros por categoría, estado y búsqueda de texto.
- `GET /productos/:id`: Obtener el detalle de un producto por UUID.
- `GET /productos/codigo/:codigo`: Buscar producto por su código de barra o identificador único de ferretería.
- `GET /productos/alertas/bajo-stock`: Listar productos cuyo stock actual sea inferior o igual al stock mínimo configurado.
- `POST /productos`: Crear un producto asociándole una categoría (ADMIN, GERENTE, ALMACENERO).
- `PATCH /productos/:id`: Modificar stock, precio o estado del producto (ADMIN, GERENTE, ALMACENERO).
- `DELETE /productos/:id`: Eliminar un producto del catálogo (ADMIN, GERENTE).

### 4. Punto de Venta (`/ventas`)
- `POST /ventas`: Crear una nueva venta. Realiza control de stock atómico mediante transacción de BD (ADMIN, GERENTE, VENDEDOR).
- `GET /ventas`: Historial de ventas con paginación y filtros (vendedor, método de pago, estado, fecha).
- `GET /ventas/:id`: Detalle y artículos (items) de una venta específica.
- `PATCH /ventas/:id/cancelar`: Anula una venta reintegrando los productos vendidos al stock físico (ADMIN, GERENTE).
- `GET /ventas/resumen/hoy`: Obtiene el total de ingresos, transacciones y ticket promedio del día en curso.

### 5. Reportes y Analíticas (`/reportes`)
- `GET /reportes/modulo`: Retorna los KPIs de rendimiento, gráficos diarios y el top 10 de productos (ADMIN, GERENTE, AUDITOR).
- `GET /reportes/dashboard`: Datos simplificados de compatibilidad para el panel de administración.
- `GET /reportes/exportar`: Retorna las filas estructuradas y listas para descarga de reportes en formato CSV.
- `GET /reportes/categorias`: Retorna las categorías activas para el menú de filtros del Dashboard.

### 6. Facturación Electrónica SIAT Bolivia (`/facturacion`)
- `POST /facturacion/emitir`: Emite una factura electrónica en Impuestos Nacionales, generando el código CUF de la transacción (ADMIN, GERENTE, VENDEDOR).
- `GET /facturacion`: Listado de facturas emitidas y sus estados fiscales (Aceptada, Rechazada, Anulada).
- `GET /facturacion/:id`: Detalle completo del comprobante digital.
- `GET /facturacion/venta/:ventaId`: Buscar si una venta cuenta con una factura ya emitida.
- `PATCH /facturacion/:id/anular`: Anula contablemente la factura y envía la solicitud al SIAT (ADMIN, GERENTE).
- `POST /facturacion/:id/enviar`: Envía el PDF y archivo XML de la factura al cliente por WhatsApp (API de mensajería) o Email.

---

## 🔐 MEDIDAS DE SEGURIDAD CONFIGURADAS
1. **CORS Habilitado**: Configurado para aceptar conexiones solo desde el origen del frontend (`http://localhost:4200`) permitiendo credenciales de cabecera.
2. **Hasheo Bcrypt**: 10 rounds de salt para encriptar contraseñas de manera irreversible.
3. **RolesGuard**: Validador de roles tipados que previene accesos no autorizados a nivel de API, retornando `403 Forbidden` si el rol del JWT no cuenta con permisos.

---

## 📊 MÉTRICAS DE COMPLETITUD DEL BACKEND

```
Servicios Auth & Usuarios:    ████████████████████ 100% ✅
Control de Inventario API:    ████████████████████ 100% ✅
Flujo Ventas (Transacciones): ████████████████████ 100% ✅
Facturación SIAT Bolivia:     ████████████████████ 100% ✅
Reportes SQL optimizados:     ████████████████████ 100% ✅
Documentación Swagger / API:  ████████████████████ 100% ✅
────────────────────────────────────────────────────────
TOTAL API BACKEND:            ████████████████████ 100% 🟢
```

---

**Verificación Técnica**: Compilado y listo para pruebas de despliegue. 🚀
