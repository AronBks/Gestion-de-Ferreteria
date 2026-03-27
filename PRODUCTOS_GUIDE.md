# 📦 MÓDULO PRODUCTOS - GUÍA COMPLETA

## ✅ Qué se implementó

```
✅ Entity Producto         - Mapeo de tabla productos
✅ DTOs (Create/Update)    - Validación de datos
✅ ProductosService        - Lógica de negocio completa
✅ ProductosController     - 9 endpoints CRUD
✅ Paginación             - Listar con limit/page
✅ Búsqueda               - Buscar por nombre
✅ Filtros                - Por categoría, estado
✅ Validaciones           - Backend y frontend
✅ Protección JWT         - Endpoints sensibles
```

---

## 📡 ENDPOINTS DISPONIBLES

### 1. Listar Productos (PÚBLICO)
```
GET http://localhost:3000/api/productos

Query Parameters:
- page=1          (número de página)
- limit=10        (items por página)
- buscar=texto    (búsqueda por nombre)
- categoria=uuid  (filtrar por categoría)
- estado=ACTIVO   (ACTIVO, INACTIVO, DESCONTINUADO)

Ejemplo:
GET http://localhost:3000/api/productos?page=1&limit=10&buscar=martillo

Respuesta:
{
  "data": [
    {
      "id": "uuid...",
      "nombre": "Martillo de Goma",
      "codigo": "MAR-001",
      "precio_venta": 25.50,
      "precio_costo": 12.75,
      "stock": 45,
      "categoria_id": "uuid...",
      "estado": "ACTIVO",
      "creado_en": "2026-03-27T...",
      "actualizado_en": "2026-03-27T..."
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

### 2. Obtener Producto por ID (PÚBLICO)
```
GET http://localhost:3000/api/productos/uuid-del-producto

Respuesta: (mismo producto)
```

---

### 3. Obtener Producto por Código (PÚBLICO)
```
GET http://localhost:3000/api/productos/codigo/MAR-001

Respuesta: (mismo producto)
```

---

### 4. Productos por Categoría (PÚBLICO)
```
GET http://localhost:3000/api/productos/categoria/uuid-categoria

Respuesta: Array de productos de esa categoría
```

---

### 5. Productos con Bajo Stock (PÚBLICO)
```
GET http://localhost:3000/api/productos/alertas/bajo-stock?limite=10

Respuesta: Array de productos con stock <= 10
```

---

### 6. Crear Producto (PROTEGIDO - JWT)
```
POST http://localhost:3000/api/productos
Authorization: Bearer <token_jwt>
Content-Type: application/json

Body:
{
  "nombre": "Martillo de Acero",
  "descripcion": "Martillo profesional de 2kg",
  "codigo": "MAR-002",
  "precio_venta": 35.99,
  "precio_costo": 18.50,
  "stock": 100,
  "categoria_id": "uuid-categoria",
  "imagen_url": "https://..."
}

Respuesta: 201 Created
{
  "id": "uuid-nuevo",
  "nombre": "Martillo de Acero",
  ... (todos los campos)
}
```

---

### 7. Actualizar Producto (PROTEGIDO - JWT)
```
PATCH http://localhost:3000/api/productos/uuid-producto
Authorization: Bearer <token_jwt>
Content-Type: application/json

Body: (todos los campos son opcionales)
{
  "precio_venta": 39.99,
  "stock": 85,
  "estado": "INACTIVO"
}

Respuesta: 200 OK (producto actualizado)
```

---

### 8. Eliminar Producto (PROTEGIDO - JWT)
```
DELETE http://localhost:3000/api/productos/uuid-producto
Authorization: Bearer <token_jwt>

Respuesta: 200 OK
{
  "mensaje": "Producto Martillo de Acero eliminado correctamente"
}
```

---

## 🧪 EJEMPLOS CON CURL/PowerShell

### Opción 1: Listar Productos
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/productos?page=1&limit=5" `
  -Method GET | ConvertTo-Json
