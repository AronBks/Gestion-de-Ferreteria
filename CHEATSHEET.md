# ⚡ CHEATSHEET - Comandos Rápidos

Referencia rápida de comandos más usados.

---

## 🚀 Iniciar Desarrollo

```bash
# Instalar TODO
npm run install:all

# Iniciar TODO (Backend + Frontend)
npm start

# Solo Backend
npm run start:backend
cd backend && npm run start:dev

# Solo Frontend
npm run start:frontend
cd frontend && npm start
```

---

## ️ Base de Datos

```bash
# Conectar a BD
psql -U postgres -d ferreteria_pos

# Crear BD desde cero
createdb -U postgres ferreteria_pos

# Eliminar BD (cuidado!)
dropdb -U postgres ferreteria_pos

# Ejecutar todos los scripts SQL
cd database
psql -U postgres -d ferreteria_pos -f 01_create_schema.sql
psql -U postgres -d ferreteria_pos -f 02_insert_seeds.sql
psql -U postgres -d ferreteria_pos -f 03_create_views.sql
psql -U postgres -d ferreteria_pos -f 04_procedures_and_utilities.sql
cd ..

# Verificar datos
psql -U postgres -d ferreteria_pos -c "SELECT COUNT(*) FROM usuarios;"
```

---

## 🧪 Testing

```bash
# Tests Backend
npm run test:backend

# Tests Frontend
npm run test:frontend

# Todos los tests
npm run test

# Con cobertura
npm run test:backend:cov

# Watch mode
npm run test:watch
```

---

## 🔨 Build

```bash
# Build Backend
cd backend && npm run build && cd ..

# Build Frontend
cd frontend && npm run build && cd ..

# Build TODO
npm run build
```

---

## 📝 Linting y Formato

```bash
# Lint Backend
cd backend && npm run lint && cd ..

# Lint + Fix
cd backend && npm run lint --fix && cd ..

# Format con Prettier
npm run format
```

---

## 🔐 Autenticación (Testing)

```bash
# Obtener token JWT
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ferreteria.com","password":"Admin@123"}'

# Usar token en futuras requests
curl -H "Authorization: Bearer <TOKEN>" \
  http://localhost:3000/api/usuarios
```

---

## 🌐 URLs Útiles

| Servicio | URL | Usuario | Pass |
|----------|-----|---------|------|
| Frontend | http://localhost:4200 | admin@ferreteria.com | Admin@123 |
| Backend API | http://localhost:3000 | (JWT) | - |
| Swagger Docs | http://localhost:3000/api/docs | - | - |
| pgAdmin | http://localhost:5050 | admin@pgadmin.org | admin |
| Redis Commander | http://localhost:8081 | - | - |

---

## 🐛 Debugging

```bash
# Ver logs del Backend
tail -f backend/logs/*.log

# Logs en tiempo real
Get-Content backend/logs/error.log -Wait  # Windows
tail -F backend/logs/error.log             # Mac/Linux

# Ver qué está corriendo en los puertos
netstat -ano | findstr :3000      # Windows
lsof -i :3000                     # Mac/Linux

# Kill proceso
taskkill /PID <PID> /F            # Windows
kill -9 <PID>                     # Mac/Linux
```

---

## 📦 npm Scripts (root package.json)

```bash
npm start                 # Backend + Frontend
npm run start:backend     # Solo Backend
npm run start:frontend    # Solo Frontend
npm run build             # Build ambos
npm run test              # Tests ambos
npm run install:all       # Instala dependencias
```

---

## 📦 npm Scripts (backend)

```bash
npm run start             # Producción
npm run start:dev        # Desarrollo con watch
npm run build            # Build TypeScript
npm run lint             # ESlint
npm test                 # Tests
npm run test:cov         # Con cobertura
npm run test:e2e         # End-to-end tests
npm run test:debug       # Debug tests
```

---

## 📦 npm Scripts (frontend)

```bash
npm start                # ng serve (dev)
npm run build            # ng build (prod)
npm test                 # ng test (karma)
npm run lint             # ng lint
npm run e2e              # e2e tests
```

---

## 🔧 Troubleshooting Rápido

```bash
# Limpiar y reinstalar TODO
rm -rf backend/node_modules frontend/node_modules
npm run install:all

# Limpiar build
cd backend && npm run build && cd ..
cd frontend && npm run build && cd ..

# Ver puertos ocupados
netstat -ano | findstr LISTEN         # Windows
lsof -i -P -n | grep LISTEN           # Mac/Linux

# Cambiar puerto en backend/.env
# DB_PORT=5433 (si 5432 está ocupado)
# Luego reinicia
```

---

## 📚 Documentación

| Guía | Para... |
|------|---------|
| README.md | Visión general |
| PRIMEROS_PASOS.md | Instalación paso a paso |
| CONFIGURACION_RAPIDA.md | 3 opciones de setup |
| AUTH_GUIDE.md | Autenticación |
| PRODUCTOS_GUIDE.md | Productos |
| docs/ARCHITECTURE.md | Arquitectura |
| docs/DATABASE_DIAGRAM.md | BD |
| docs/BUSINESS_FLOWS.md | Flujos |

---

## 💡 Tips Útiles

```bash
# Crear ambiente nuevo en otra máquina
git clone repo.git
cd repo
.\setup.bat              # o ./setup.sh

# Cambiar usuario admin
# En BD: UPDATE usuarios SET password_hash='...' WHERE email='admin@...'

# Ver todos los usuarios creados
psql -U postgres -d ferreteria_pos -c "SELECT email, role FROM usuarios;"

# Exportar BD
pg_dump -U postgres -d ferreteria_pos > backup.sql

# Restaurar BD
psql -U postgres -d ferreteria_pos < backup.sql
```

---

## 🎯 Workflow Típico de Desarrollo

```bash
# 1. Clonar
git clone repo.git
cd repo

# 2. Setup
.\setup.bat

# 3. Configurar BD (si no lo hizo setup.bat)
CreateDB y ejecutar scripts SQL

# 4. Iniciar dev
npm start

# 5. En otra terminal, hacer cambios y pushear
git add .
git commit -m "Feature: algo nuevo"
git push origin main

# 6. Tests
npm run test

# 7. Deploy
npm run build


---

**Guardá esta página en bookmarks para referencia rápida** 🔖

