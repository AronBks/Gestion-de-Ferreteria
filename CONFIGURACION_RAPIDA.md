# ⚡ CONFIGURACIÓN RÁPIDA - Ferretería POS

**Elige tu opción de instalación favorita** (todas funcionan igual)

---

## 🎯 Opción 1: Script Automático (RECOMENDADO) ⭐

**Lo más fácil: un comando y listo**

### Windows (PowerShell)
```powershell
git clone https://github.com/TU_USUARIO/ferreteria-pos.git
cd ferreteria-pos
.\setup.bat
```

### macOS / Linux
```bash
git clone https://github.com/TU_USUARIO/ferreteria-pos.git
cd ferreteria-pos
chmod +x setup.sh
./setup.sh
```

**¿Qué pasa?**
- ✅ Instala Node.js dependencies
- ✅ Crea `backend/.env`
- ✅ Te pide crear tablas en BD
- ✅ Listo en ~5 minutos

**Luego:**
```bash
npm start
```

---

## 🛠️ Opción 2: Manual (Si prefieres control total)

### Paso 1: Clonar y entrar

```bash
git clone https://github.com/TU_USUARIO/ferreteria-pos.git
cd ferreteria-pos
```

### Paso 2: Copiar configuración

```bash
# Windows
copy .env.example backend\.env

# macOS/Linux
cp .env.example backend/.env
```

Edita `backend/.env` con tus credenciales de BD si necesita cambios.

### Paso 3: Instalar dependencias

```bash
# Raíz
npm install

# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..
```

### Paso 4: Crear BD PostgreSQL

```bash
# Opción A: Desde comando
createdb -U postgres ferreteria_pos

# Opción B: Desde pgAdmin
# 1. Abre http://localhost:5050
# 2. Right-click → Create Database
# 3. Nombre: ferreteria_pos
```

### Paso 5: Ejecutar scripts SQL (EN ORDEN)

```bash
cd database

# Windows (PowerShell)
psql -U postgres -d ferreteria_pos -f 01_create_schema.sql
psql -U postgres -d ferreteria_pos -f 02_insert_seeds.sql
psql -U postgres -d ferreteria_pos -f 03_create_views.sql
psql -U postgres -d ferreteria_pos -f 04_procedures_and_utilities.sql

# Los mismos comandos en macOS/Linux

cd ..
```

### Paso 6: Iniciar

```bash
npm start
```

---

## ✅ Después de Instalar (Igual para todas las opciones)

### 1. Verificar que BD tiene datos

```bash
# Conectar a BD
psql -U postgres -d ferreteria_pos

# Ver cuántos usuarios hay (debe ser 4)
SELECT COUNT(*) FROM usuarios;
```

### 2. Acceder a la aplicación

- **Backend:** http://localhost:3000
- **Frontend:** http://localhost:4200

### 3. Logear

```
Email:    admin@ferreteria.com
Password: Admin@123
```

### 4. Listo! ✨

Explora el dashboard y todas las opciones.

---

## 📋 Comparación de Opciones

| Aspecto | Script | Manual |
|---------|--------|--------|
| **Tiempo** | ⚡ 5 min | ⏱️ 15 min |
| **Facilidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Control** | Automático | Total |
| **Recomendado para** | Principiantes | Experiencia |
| **Para desarrollo** | ✅ Sí | ✅ Sí |
| **Para producción** | ⚠️ No | ✅ Sí |

---

## 🐛 Problemas Comunes

### "PostgreSQL ne está corriendo"

```bash
# Windows: Ver services.msc y iniciar PostgreSQL
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

### "Puerto 3000/5432 ya en uso"

```bash
# Windows
netstat -ano | findstr :3000

# macOS/Linux
lsof -i :3000

# Luego kill -9 <PID>
```

### "npm: command not found"

Node.js no está instalado → Descarga desde https://nodejs.org

### "psql: command not found"

PostgreSQL no está en PATH → Reinstala o agrega al PATH

### Scripts SQL fallan

```bash
# Asegúrate de que:
# 1. Ejecutas los 4 scripts EN ORDEN
# 2. Base de datos ferreteria_pos existe
# 3. PostgreSQL está corriendo
```

---

## 🎓 Próximos Pasos

Después de instalar:

1. **Leer:** [PRIMEROS_PASOS.md](PRIMEROS_PASOS.md)
2. **Entender:** [AUTH_GUIDE.md](AUTH_GUIDE.md)
3. **Explorar:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
4. **Codear:** ¡Empieza a hacer cambios!

---

**¿Preguntas?** Revisa README.md o la carpeta `docs/` 📚

