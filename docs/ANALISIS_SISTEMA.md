# 📘 ANÁLISIS DETALLADO DEL SISTEMA - FERRETERÍA POS

Este documento proporciona una radiografía técnica y funcional completa del sistema **Ferretería POS**, detallando su arquitectura, módulos clave, flujos de datos, diseño de seguridad y oportunidades estratégicas de mejora.

---

## 1. Ficha Técnica y Stack Tecnológico

El sistema adopta una arquitectura desacoplada basada en microservicios/capas SPA (Single Page Application) y API REST, optimizada para entornos locales y en la nube.

| Capa | Tecnología / Herramienta | Versión | Propósito / Función |
| :--- | :--- | :--- | :--- |
| **Base de Datos** | PostgreSQL | 14+ | Motor relacional, vistas pre-optimizadas, procedimientos almacenados y auditoría de transacciones. |
| **Backend** | NestJS | 10+ | Framework progresivo de Node.js estructurado en módulos orientados a dominios. |
| **ORM** | TypeORM | 0.3+ | Mapeo objeto-relacional con patrones de consultas optimizados y transacciones atómicas. |
| **Frontend** | Angular | 18+ | Framework SPA empresarial con renderizado optimizado y flujo de datos reactivo. |
| **Reactividad** | Angular Signals | 18+ | Fuente única de verdad del estado de la interfaz de usuario con recalculado perezoso (lazy evaluation). |
| **Seguridad** | JWT + Bcrypt | - | Autenticación descentralizada (stateless) y hasheo criptográfico de credenciales (10 rounds). |
| **Diseño UI** | PrimeNG + Tailwind CSS | 17+ / 3+ | Biblioteca de componentes ricos para interfaces profesionales, modo oscuro nativo y diseño responsive. |
| **Localización** | Boliviano (Bs.) / es-BO | - | Formato numérico, impuestos (13% IVA, 3% IT) e integración con el sistema fiscal boliviano. |

---

## 2. Arquitectura de Software

### 2.1. Arquitectura del Backend (NestJS)
El backend está estructurado bajo principios **SOLID** y diseño guiado por el dominio (DDD conceptual), dividiendo el código en módulos auto-contenidos dentro de `backend/src/modules/`.

```
[Cliente HTTP]
      │ (Petición con JWT en Headers)
      ▼
[Controllers] ──► (Guards: JwtAuthGuard, RolesGuard)
      │ (Validación de entrada vía DTOs con class-validator)
      ▼
[Services] ──► (Lógica de negocio y transacciones de base de datos)
      │
      ├─► [Entities (TypeORM)] ──► [PostgreSQL]
      └─► [Servicios Externos (SIAT Web Services, EnvioFacturaService)]
```

- **Capas de Validación (DTOs)**: Cada endpoint REST está protegido por DTOs (`create-venta.dto.ts`, `create-factura.dto.ts`, etc.) que aplican validaciones estrictas (`@IsUUID`, `@Min`, `@IsInt`, etc.) previniendo inyecciones de datos corruptos.
- **Transaccionalidad Atómica**: Operaciones críticas como la creación de una venta (`VentasService.create`) se ejecutan dentro de un `QueryRunner` de TypeORM para asegurar reversiones automáticas (`rollbackTransaction`) si falla el decremento de stock, la inserción de detalles o el guardado de la cabecera.

### 2.2. Arquitectura del Frontend (Angular 18+)
El frontend abandona los patrones tradicionales basados en RxJS y `BehaviorSubject` para la gestión de estados globales, adoptando **Angular Signals** como la fuente principal de reactividad.

- **Servicio de Autenticación Reactivo (`AuthService`)**:
  - `currentUser = signal<User | null>(null)` controla la información del usuario en sesión.
  - `isLoggedIn = computed(() => !!this.currentUser())` deriva de manera automática el estado de login.
  - `userRole = computed(() => this.currentUser()?.rol ?? null)` gestiona la jerarquía de accesos de forma perezosa.
  - **Ventaja**: Cero memory leaks causados por suscripciones manuales no desvinculadas en componentes de UI.
- **Rutas y Guardias Funcionales**:
  - Uso de `CanActivateFn` (`role.guard.ts` y `auth.guard.ts`) inyectando dinámicamente servicios a través de la función `inject(AuthService)`, facilitando el control de flujo de navegación de forma limpia y moderna.

---

## 3. Seguridad y Control de Acceso (RBAC)

El sistema de seguridad implementa una validación tipo-segura (type-safe) a nivel de servidor y cliente, restringiendo las operaciones con base en 5 roles predefinidos en el enum `UserRole`.

### 3.1. Matriz de Permisos del Sistema

| Módulo / Acción | ADMIN | GERENTE | VENDEDOR | ALMACENERO | AUDITOR |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Usuarios** (CRUD / Permisos) | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Productos** (Crear / Editar / Eliminar) | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Productos** (Visualizar catálogo) | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Ventas** (Crear / Emitir Venta POS) | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Ventas** (Visualizar Historial) | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Ventas** (Cancelar Venta y restaurar stock) | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Facturación SIAT** (Emitir factura) | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Facturación SIAT** (Anular factura) | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Reportes y KPIs** (Acceso a gráficos y BI) | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Bitácoras de Auditoría** (Visualizar logs) | ✅ | ❌ | ❌ | ❌ | ✅ |

