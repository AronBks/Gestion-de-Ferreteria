# 🚀 GUÍA DE INICIO RÁPIDO - FERRETERIA POS

## ✅ Checklist Pre-Instalación

- [ ] Node.js 18+ instalado (`node --version`)
- [ ] PostgreSQL 14+ instalado y corriendo
- [ ] npm/yarn actualizados
- [ ] Git instalado
- [ ] Editor de código (VSCode recomendado)

---

## 🐘 1. Configuración de PostgreSQL

### En Windows

```powershell
# Verificar que PostgreSQL esté corriendo
# Ir a Services (servicios) y asegurarse que PostgreSQL esté iniciado

# Conectar a PostgreSQL
psql -U postgres

# En la consola psql:
CREATE DATABASE ferreteria_pos;
```

### En Linux/Mac

```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Conectar
psql -U postgres

# En psql:
CREATE DATABASE ferreteria_pos;
```

---

## 2️⃣2. Crear Base de Datos e Importar Scripts

### Opción A: Línea de Comandos

```bash
# Navegar a la carpeta database
cd ferreteria/database

# Ejecutar scripts en orden
psql -U postgres -d ferreteria_pos -f 01_create_schema.sql
psql -U postgres -d ferreteria_pos -f 02_insert_seeds.sql
psql -U postgres -d ferreteria_pos -f 03_create_views.sql
psql -U postgres -d ferreteria_pos -f 04_procedures_and_utilities.sql
```

### Opción B: Interfaz Gráfica (pgAdmin)

1. Abrir pgAdmin
2. Conectar al servidor PostgreSQL
3. Crear nueva base de datos: `ferreteria_pos`
4. Abrir Query Tool
5. Copiar/pegar contenido de cada archivo SQL
6. Ejecutar en orden

### Verificar Instalación

```bash
# Conectar a la BD
psql -U postgres -d ferreteria_pos

# Ver tablas
\dt

# Ver vistas
\dv

# Ver una tabla
\d usuarios

# Salir
\q
```

---

## 🔧 3. Configurar Backend (NestJS)

### 3.1 Inicializar NestJS

```bash
cd ferreteria/backend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env
```

### 3.2 Configurar .env

```env
# database/.env
NODE_ENV=development
PORT=3000

# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=ferreteria_pos

# JWT
JWT_SECRET=tu-super-secret-key-cambiar-en-produccion
JWT_EXPIRATION=3600

# CORS
CORS_ORIGIN=http://localhost:4200
```

### 3.3 Verificar Conexión

```bash
# Ejecutar en modo desarrollo
npm run start:dev

# Debería ver algo como:
# [Nest] 12345 - 27/03/2026, 10:30:15 AM     LOG [NestFactory] Starting Nest application...
# [Nest] 12345 - 27/03/2026, 10:30:16 AM     LOG [InstanceLoader] AppModule dependencies initialized +123ms
# [Nest] 12345 - 27/03/2026, 10:30:16 AM     LOG [RoutesResolver] AppController {/}:
# [Nest] 12345 - 27/03/2026, 10:30:16 AM     LOG [RouterExplorer] Mapped {/, GET} route

# Verificar que esté corriendo
curl http://localhost:3000/health
# Debería retornar: {"status":"ok"}
```

---

## 🎨 4. Configurar Frontend (Angular)

### 4.1 Inicializar Angular

```bash
cd ferreteria/frontend

# Instalar dependencias
npm install

# Configurar environment
# Editar src/environments/environment.ts
```

### 4.2 Verificar environment.ts

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  apiVersion: 'v1'
};
```

### 4.3 Ejecutar Servidor Angular

```bash
npm start

# Debería abrir automáticamente en: http://localhost:4200
# Si no, abrir manualmente en el navegador
```

---

## 📱 5. Verificar Todo Funcione

### 5.1 Test de Base de Datos

```bash
# En una terminal/PowerShell
psql -U postgres -d ferreteria_pos

# Listar tablas
SELECT * FROM usuarios;

# Debería ver el usuario admin
# Salir
\q
```

### 5.2 Test del Backend

```bash
# En otra terminal
cd ferreteria/backend
npm run start:dev

# Debería ver que está corriendo en puerto 3000
# Abrir en navegador: http://localhost:3000/api/docs
# Debería ver documentación Swagger
```

### 5.3 Test del Frontend

```bash
# En otra terminal
cd ferreteria/frontend
npm start

# Debería abrir automáticamente en navegador
# http://localhost:4200
```

---

## 🔑 6. Datos de Prueba

### Login Usuarios Pre-Configurados

```
=====================================
USUARIO: ADMIN
Email: admin@ferreteria.com
Password: Admin@123
Rol: ADMIN
=====================================