```

### Opción 2: Crear Producto (necesitas JWT)

#### Primero, login para obtener token:
```powershell
$loginBody = @{
    email = "admin@ferreteria.com"
    password = "Admin@123"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $loginBody

$token = ($loginResponse.Content | ConvertFrom-Json).access_token
```

#### Luego, crear producto:
```powershell
$productoBody = @{
    nombre = "Taladro Inalámbrico"
    descripcion = "Taladro moderno de batería"
    codigo = "TAL-001"
    precio_venta = 89.99
    precio_costo = 45.00
    stock = 30
    categoria_id = "uuid-categoria"  # Usar uuid real de categoría
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/productos" `
  -Method POST `
  -ContentType "application/json" `
  -Headers @{ "Authorization" = "Bearer $token" } `
  -Body $productoBody | ConvertTo-Json
```

---

## 📊 CARACTERÍSTICAS ESPECIALES

### Búsqueda Inteligente
```
GET /api/productos?buscar=mart

Busca en todas las palabras que contengan "mart"
(case-insensitive)
```

### Paginación
```
GET /api/productos?page=2&limit=20

- page: número de página (empieza en 1)
- limit: items por página
- Retorna también: total, totalPages para UI
```

### Filtros Combinados
```
GET /api/productos?buscar=martillo&categoria=uuid&estado=ACTIVO&page=1&limit=10

Combinable: búsqueda + categoría + estado + paginación
```

### Cálculo de Margen
```
Service tiene método: calcularMargen(precio_venta, precio_costo)

Resultado: % de ganancia
Ej: calcularMargen(100, 50) = 100% (margen)
```

### Actualización de Stock
```
El Service tiene método interno:
actualizarStock(productoId, cantidad, tipo)

Tipos: 'venta' | 'devolucion' | 'compra'
- venta: resta stock
- devolucion: suma stock
- compra: suma stock

Usado por módulos VENTAS y COMPRAS
```

---

## 🔐 VALIDACIONES

### Al Crear/Actualizar:
```
❌ Email inválido
❌ Precio negativo
❌ Stock negativo
❌ Código duplicado
❌ Campos requeridos vacíos
❌ Strings muy largos
```

### Errores que retorna:
```
400 Bad Request: Validación fallida
404 Not Found: Producto no existe
409 Conflict: Código duplicado
401 Unauthorized: Sin token JWT
```

---

## 📝 PRÓXIMA VERIFICACIÓN

Cuando verifiques que funciona, ejecutar:

```powershell
# Test 1: Listar todos
Invoke-WebRequest "http://localhost:3000/api/productos" | ConvertTo-Json

# Test 2: Listar con filtro
Invoke-WebRequest "http://localhost:3000/api/productos?limit=5&buscar=herramienta" | ConvertTo-Json

# Test 3: Bajo stock
Invoke-WebRequest "http://localhost:3000/api/productos/alertas/bajo-stock?limite=5" | ConvertTo-Json

# Test 4: Crear (después de login)
# (Ver ejemplos arriba con PowerShell)
```

---

## ✨ ESTRUCTURA DEL MÓDULO

```
productos/
├── dto/
│   ├── create-producto.dto.ts
│   ├── update-producto.dto.ts
│   └── index.ts (exporta todos)
├── producto.entity.ts               (mapea tabla)
├── productos.service.ts             (lógica)
├── productos.controller.ts          (endpoints)
├── productos.module.ts              (módulo)
└── index.ts                         (exporta todo)
```

---

## 🎯 INTEGRACIÓN CON OTROS MÓDULOS

### Módulo VENTAS usará:
```typescript
// Para restar stock
await productosService.actualizarStock(
  producto_id, 
  cantidad, 
  'venta'
);
```

### Módulo COMPRAS usará:
```typescript
// Para sumar stock
await productosService.actualizarStock(
  producto_id, 
  cantidad, 
  'compra'
);
```

### Módulo REPORTES usará:
```typescript
// Para calcular margen
const margen = productosService.calcularMargen(
  precioVenta, 
  precioCosto
);
```

---

**¿Listo para verificar que compila sin errores?** 

El backend debería estar recompilando automáticamente. Cuando veas "Found 0 errors", dime y hacemos el primer test.

