# 🏗️ Sistema POS Ferretería Bolivia

## 📋 Resumen
Sistema de Punto de Venta especializado para ferreterías en Bolivia, con soporte completo para **Bolivianos (Bs.)** como moneda oficial.

---

## 🇧🇴 Localización Bolivia

### Configuración Regional
- **País**: Bolivia
- **Código ISO**: BO
- **Moneda**: Boliviano (Bs.)
- **Código de Moneda**: BOB
- **Zona Horaria**: America/La_Paz
- **Idioma**: Español de Bolivia (es-BO)

### Formato de Números
- **Separador Decimal**: `,` (coma)
- **Separador de Miles**: `.` (punto)
- **Ejemplo**: Bs. 1.000,50

### Regulaciones Fiscales
- **IVA (Impuesto al Valor Agregado)**: 13%
- **Retención IVA**: 13%
- **Impuesto a las Transacciones (IT)**: 3%

---

## 🏪 Características del Sistema

### Backend (NestJS)
✅ API REST con autenticación JWT
✅ CRUD completo de productos
✅ Gestión de usuarios con roles
✅ CORS habilitado para frontend
✅ Configuración regional para Bolivia

### Frontend (Angular)
✅ Login profesional con gradiente
✅ Dashboard con sidebar navegable
✅ Tabla de productos con paginación
✅ Formateo de moneda en Bs. (Bolivianos)
✅ Responsive design para móvil

### Base de Datos (PostgreSQL)
✅ 13 tablas optimizadas
✅ 6 productos de prueba
✅ Admin pre-configurado

---

## 🚀 Inicio Rápido

### Backend
```bash
cd backend
npm install
npm run start:dev
# Puerto: http://localhost:3000
```

### Frontend
```bash
cd frontend
npm install
npm start
# Puerto: http://localhost:4200
```

### Credenciales de Prueba
- **Email**: admin@ferreteria.com
- **Contraseña**: Admin123

---

## 💰 Moneda en Bolivia

### Ejemplos de Formato
| Valor | Formato |
|-------|---------|
| 100 | Bs. 100,00 |
| 1500 | Bs. 1.500,00 |
| 25.50 | Bs. 25,50 |
| 1000000 | Bs. 1.000.000,00 |

### Uso en el Sistema
- Todos los precios están en Bolivianos
- Cálculo automático de márgenes de ganancia
- Conversión de moneda lista para futuros desarrollos

---

## 📁 Estructura de Archivos

```
Ferreteria/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── country.config.ts          # Config Bolivia
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── productos/
│   │   │   └── usuarios/
│   │   └── main.ts                        # CORS habilitado
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── config/
│   │   │   │   └── currency.config.ts     # Config moneda Bs.
│   │   │   ├── pipes/
│   │   │   │   └── currency-bolivia.pipe.ts
│   │   │   ├── components/
│   │   │   │   ├── login/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── productos/
│   │   │   │   └── usuarios/
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── productos.service.ts
│   │   │   │   └── usuarios.service.ts
│   │   │   └── app.config.ts
│   │   └── assets/
│   └── package.json
└── README-BOLIVIA.md                      # Este archivo
```

---

## 🔐 Autenticación y Seguridad

### JWT (JSON Web Tokens)
- Tokens seguros para autenticación
- Expiración configurable
- User info en localStorage

### Bcrypt
- Hashing de contraseñas
- 10 rounds de hashing
- Comparación segura

### CORS
- ✅ Habilitado para localhost:4200
- ✅ Credenciales permitidas
- ✅ Métodos: GET, POST, PATCH, DELETE, OPTIONS

---

## 📊 Productos

### Campos de Producto
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `codigo_producto` | STRING | Código único (ej: CEME-001) |
| `nombre` | STRING | Nombre del producto |
| `descripcion` | TEXT | Descripción detallada |
| `precio_costo` | DECIMAL | Costo en Bs. |
| `precio_venta` | DECIMAL | Precio venta en Bs. |
| `margen_ganancia` | DECIMAL | Margen % (auto-calculado) |
| `stock_actual` | INTEGER | Cantidad disponible |
| `categoria_id` | UUID | Categoría del producto |
| `estado` | STRING | ACTIVO / INACTIVO |

### Cálculo de Margen
```
Margen % = ((Precio_Venta - Precio_Costo) / Precio_Costo) * 100
```

Ejemplo:
- Costo: Bs. 18.50
- Venta: Bs. 22.00
- Margen: 18.92%

---

## 🔄 API Endpoints

### Autenticación
```
POST /api/auth/login
Body: { email, password }
Response: { access_token, user }
```

### Productos
```
GET /api/productos?page=1&limit=10      # Listar todos
GET /api/productos/:id                  # Obtener uno
POST /api/productos                      # Crear
PATCH /api/productos/:id                # Actualizar
DELETE /api/productos/:id               # Eliminar
```

---

## 🛠️ Configuración por País

### Para agregar otro país
1. Duplicar `country.config.ts`
2. Cambiar configuración de moneda/zona horaria
3. Crear nuevo pipe para formateo de moneda
4. Actualizar `dashboard.component.html` con bandera

### Monedas Soportadas (En el Futuro)
- 🇧🇴 Bolivia: Bs. (BOB)
- 🇦🇷 Argentina: ARS
- 🇵🇪 Perú: S/. (PEN)
- 🇪🇸 España: € (EUR)

---

## 📝 Mejoras Futuras

- [ ] Módulo de Ventas (Point of Sale)
- [ ] Reportes de ventas e inventario
- [ ] Integración con impresoras de recibos
- [ ] Sistema de facturación
- [ ] Sincronización en la nube
- [ ] App mobile (React Native)
- [ ] Soporte multi-empresa

---

## 📞 Soporte

Para reportar errores o sugerencias:
- Revisar logs en console del navegador
- Revisar terminal de backend para errores
- Verificar conexión a PostgreSQL

---

## 📄 Licencia

Proyecto desarrollado para uso educativo y comercial en Bolivia.

---

**Sistema POS Ferretería Bolivia** | v1.0 | 🇧🇴 2026
