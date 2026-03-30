# 🚀 PRIMEROS PASOS - Ferretería POS

**Tiempo estimado de lectura: 10 minutos**  
**Tiempo estimado de instalación: 5-10 minutos**

---

## 📋 Requisitos Previos

Antes de empezar, asegúrate de tener instalado:

- ✅ **Node.js 18.0.0 o superior** - [Descargar](https://nodejs.org)
- ✅ **npm 9.0.0 o superior** - (Viene con Node.js)
- ✅ **PostgreSQL 14 o superior** - [Descargar](https://www.postgresql.org/download)
- ✅ **Git** (para clonar el repositorio) - [Descargar](https://git-scm.com)

### Verificar que está todo instalado:

**Windows (PowerShell):**
```powershell
node --version    # Debe mostrar algo como v18.0.0 o superior
npm --version     # Debe mostrar algo como 9.0.0 o superior
psql --version    # Debe mostrar PostgreSQL version
```

**Linux/macOS:**
```bash
node --version    # Debe mostrar algo como v18.0.0 o superior
npm --version     # Debe mostrar algo como 9.0.0 o superior
psql --version    # Debe mostrar PostgreSQL version
```

---

## 📥 PASO 1: Clonar el Repositorio

Abre una terminal y ejecuta:

```bash
git clone https://github.com/TU_USUARIO/ferreteria-pos.git
cd ferreteria-pos
```

Reemplaza `TU_USUARIO` con tu usuario de GitHub.

---

## ⚙️ PASO 2: Ejecutar el Script de Instalación

El script automatiza todo: instala dependencias, configura archivos y crea directorio de logs.

### **Windows:**
```powershell
.\setup.bat
```

### **Linux/macOS:**
```bash
chmod +x setup.sh
./setup.sh
```

**¿Qué hace el script?**
- ✅ Verifica Node.js y npm
- ✅ Copia configuración desde `.env.example` o `.env.bolivia`
- ✅ Instala todas las dependencias del proyecto
- ✅ Prepara directorios necesarios
- ✅ Guía pasos adicionales

---

## 🗄️ PASO 3: Configurar Base de Datos PostgreSQL

### 3.1 Crear la Base de Datos

Abre una terminal de PostgreSQL o pgAdmin:

```sql
CREATE DATABASE ferreteria_pos;
```

O desde línea de comandos:

```bash
psql -U postgres -c "CREATE DATABASE ferreteria_pos;"
```

### 3.2 Ejecutar los Scripts SQL

Los scripts crean las tablas, índices, vistas y datos iniciales.

**Windows (PowerShell):**
```powershell
cd database
psql -U postgres -d ferreteria_pos -f 01_create_schema.sql
psql -U postgres -d ferreteria_pos -f 02_insert_seeds.sql
psql -U postgres -d ferreteria_pos -f 03_create_views.sql
psql -U postgres -d ferreteria_pos -f 04_procedures_and_utilities.sql
cd ..
```

**Linux/macOS:**
```bash
cd database
psql -U postgres -d ferreteria_pos -f 01_create_schema.sql
psql -U postgres -d ferreteria_pos -f 02_insert_seeds.sql
psql -U postgres -d ferreteria_pos -f 03_create_views.sql
psql -U postgres -d ferreteria_pos -f 04_procedures_and_utilities.sql
cd ..
```

**Or usando pgAdmin:**
1. Abre pgAdmin en `http://localhost:5050`
2. Conecta a tu servidor PostgreSQL
3. Abre la base de datos `ferreteria_pos`
4. Abre "Query Tool"
5. Copia y pega el contenido de cada script SQL (en orden)
6. Ejecuta con `F5` o el botón ▶

**¿Qué se crea?**
- 13 tablas completas
- 41 índices optimizados
- 8 vistas de negocio
- Datos iniciales (usuarios, productos, categorías)
- Funciones y procedimientos almacenados

---

## 🔐 PASO 4: Configurar Variables de Entorno

El script copia `.env.example` a `backend/.env`. **IMPORTANTE**: Revisa y actualiza si necesario.

### Editar `backend/.env`:

```bash
# Base de Datos
DB_HOST=localhost          # Host del servidor PostgreSQL
DB_PORT=5432              # Puerto (por defecto 5432)
DB_USERNAME=postgres      # Usuario PostgreSQL
DB_PASSWORD=postgres      # Contraseña PostgreSQL
DB_NAME=ferreteria_pos   # Nombre de la BD creada

# JWT (Autenticación)
JWT_SECRET=tu-secret-key-cambiar-en-produccion
JWT_EXPIRATION=3600       # 1 hora
JWT_REFRESH_SECRET=tu-refresh-secret-cambiar
JWT_REFRESH_EXPIRATION=604800  # 7 días

# Frontend
CORS_ORIGIN=http://localhost:4200

# Seguridad
BCRYPT_ROUNDS=10          # Rounds para hash de contraseñas
```

⚠️ **IMPORTANTE PARA PRODUCCIÓN:**
- Cambia `JWT_SECRET` y `JWT_REFRESH_SECRET` a valores seguros
- Usa contraseña fuerte para PostgreSQL
- Configura variables según tu entorno

---

## 🚀 PASO 5: Iniciar la Aplicación

### Opción A: Iniciar TODO (Backend + Frontend)

```bash
npm start
```

- ✅ Backend en `http://localhost:3000`
- ✅ Frontend en `http://localhost:4200`

### Opción B: Iniciar Backend SOLO

```bash
npm run start:backend
```

### Opción C: Iniciar Frontend SOLO

```bash
npm run start:frontend
```

---

## 🔓 PASO 6: Logear en la Aplicación

Una vez que todo esté corriendo, ve a `http://localhost:4200`

### Usuarios de Prueba Disponibles:

| Email | Contraseña | Rol |
|-------|-----------|-----|
| `admin@ferreteria.com` | `Admin@123` | ADMIN |
| `gerente@ferreteria.com` | `Admin@123` | GERENTE |
| `vendedor@ferreteria.com` | `Admin@123` | VENDEDOR |
| `almacen@ferreteria.com` | `Admin@123` | ALMACENERO |

---

## 🔐 Cómo Funciona la Autenticación (JWT + Bcrypt)

### ¿Cómo se hashean las contraseñas?

El sistema usa **bcrypt** con 10 rounds.

**Ejemplo en el código:**
```typescript
// En auth.service.ts - Hasheo de contraseña
const hashedPassword = await bcrypt.hash(plainPassword, 10);

// Al login - Verificación
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
```

**¿Por qué bcrypt?**
- ✅ Seguro contra ataques de fuerza bruta
- ✅ Adaptable (puedes aumentar rounds)
- ✅ Estándar de industria
- ✅ Salt único por contraseña

### ¿Cómo funciona el JWT?

1️⃣ **Usuario loguea** → Envía email + contraseña  
2️⃣ **Backend verifica** → Compara con bcrypt  
3️⃣ **Genera JWT** → Token con 3600 segundos (1 hora)  
4️⃣ **Frontend almacena** → En localStorage  
5️⃣ **Futuras peticiones** → Envía token en header `Authorization`  
6️⃣ **Backend valida** → Verifica firma JWT  

**Formato del JWT:**
```
Header.Payload.Signature

{
  "id": "uuid-del-usuario",
  "email": "admin@ferreteria.com",
  "nombre": "Admin",
  "rol": "ADMIN",
  "iat": 1706123456,  // Issued At
  "exp": 1706127056   // Expiration
}
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### ❌ Error: "Cannot connect to database"

**Solución:**
1. Verifica que PostgreSQL esté corriendo:
   ```bash
   psql -U postgres -c "SELECT 1;"
   ```
2. Verifica credenciales en `backend/.env`
3. Verifica que la BD `ferreteria_pos` exista:
   ```bash
   psql -U postgres -l | grep ferreteria_pos
   ```

### ❌ Error: "Port 3000 already in use"

**Solución:**
```bash
# Windows (PowerShell)
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Linux/macOS
lsof -i :3000
kill -9 <PID>
```

### ❌ Error: "Module not found"

**Solución:**
```bash
# Reinstala dependencias
npm run install:all

# O específicamente
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### ❌ Error: "npm: command not found"

**Solución:**
- Node.js no está instalado correctamente
- Reinstala desde [nodejs.org](https://nodejs.org)
- Reinicia la terminal después de instalar

---

## 📚 Documentación Adicional

Cuando necesites información más detallada:

| Documento | Para... |
|-----------|---------|
| [AUTH_GUIDE.md](AUTH_GUIDE.md) | Cómo usar login y proteger rutas |
| [PRODUCTOS_GUIDE.md](PRODUCTOS_GUIDE.md) | Gestión de productos |
| [DATABASE_DIAGRAM.md](database/DATABASE_DIAGRAM.md) | Estructura de base de datos |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arquitectura del proyecto |
| [BUSINESS_FLOWS.md](docs/BUSINESS_FLOWS.md) | Diagramas de flujos de negocio |

---

## ✅ Checklist de Verificación

- [ ] Node.js 18+ instalado
- [ ] npm 9+ instalado
- [ ] PostgreSQL corriendo
- [ ] Repositorio clonado
- [ ] `setup.bat` o `setup.sh` ejecutado
- [ ] Base de datos `ferreteria_pos` creada
- [ ] Scripts SQL ejecutados (4 arquivos en orden)
- [ ] `backend/.env` configurado
- [ ] `npm start` ejecutado sin errores
- [ ] Backend accesible en http://localhost:3000
- [ ] Frontend accesible en http://localhost:4200
- [ ] Logear con admin@ferreteria.com / Admin@123

---

## 🎉 ¡Listo!

¡Tu sistema Ferretería POS está corriendo! 

### Próximos Pasos:

1. Explora el Dashboard (http://localhost:4200)
2. Lee la documentación de módulos que necesites
3. Comienza a desarrollar nuevas características
4. Revisa los tests: `npm run test`

---

## 📞 Soporte y Preguntas

Si tienes dudas:

1. Revisa la carpeta `docs/` para documentación detallada
2. Consulta los comentarios en el código
3. Revisa el archivo de logs: `backend/logs/`
4. Crea un issue en el repositorio

---

**Última actualización:** Marzo 2026  
**Versión:** 1.0-alpha  
**Mantenedor:** Tu Equipo Dev
