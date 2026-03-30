# 🏗️ FERRETERÍA POS
## Sistema Integral de Punto de Venta e Inventario

![Status](https://img.shields.io/badge/Status-Alpha%201.0-yellow)
![License](https://img.shields.io/badge/License-MIT-green)
![Node](https://img.shields.io/badge/Node-18%2B-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-blue)

---

## 📑 Tabla de Contenidos

1. [🚀 Quick Start](#-quick-start)
2. [📖 Descripción](#-descripción)
3. [✨ Características](#-características)
4. [📋 Stack Tecnológico](#-stack-tecnológico)
5. [🗂️ Estructura](#-estructura-del-proyecto)
6. [📦 Instalación](#-instalación)
7. [🧪 Testing](#-testing)
8. [📚 Documentación](#-documentación)

---

## 🚀 Quick Start

**Tiempo estimado: 5-10 minutos de instalación**

### Requisitos Previos
- ✅ **Node.js 18+** - [Descargar](https://nodejs.org)
- ✅ **PostgreSQL 14+** - [Descargar](https://www.postgresql.org)
- ✅ **Git** - [Descargar](https://git-scm.com)

### Setup Automatizado (Recomendado)

```powershell
# Windows PowerShell
git clone https://github.com/TU_USUARIO/ferreteria-pos.git
cd ferreteria-pos
.\setup.bat
```

```bash
# Linux / macOS
git clone https://github.com/TU_USUARIO/ferreteria-pos.git
cd ferreteria-pos
chmod +x setup.sh
./setup.sh
```

**¿Qué hace el script?**
- ✅ Verifica Node.js y PostgreSQL
- ✅ Instala dependencias (backend + frontend)
- ✅ Configura archivo `.env`
- ✅ Prepara directorios necesarios

### Después del Setup: Iniciar la Aplicación

```bash
npm start
```

Esto abre:
- 🔧 **Backend**: http://localhost:3000
- 🎨 **Frontend**: http://localhost:4200

**Usuarios de prueba**: Ver sección [🔐 Autenticación](#-autenticación)

Para guía **paso a paso** completa → [PRIMEROS_PASOS.md](PRIMEROS_PASOS.md)

---

## 📖 Descripción

**Ferretería POS** es un sistema profesional de punto de venta e inventario diseñado específicamente para ferreterías. Utiliza arquitectura enterprise-grade con enfoque en:

- ✅ **Facilidad de uso** - Interfaz intuitiva y rápida
- ✅ **Confiabilidad** - Datos seguros y auditados
- ✅ **Escalabilidad** - Diseño modular y preparado para crecer
- ✅ **Automatización** - Procesos inteligentes y sin fricciones
- ✅ **Reportes** - Analytics en tiempo real

---

## ✨ Características

### 🛒 Módulo POS
- Interfaz rápida de ventas
- Carrito inteligente
- Descuentos y promociones
- Devoluciones fáciles
- Múltiples métodos de pago

### 📦 Inventario
- Control de stock en tiempo real
- Alertas automáticas de bajo stock
- Historial de movimientos
- Códigos de barras
- Ubicación de productos

### 🏪 Compras
- Gestión de proveedores
- Órdenes de compra
- Recepción de mercancía
- Notas de devolución
- Historial de precios

### 💰 Caja
- Cierre de caja automático
- Cuadratura de movimientos
- Histórico de transacciones
- Depósitos y retiros
- Auditoría de operaciones

### 📊 Reportes
- Ventas diarias / mensuales
- Productos más vendidos
- Margen de ganancia
- Análisis de proveedores
- Rendimiento de vendedores
- Exportar a Excel / PDF

### 🔐 Seguridad
- Control de acceso por roles (RBAC)
- Autenticación JWT con tokens
- Hasheo de contraseñas con Bcrypt
- Auditoría completa de cambios
- Trazabilidad de operaciones
- Contraseñas encriptadas en BD

---

## � Autenticación y Seguridad

### ¿Cómo funciona el Login?

El sistema usa **JWT (JSON Web Tokens)** con **Bcrypt** para máxima seguridad:

```
1. Usuario ingresa email + contraseña en formulario
   ↓
2. Backend VERIFICA contraseña con Bcrypt (no es plain text)
   ↓
3. Si es correcta, genera JWT válido por 1 hora
   ↓
4. Frontend guarda token en localStorage
   ↓
5. Futuras peticiones incluyen token en header Authorization
   ↓
6. Backend valida token antes de procesar cada petición
```

### Hasheo de Contraseñas (Bcrypt)

Las contraseñas **NUNCA** se guardan en la BD como texto plano. Sistema:

- ✅ Bcrypt con **10 rounds** (estándar de seguridad)
- ✅ Salt único por contraseña
- ✅ Imposible de revertir (es hash, no encriptación)
- ✅ Protegido contra ataques de fuerza bruta

**Ejemplo en código:**
```typescript
// Al crear usuario o cambiar contraseña
const hashedPassword = await bcrypt.hash(plainPassword, 10);
// Resultado: $2b$10$N9qo8uLO.../AAK7hhWGP.

// Al verificar login
const isValid = await bcrypt.compare(inputPassword, storedHash);
// Compara sin desencriptar
```

### JWT - Autenticación sin Sesiones

**Ventajas del JWT:**
- ✅ Stateless (sin guardar sesiones en servidor)
- ✅ Seguro (firma criptográfica)
- ✅ Escalable (funciona con múltiples servidores)
- ✅ Mobile-friendly (ideal para apps)

**Token JWT (válido 1 hora):**
```json
{
  "id": "user-uuid-123456789",
  "email": "admin@ferreteria.com",
  "nombre": "Admin",
  "rol": "ADMIN",
  "iat": 1706123456,
  "exp": 1706127056
}
```

### Configuración de Seguridad

En `backend/.env`:
```env
# Hasheo de contraseñas
BCRYPT_ROUNDS=10          # Rounds: más = más seguro pero lento

# JWT Autenticación
JWT_SECRET=tu-secret-key-super-segura-cambiar-en-produccion
JWT_EXPIRATION=3600       # 1 hora
JWT_REFRESH_SECRET=tu-refresh-secret-super-seguro
JWT_REFRESH_EXPIRATION=604800  # 7 días

# CORS (para el frontend)
CORS_ORIGIN=http://localhost:4200
```

⚠️ **IMPORTANTE:**
- Cambia `JWT_SECRET` en producción a valor aleatorio
- No publiques `.env` en Git (revisa `.gitignore`)
- Usa HTTPS en producción

---

## 🔐 Usuarios de Prueba

Todos con contraseña: `Admin@123`

| Email | Rol | Acceso | Descripción |
|-------|-----|--------|-------------|
| **admin@ferreteria.com** | ADMIN | ✅ Todo | Acceso total al sistema |
| **gerente@ferreteria.com** | GERENTE | 📊 Reportes, usuarios | Gestión de tienda |
| **vendedor@ferreteria.com** | VENDEDOR | 🛒 POS, ventas | Punto de venta |
| **almacen@ferreteria.com** | ALMACENERO | 📦 Inventario, compras | Gestión de stock |

### Cómo Logear

1. Ve a http://localhost:4200
2. Usa credenciales de arriba
3. Se genera JWT automáticamente
4. Acceso al dashboard según rol

---

### Backend
| Componente | Versión | Propósito |
|-----------|---------|----------|
| **Node.js** | 18+ | Runtime |
| **NestJS** | 10+ | Framework REST |
| **TypeScript** | 5+ | Lenguaje |
| **TypeORM** | 0.3+ | ORM |
| **PostgreSQL** | 14+ | Base de datos |
| **JWT** | - | Autenticación |
| **Swagger** | - | Documentación API |

### Frontend
| Componente | Versión | Propósito |
|-----------|---------|----------|
| **Angular** | 18+ | Framework SPA |
| **TypeScript** | 5+ | Lenguaje |
| **RxJS** | 7+ | Programación reactiva |
| **Tailwind CSS** | 3+ | Estilos |
| **PrimeNG** | 17+ | Componentes UI |

### DevOps
| Componente | Propósito |
|-----------|----------|
| **PostgreSQL** | Base de datos |
| **GitHub Actions** | CI/CD (futuro) |

---

## 🗂️ Estructura del Proyecto

```
ferreteria/
├── database/                    # 📊 Scripts SQL
│   ├── 01_create_schema.sql    # Tablas, índices, constraints
│   ├── 02_insert_seeds.sql     # Datos iniciales Test
│   ├── 03_create_views.sql     # Vistas de negocio
│   └── 04_procedures_and_utilities.sql  # Functions PL/pgSQL
│
├── backend/                     # 🔧 API NestJS (Próximo)
│   ├── src/
│   │   ├── modules/           # Módulos funcionales
│   │   ├── common/            # Código compartido
│   │   ├── core/              # Guards, filters, decorators
│   │   └── main.ts
│   └── package.json
│
├── frontend/                    # 🎨 UI Angular (Próximo)
│   ├── src/
│   │   ├── app/
│   │   │   ├── modules/       # Lazy-loaded modules
│   │   │   ├── core/          # Singletons
│   │   │   └── shared/        # Shared components
│   │   └── main.ts
│   ├── package.json
│   └── angular.json
│
├── docs/                        # 📚 Documentación
│   ├── ARCHITECTURE.md         # Diseño del sistema
│   ├── DATABASE_DIAGRAM.md     # Diagrama ER
│   ├── BUSINESS_FLOWS.md       # Flujos de negocio
│   └── QUICK_START.md          # Guía de inicio
│
├── .env.example                 # Variables de entorno
├── .gitignore
├── setup.bat                    # Setup Windows
├── setup.sh                     # Setup Linux/Mac
├── README.md                    # Este archivo
├── CONFIGURACION_RAPIDA.md      # 3 opciones de setup
└── PROJECT_STATUS.md            # Estado del proyecto
```

---

## 📦 Instalación Detallada

### 1️⃣ Clonar Repositorio

```bash
git clone https://github.com/TU_USUARIO/ferreteria-pos.git
cd ferreteria-pos
```

### 2️⃣ Ejecutar Script de Setup (Automatizado)

**Windows (PowerShell):**
```powershell
.\setup.bat
```

**macOS/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

**¿Qué hace setup.bat/setup.sh?**
```
✅ Verifica Node.js y PostgreSQL instalados
✅ Copia .env.example o .env.bolivia a backend/.env
✅ npm install en raíz
✅ npm install en backend/
✅ npm install en frontend/
✅ Prepara directorios de logs
```

### 3️⃣ Configurar Base de Datos

#### Opción A: PostgreSQL desde línea de comandos (Rápido)

```bash
# Crear la base de datos
createdb -U postgres ferreteria_pos

# Ejecutar scripts SQL (en este orden)
cd database
psql -U postgres -d ferreteria_pos -f 01_create_schema.sql
psql -U postgres -d ferreteria_pos -f 02_insert_seeds.sql
psql -U postgres -d ferreteria_pos -f 03_create_views.sql
psql -U postgres -d ferreteria_pos -f 04_procedures_and_utilities.sql
cd ..
```

#### Opción B: pgAdmin UI (Visual)

1. Abre pgAdmin: http://localhost:5050
2. Conecta a tu servidor PostgreSQL
3. Crea nueva base de datos: `ferreteria_pos`
4. Abre Query Tool
5. Copia y pega contenido de cada SQL (en orden):
   - `database/01_create_schema.sql`
   - `database/02_insert_seeds.sql`
   - `database/03_create_views.sql`
   - `database/04_procedures_and_utilities.sql`
6. Ejecuta con F5

### 4️⃣ Verificar Configuración

Revisa que `backend/.env` tenga:

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=ferreteria_pos

# JWT
JWT_SECRET=tu-secret-key-cambiar-en-produccion
JWT_EXPIRATION=3600

# Frontend
CORS_ORIGIN=http://localhost:4200
```

⚠️ **Cambiar en producción:**
- `JWT_SECRET` → valor seguro aleatorio
- `DB_PASSWORD` → contraseña fuerte
- `CORS_ORIGIN` → dominio real

### 5️⃣ Verificar que BD se creó correctamente

```sql
-- Conectar a ferreteria_pos y verificar
SELECT COUNT(*) FROM usuarios;      -- Debe ser: 4
SELECT COUNT(*) FROM productos;     -- Debe ser: 6
SELECT COUNT(*) FROM categorias;    -- Debe ser: 6
```

### 6️⃣ Iniciar Aplicación

```bash
npm start
```

O si prefieres separado:

```bash
# Terminal 1 - Backend
npm run start:backend

# Terminal 2 - Frontend  
npm run start:frontend
```

**Resultados:**
- ✅ Backend en http://localhost:3000
- ✅ Frontend en http://localhost:4200
- ✅ Base de datos en localhost:5432

### Reinstalar si hay problemas

```bash
# Limpiar todo
npm run install:all

# O manual:
rm -rf backend/node_modules frontend/node_modules
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

---

## 🧪 Testing

Todos los tests se ejecutan desde la raíz del proyecto:

```bash
# Tests de Backend (NestJS)
npm run test:backend
npm run test:backend:watch    # Modo watch
npm run test:backend:cov      # Con cobertura

# Tests de Frontend (Angular)
npm run test:frontend
npm run test:frontend:watch   # Modo watch

# Tests E2E (End-to-End)
npm run test:e2e

# Todos los tests
npm run test
```

**Nota:** Phase 2 incluye suite completa de tests.

---

## 📚 Documentación Completa

| Documento | Propósito | Lectura |
|-----------|-----------|---------|
| **PRIMEROS_PASOS.md** | 👈 **Empieza aquí** - Guía paso a paso completa | 10 min |
| **AUTH_GUIDE.md** | Cómo usar login, JWT, permisos | 5 min |
| **PRODUCTOS_GUIDE.md** | Gestión de productos y categorías | 5 min |
| **docs/ARCHITECTURE.md** | Arquitectura completa, patrones SOLID, seguridad | 30 min |
| **docs/DATABASE_DIAGRAM.md** | Diagrama ER, tablas, relaciones, índices | 15 min |
| **docs/BUSINESS_FLOWS.md** | 12 diagramas Mermaid de flujos de negocio | 20 min |
| **docs/QUICK_START.md** | Quick start técnico | 3 min |
| **PROJECT_STATUS.md** | Estado actual del proyecto, roadmap | 5 min |
| **.gitignore** | Archivos que NO se suben a Git | 2 min |
| **package.json** | Scripts disponibles (npm start, etc) | 2 min |

### Orden Recomendado de Lectura

```
1. Este README ✓ (Estás aquí)
2. PRIMEROS_PASOS.md (Instalación paso a paso)
3. AUTH_GUIDE.md (Autenticación)
4. PRODUCTOS_GUIDE.md (Tu primer módulo)
5. docs/ARCHITECTURE.md (Cuando necesites entender cosas profundas)
```

---

## 🎯 Próximos Pasos Después de Instalar

### ✅ Inmediatos (5 minutos)

1. Verifica acceso al dashboard: http://localhost:4200
2. Loguea con `admin@ferreteria.com` / `Admin@123`
3. Mira los menús y opciones disponibles

### 📖 Aprendizaje (30 minutos)

1. Lee [PRIMEROS_PASOS.md](PRIMEROS_PASOS.md)
2. Lee [AUTH_GUIDE.md](AUTH_GUIDE.md)
3. Revisa [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

### 💻 Desarrollo

1. Abre el código en VSCode
2. Instala extensiones recomendadas:
   - ES Lint
   - Prettier
   - Thunder Client (o Postman)
   - Angular Language Service
3. Explora la estructura de carpetas
4. Corre los tests: `npm run test`

### 🚀 Deployment

1. Sigue instrucciones en [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#deployment)
2. Configura variables.env para producción
3. Realiza deploy en tu servidor

---

---

## 🎯 Roadmap y Estado

**Versión Actual:** 1.0-Alpha (Marzo 2026)

```
Phase 1: Database & Documentation      ✅ COMPLETADO
├── 13 tablas
├── 41 índices
├── 8 vistas
├── Documentación completa
└── 4 usuarios de prueba

Phase 2: Backend (NestJS)             ⏳ EN PROGRESO
├── Módulo Auth (Login, JWT)          ✅ Hecho
├── Módulo Usuarios
├── Módulo Productos
├── Módulo Ventas
├── Tests unitarios
└── Documentación API

Phase 3: Frontend (Angular)           ⏳ EN PROGRESO
├── Autenticación/Login
├── Dashboard
├── Módulo de Productos
├── Módulo de Ventas (POS)
├── Componentes UI
└── Tests

Phase 4: Testing & DevOps             🔄 PRÓXIMO
├── Suite completa de tests
├── CI/CD con GitHub Actions
└── Monitoreo

Phase 5: Producción                   🔜 FUTURO
├── SSL/HTTPS
├── Rate limiting
├── Caché distribuida
├── Backup automático
└── Disaster recovery
```

---

---

## 💡 Variables de Entorno (.env)

El archivo `backend/.env` controla toda la configuración. Setup.bat/sh copia automáticamente `.env.bolivia` o `.env.example`.

**⚠️ IMPORTANTE:** `.env` NO se sube a Git (ver `.gitignore`). Cada desarrollador debe tener el suyo.

### Variables Principales

```env
# ============================================================================
# ENTORNO
# ============================================================================
NODE_ENV=development          # development | staging | production
PORT=3000                     # Puerto del backend
APP_NAME=Ferreteria POS API

# ============================================================================
# BASE DE DATOS - PostgreSQL
# ============================================================================
DB_HOST=localhost             # Host servidor PostgreSQL
DB_PORT=5432                  # Puerto PostgreSQL (por defecto 5432)
DB_USERNAME=postgres          # Usuario PostgreSQL
DB_PASSWORD=postgres          # Contraseña PostgreSQL
DB_NAME=ferreteria_pos       # Nombre de la base de datos

# ============================================================================
# JWT - Autenticación
# ============================================================================
JWT_SECRET=tu-secret-key-cambiar-en-produccion
JWT_EXPIRATION=3600           # Tiempo en segundos (1 hora)
JWT_REFRESH_SECRET=tu-refresh-secret-cambiar
JWT_REFRESH_EXPIRATION=604800 # Tiempo en segundos (7 días)

# ============================================================================
# SEGURIDAD
# ============================================================================
BCRYPT_ROUNDS=10              # Rounds para hash de contraseñas
CORS_ORIGIN=http://localhost:4200
CORS_CREDENTIALS=true

# ============================================================================
# LOGGING
# ============================================================================
LOG_LEVEL=debug               # debug | info | warn | error
LOG_DIR=./logs
```

### Cambios para Producción

**Antes de deployar, OBLIGATORIO cambiar:**

```env
# Cambiar de development a production
NODE_ENV=production

# Generar secret FUERTE (mínimo 32 caracteres random)
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Contraseña de BD fuerte
DB_PASSWORD=MiContraseñaSuperSegura2024!

# URL real del frontend
CORS_ORIGIN=https://tudominio.com

# Reduced logging
LOG_LEVEL=warn
```

---

## 🐛 Solución de Problemas

### ❌ "Cannot connect to database"

**Solución:**

1. Verifica que PostgreSQL esté corriendo:
   ```bash
   psql -U postgres -c "SELECT 1;" 
   ```

2. Verifica credenciales en `backend/.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   ```

3. Verifica que la BD exista:
   ```bash
   psql -U postgres -l | grep ferreteria_pos
   ```

4. Si no existe, créala:
   ```bash
   createdb -U postgres ferreteria_pos
   ```

### ❌ "Port 3000 already in use"

**Windows:**
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

**macOS/Linux:**
```bash
lsof -i :3000
kill -9 <PID>
```

### ❌ "Port 5432 already in use"

```bash
# Si tienes otro PostgreSQL corriendo
# Opción 1: Cambia puerto en backend/.env
DB_PORT=5433

# Opción 2: Detén PostgreSQL anterior
# Windows: services.msc → PostgreSQL → Stop
# Linux: sudo systemctl stop postgresql
```

### ❌ "Module not found / npm ERR"

```bash
# Reinstala dependencias
npm run install:all

# O específicamente
rm -rf backend/node_modules frontend/node_modules
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### ❌ "Scripts SQL fallan"

**Error típico:** "relation does not exist"

```bash
# Asegúrate de ejecutar los scripts EN ORDEN:
# 1. 01_create_schema.sql     ← Las tablas
# 2. 02_insert_seeds.sql      ← Los datos
# 3. 03_create_views.sql      ← Las vistas
# 4. 04_procedures_and_utilities.sql  ← Funciones

# Si falla, borra BD y empieza:
dropdb -U postgres ferreteria_pos
createdb -U postgres ferreteria_pos
# Luego ejecuta los 4 scripts en orden
```

### ❌ "npm: command not found"

Node.js no está instalado correctamente.

```bash
# Desinstala completamente Node.js
# Descarga desde https://nodejs.org/
# Reinstala versión 18+ LTS

# Verifica después de instalar
node --version
npm --version
```

### ❌ "JWT Error / 401 Unauthorized"

```bash
# Verificar que JWT_SECRET está configurado
cat backend/.env | grep JWT_SECRET

# Si está vacío, edita backend/.env y agrega:
JWT_SECRET=tu-secret-super-seguro-cambiar

# Reinicia backend
```

### ℹ️ Ver Logs del Backend

```bash
# Todos los logs
tail -f backend/logs/*.log

# Solo errores
cat backend/logs/error.log | tail -20

# En tiempo real (Windows)
Get-Content backend/logs/error.log -Wait
```

---

### Documentación Técnica

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Arquitectura completa
- [DATABASE_DIAGRAM.md](docs/DATABASE_DIAGRAM.md) - Diagrama ER
- [BUSINESS_FLOWS.md](docs/BUSINESS_FLOWS.md) - Flujos de negocio

---

## 📄 Licencia

MIT License - Libre para usar, modificar y distribuir.

Ver [LICENSE](LICENSE) para detalles.

---

## 👨‍💻 Contribuir al Proyecto

Las contribuciones son bienvenidas. Por favor sigue estos pasos:

### 1. Fork del Proyecto

```bash
git clone https://github.com/TU_USUARIO/ferreteria-pos.git
cd ferreteria-pos
```

### 2. Crear una Rama

```bash
git checkout -b feature/amazing-feature
```

### 3. Hacer Cambios

- Sigue [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para patrones
- Code style: Prettier + ESlint
- Escribe tests para nuevas funcionalidades
- Actualiza documentación si es necesario

### 4. Commit y Push

```bash
git add .
git commit -m "Add amazing feature"
git push origin feature/amazing-feature
```

### 5. Pull Request

Abre un PR descri biendo:
- Qué cambio hiciste y por qué
- Cómo testearlo
- Cualquier información relevante

---

## 📞 Soporte y Contacto

### Documentación Técnica

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - Arquitectura completa
- [docs/DATABASE_DIAGRAM.md](docs/DATABASE_DIAGRAM.md) - Diagrama ER
- [docs/BUSINESS_FLOWS.md](docs/BUSINESS_FLOWS.md) - Flujos de negocio
- [AUTH_GUIDE.md](AUTH_GUIDE.md) - Autenticación y seguridad
- [PRIMEROS_PASOS.md](PRIMEROS_PASOS.md) - Guía paso a paso

### Preguntas Frecuentes

**¿Cómo cambio la contraseña de un usuario?**
→ Usa el módulo de Usuarios en el admin panel

**¿Cómo agrego nuevos productos?**
→ Módulo Productos → Crear nuevo producto

**¿Cómo exporto reportes?**
→ Ver PRODUCTOS_GUIDE.md para detalles

**¿Es seguro ponerlo en producción?**
→ Sí, si sigues la guía de [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#seguridad)

---

## ✨ Agradecimientos

Sistema desarrollado con:
- 💪 NestJS
- ✨ Angular
- 🔐 TypeORM + PostgreSQL
- 🎨 Tailwind CSS + PrimeNG

---

## 📊 Estadísticas del Proyecto

```
📁 Archivos:          ~150
📝 Líneas de código:  ~15,000+
🗄️ Tablas BD:        13
📋 Vistas:           8
🔒 Funciones:        5+
📚 Documentación:    ~100 páginas
⏱️ Tiempo dev:       ~200 horas
```

---

**Última actualización:** Marzo 2026  
**Versión:** 1.0-Alpha  
**Mantenedor:** Tu Equipo Dev  
**Licencia:** MIT

**¡Gracias por usar Ferretería POS! 🚀**
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abrir un Pull Request

---

## 📞 Contacto

- **Issues**: Reportar bugs y sugerencias
- **Discussions**: Hablar sobre el proyecto
- **Email**: soporte@ferreteria.local

---

**Última actualización**: 2024
**Versión**: 1.0-alpha
**Estado**: 🟡 Fase 1 Completada - Fase 2 Próxima