### 3.2. Mecanismo de Control en Backend
El decorador `@Roles()` almacena los metadatos de la ruta, los cuales son interpretados por el `RolesGuard` interceptando la petición entrante:

```typescript
// Ejemplo en VentasController
@Patch(':id/cancelar')
@Roles(UserRole.ADMIN, UserRole.GERENTE) // Solo administradores o gerentes
async cancelar(@Param('id') id: string) {
  return this.ventasService.cancelar(id);
}
```

---

## 4. Módulos Críticos

### 4.1. Integración de Facturación Electrónica (SIAT Bolivia)
El módulo `FacturacionModule` conecta el flujo de ventas con el Sistema de Impuestos Nacionales de Bolivia (SIAT).

```
[Venta Realizada] ──► POST /facturacion/emitir
                           │
                           ▼
              [SiatService.validarDatos] (Nit, Cliente, Monto)
                           │
                           ▼
              [WS Impuestos Nacionales] ──► (Obtención de CUF / CUFD / Firma XML)
                           │
              ┌────────────┴────────────┐
              ▼ (Exitoso)               ▼ (Fallo)
    [Factura Guardada en BD]    [Registro de Contingencia]
    [Generación de PDF/Representación Gráfica]
              │
              ▼
    [EnvioFacturaService] ──► WhatsApp API / Email (Envío automático del PDF y XML)
```

- **Características**:
  - **Seguridad Fiscal**: Las facturas son inmutables. Una vez emitidas, solo se pueden anular mediante una petición firmada que justifique el motivo de anulación (`PATCH /facturacion/:id/anular`), notificando al SIAT y restituyendo el estado contable.
  - **Trazabilidad**: Mapea los códigos de respuesta del SIAT (Pendiente, Aceptada, Rechazada, Anulada) directamente en la base de datos para auditorías cruzadas.

### 4.2. Módulo de Reportes y Estadísticas (Business Intelligence)
El servicio `ReportesService` extrae analíticas en tiempo real sin degradar el rendimiento de la base de datos de producción.

- **Cálculo Eficiente de Margen de Ganancia**:
  Evita el procesamiento en memoria de miles de registros. Utiliza agregación a nivel de base de datos a través de consultas optimizadas con QueryBuilder:
  ```sql
  -- Lógica interna implementada en TypeORM
  SELECT SUM((p.precio_venta - p.precio_costo) * dv.cantidad) AS margenGanancia
  FROM detalle_ventas dv
  INNER JOIN ventas v ON dv.venta_id = v.id
  INNER JOIN productos p ON dv.producto_id = p.id
  WHERE v.estado = 'COMPLETADA' AND v.fecha_venta BETWEEN :inicio AND :fin;
  ```
- **Comparación Inter-Período (Tendencias)**:
  El backend calcula dinámicamente el mismo número de días hacia atrás (periodo anterior) para proyectar el crecimiento porcentual (`trendVentas`, `trendMargen`, `trendTransacciones`), permitiendo visualizar tendencias alcistas o bajistas en el Dashboard.
- **Gráficos e Interactividad**:
  Proporciona datos pre-estructurados para componentes gráficos del frontend (PrimeNG Charts):
  - Agrupación por día (`ventasPorDia`) para gráficos de líneas de ingresos.
  - Top 10 productos más vendidos (`topProductos`) con cálculo de ganancias por ítem para gráficos de barras.

---

## 5. Oportunidades de Mejora y Roadmap Técnico

Para llevar el sistema de Ferretería POS a un estándar SaaS (Software as a Service) empresarial, se sugieren las siguientes optimizaciones:

### 5.1. Caché Distribuida con Redis
- **Problema**: El catálogo de productos y las categorías son consultados constantemente por el módulo POS, lo que sobrecarga el pool de conexiones de la base de datos PostgreSQL.
- **Solución**: Implementar una capa de caché con Redis en el servicio de productos. Invalidar la caché de manera automática (`cacheManager.del('productos:todos')`) solo cuando se cree, modifique o elimine un producto.

### 5.2. Contenedores y Orquestación (Docker)
- **Problema**: El despliegue manual en servidores locales requiere instalar Node.js, configurar PostgreSQL manualmente, correr scripts SQL y variables de entorno, elevando el riesgo de errores por diferencias de entornos.
- **Solución**: Crear un archivo de producción multi-etapa (`Dockerfile` y `docker-compose.prod.yml`) que levante el backend, el frontend pre-compilado en un servidor Nginx, y la base de datos con volúmenes de respaldo automáticos.

### 5.3. Automatización de Pruebas (CI/CD)
- **Problema**: La adición de nuevas funciones al sistema de facturación o POS podría introducir regresiones (bugs en cascada).
- **Solución**: Configurar GitHub Actions para ejecutar la suite de pruebas unitarias (`npm run test`) y de cobertura en cada Pull Request, garantizando que ningún cambio rompa la lógica central de ventas e impuestos.

---

**Ferretería POS — Documento de Análisis Técnico**  
*Desarrollado para la estabilidad de control de versiones y auditoría del sistema.* 🚀
