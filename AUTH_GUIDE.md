# 🔐 MÓDULO AUTH - GUÍA DE USO

## ✅ Qué se implementó

```
✅ POST /api/auth/login          - Endpoint para login
✅ GET /api/auth/perfil          - Endpoint protegido (necesita JWT)
✅ JWT Strategy                  - Validación de tokens
✅ Auth Guard                    - Protección de rutas
✅ Login DTO                     - Validación de email/password
```

---

## 📝 USAR EL MÓDULO AUTH

### 1. Login (obtener token)

**Endpoint:**
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json
```

**Body (uno de estos usuarios):**
```json
{
  "email": "admin@ferreteria.com",
  "password": "Admin@123"
}
```

**O:**
```json
{
  "email": "gerente@ferreteria.com",
  "password": "Admin@123"
}
```

**Respuesta exitosa (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "uuid...",
    "email": "admin@ferreteria.com",
    "nombre": "Admin",
    "rol": "ADMIN"
  }
}
```

---

### 2. Usar Token (acceder a ruta protegida)

**Copia el token:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Endpoint protegido:**
```
GET http://localhost:3000/api/auth/perfil
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta:**
```json
{
  "mensaje": "Bienvenido a tu perfil",
  "usuario": {
    "id": "uuid...",
    "email": "admin@ferreteria.com",
    "nombre": "Admin",
    "rol": "ADMIN"
  }
}
```

---

## 🧪 PROBAR CON POSTMAN

### 1. Crear request POST

1. Abrir Postman
2. Click "+" para nueva request
3. Seleccionar POST
4. URL: `http://localhost:3000/api/auth/login`

### 2. Agregar headers

```
Content-Type: application/json
```

### 3. Body (JSON)

```json
{
  "email": "admin@ferreteria.com",
  "password": "Admin@123"
}
```

### 4. Click "Send"

Te dará un token. **Cópialo.**

### 5. Crear nuevo request GET

1. URL: `http://localhost:3000/api/auth/perfil`
2. Headers → "Authorization"
3. Type: "Bearer Token"
4. Token: Pega el token que copiaste
5. Click "Send"

**Deberías ver tus datos de usuario** ✅

---

## 🔐 CÓMO PROTEGER OTROS ENDPOINTS

En cualquier controller, usa el guard:

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('api/productos')
export class ProductosController {
  
  @Get()
  listarTodos() {
    // Público - sin guard
    return [...];
  }

  @Post()
  @UseGuards(JwtAuthGuard)  // ← Protegido, requiere JWT
  crearProducto(@Body() dto, @Request() req) {
    console.log('Usuario:', req.user);
    return [...];
  }
}
```

---

## 📊 USUARIOS DE PRUEBA

Todos con password: **Admin@123**

```
admin@ferreteria.com       rol: ADMIN
gerente@ferreteria.com     rol: GERENTE
vendedor@ferreteria.com    rol: VENDEDOR
almacen@ferreteria.com     rol: ALMACENERO
```

---

## ✨ PRÓXIMO PASO

Cuando termines de probar:

```
git add .
git commit -m "✨ Agregado módulo Auth - Login con JWT"
git push
```

---

**¿Funciona? Prueba el login ahora!** 👇