USUARIO: GERENTE
Email: gerente@ferreteria.com
Password: Admin@123
Rol: GERENTE
=====================================

USUARIO: VENDEDOR
Email: vendedor1@ferreteria.com
Password: Admin@123
Rol: VENDEDOR
=====================================

USUARIO: ALMACENERO
Email: almacen@ferreteria.com
Password: Admin@123
Rol: ALMACENERO
=====================================
```

**⚠️ IMPORTANTE**: Cambiar contraseñas en producción inmediatamente.

---

## 📋 7. Comandos Útiles

### Backend

```bash
cd backend

# Desarrollo con hot-reload
npm run start:dev

# Producción
npm run build
npm run start:prod

# Tests
npm run test          # Ejecutar tests
npm run test:watch   # Tests en modo watch
npm run test:cov     # Con cobertura

# Linting
npm run lint

# Format
npm run format
```

### Frontend

```bash
cd frontend

# Desarrollo
npm start

# Build
npm run build

# Tests
npm test
npm run test -- --watch
npm test -- --code-coverage

# Linting
npm run lint

# Build de producción
npm run build -- --configuration production
```

### Base de Datos

```bash
cd database

# Conectar a la BD
psql -U postgres -d ferreteria_pos

# Respaldo
pg_dump -U postgres -d ferreteria_pos > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar
psql -U postgres -d ferreteria_pos < backup_2026.sql

# Ver procesos activos
SELECT * FROM pg_stat_activity;

# Matar conexión
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
WHERE datname = 'ferreteria_pos' AND pid <> pg_backend_pid();
```

---

## 🐳 8. Con Docker (Opcional)

### Construir Imágenes

```bash
# En la raíz del proyecto
docker-compose build
```

### Ejecutar Contenedores

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down

# Ver servicios corriendo
docker-compose ps
```

### Servicios Disponibles

- **Frontend**: http://localhost:4200
- **Backend**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **pgAdmin**: http://localhost:5050

---

## 🐛 Troubleshooting

### Error: "Cannot connect to database"

```bash
# Verificar PostgreSQL está corriendo
# Windows
sc query postgresql-x64-14

# Linux
sudo systemctl status postgresql

# Verificar credenciales .env
# Verificar caracteres especiales en password
```

### Error: "Port 3000 already in use"

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux
lsof -i :3000
kill -9 <PID>
```

### Error: "Port 4200 already in use"

```bash
# Windows
netstat -ano | findstr :4200
taskkill /PID <PID> /F

# Linux
lsof -i :4200
kill -9 <PID>
```

### Error: "CORS problem"

```typescript
// Asegurarse que backend permite la URL del frontend
// En backend .env
CORS_ORIGIN=http://localhost:4200

// Reiniciar backend
npm run start:dev
```

### Base de datos vacía después de importar scripts

```bash
# Verificar que los scripts se ejecutaron sin errores
# Conectar a la BD
psql -U postgres -d ferreteria_pos

# Ver tabla
SELECT COUNT(*) FROM usuarios;

# Si está vacía, resetear
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

# Volver a ejecutar scripts
```

---

## 📊 9. Verificación Final

### Checklist Completo

- [ ] PostgreSQL corriendo y BD creada
- [ ] Todos los scripts SQL ejecutados
- [ ] Backend corriendo en puerto 3000
- [ ] Frontend corriendo en puerto 4200
- [ ] Poder hacer login con usuario admin
- [ ] API Swagger accesible en `/api/docs`
- [ ] Base de datos tiene datos iniciales
- [ ] No hay errores en consola

---

## 🎯 Próximos Pasos

1. **Revisar Documentación**
   - [ ] [ARCHITECTURE.md](../docs/ARCHITECTURE.md)
   - [ ] [DATABASE_DIAGRAM.md](../docs/DATABASE_DIAGRAM.md)
   - [ ] [API_DOCUMENTATION.md](../docs/API_DOCUMENTATION.md)

2. **Desarrollar Módulos**
   - [ ] Auth Module completado
   - [ ] Usuarios Module completado
   - [ ] Productos Module completado
   - [ ] Ventas Module completado
   - [ ] Caja Module completado

3. **Testing**
   - [ ] Unit tests para servicios
   - [ ] Integration tests para controllers
   - [ ] E2E tests

4. **Despliegue**
   - [ ] Configurar CI/CD
   - [ ] Desplegar a staging
   - [ ] Desplegar a producción

---

## 📞 Soporte

Si tienenes problemas:

1. Revisar **Troubleshooting** arriba
2. Verificar logs en consola
3. Revisar documentación en `/docs`
4. Contactar al equipo

---

**Versión**: 1.0.0  
**Actualizado**: 27 Marzo 2026  
**Estado**: 🟢 Listo para desarrollo

