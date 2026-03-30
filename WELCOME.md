# 👋 BIENVENIDA A FERRETERÍA POS

Eres un nuevo developer en el proyecto. **Bienvenido!** ✨

Esta guía te ayudará a empezar rápidamente.

---

## ⏱️ Timeline

- **Hoy (~30 min):** Leer esta guía + instalar proyecto
- **Día 1 (~1 hora):** Leer documentación clave + explorar código
- **Día 2+:** Empezar a contribuir

---

## 📥 Paso 1: Clonar el Proyecto (5 min)

```bash
# Abre terminal en tu carpeta de proyectos
git clone https://github.com/TU_USUARIO/ferreteria-pos.git
cd ferreteria-pos
```

Reemplaza `TU_USUARIO` con el usuario real de GitHub.

---

## ⚙️ Paso 2: Instalar (5 min)

**Windows (PowerShell):**
```powershell
.\setup.bat
```

**macOS/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

El script automáticamente:
- ✅ Verifica que tengas Node.js y PostgreSQL
- ✅ Instala todas las dependencias
- ✅ Crea el archivo `.env`
- ✅ Te guía para crear la BD

---

## 🚀 Paso 3: Iniciar (2 min)

```bash
npm start
```

Accede a:
- **Frontend:** http://localhost:4200
- **Backend API:** http://localhost:3000/api/docs

---

## 🔓 Paso 4: Logear (1 min)

Ve a http://localhost:4200 y usa:

```
Email:    admin@ferreteria.com
Password: Admin@123
```

🎉 **¡Ya estás dentro del sistema!**

---

## 📚 Paso 5: Lee Estas Guías Rápido (20 min)

En **este orden:**

1. **[README.md](README.md)** (5 min)
   - Visión general del proyecto
   - Stack tecnológico
   - Comandos principales

2. **[PRIMEROS_PASOS.md](PRIMEROS_PASOS.md)** (10 min)
   - Setup detallado
   - Cómo funciona JWT + Bcrypt
   - Troubleshooting

3. **[AUTH_GUIDE.md](AUTH_GUIDE.md)** (3 min)
   - Cómo usar autenticación
   - Endpoints de login
   - Proteger rutas

4. **[CHEATSHEET.md](CHEATSHEET.md)** (2 min)
   - Comandos que usarás constantemente

---

## 🔍 Paso 6: Entiende la Estructura

```
ferreteria/
├── backend/              ← API NestJS (Node.js)
│   ├── src/
│   │   ├── modules/      ← Features (auth, usuarios, productos)
│   │   ├── main.ts       ← Punto de entrada
│   │   └── database.ts   ← Conexión a BD
│   └── package.json
│
├── frontend/             ← UI Angular
│   ├── src/
│   │   ├── app/          ← Componentes
│   │   └── main.ts       ← Punto de entrada
│   └── package.json
│
├── database/             ← Scripts SQL
│   ├── 01_create_schema.sql
│   ├── 02_insert_seeds.sql
│   ├── 03_create_views.sql
│   └── 04_procedures_and_utilities.sql
│
├── docs/                 ← Documentación técnica
│   ├── ARCHITECTURE.md
│   ├── DATABASE_DIAGRAM.md
│   └── BUSINESS_FLOWS.md
│
└── .env.example          ← Configuración
```

---

## 💡 Cosas Importantes Que Debes Saber

### 1. **JWT + Bcrypt (Seguridad)**

- **Bcrypt:** Hasea contraseñas (irreversible)
- **JWT:** Tokens para autenticación (validos 1 hora)
- Ver [AUTH_GUIDE.md](AUTH_GUIDE.md) para detalles

### 2. **Base de Datos**

- PostgreSQL en `localhost:5432`
- 13 tablas ya creadas (ver [docs/DATABASE_DIAGRAM.md](docs/DATABASE_DIAGRAM.md))
- **NUNCA** edites el schema manualmente sin documentar

### 3. **Modularidad**

- Backend: `/backend/src/modules/` - Cada módulo es independiente
- Frontend: `/frontend/src/app/` - Componentes lazy-loaded

### 4. **No Subes .env a Git**

```bash
# NUNCA hacer esto
git add backend/.env
git push

# .env está en .gitignore - cada máquina tiene la suya
```

---

## 🔥 Tus Primeros Comandos

```bash
# Ver todo corriendo
npm start

# Ver solo Backend
npm run start:backend

# Ver solo Frontend
npm run start:frontend

# Tests
npm run test

# Linting
cd backend && npm run lint
```

---

## 💬 Haciendo tu Primer Cambio

1. Crea una rama nueva:
   ```bash
   git checkout -b feature/mi-feature
   ```

2. Haz los cambios (edita archivos)

3. Verifica todo funciona:
   ```bash
   npm run test
   npm run build
   ```

4. Commit y push:
   ```bash
   git add .
   git commit -m "Add mi-feature"
   git push origin feature/mi-feature
   ```

5. Abre Pull Request en GitHub

---

## 🆘 Si Algo No Funciona

**Primero, intenta:**

```bash
# Limpiar y reinstalar
npm run install:all

# Ver si BD está corriendo
psql -U postgres -c "SELECT 1;"

# Revisar logs
tail -f backend/logs/error.log
```

**Si sigue sin funcionar:**

1. Revisa [PRIMEROS_PASOS.md](PRIMEROS_PASOS.md) § Solución de Problemas
2. Revisa [README.md](README.md) § Solución de Problemas
3. Pregunta al equipo o mantainer

---

## 📞 Contacto / Preguntas

- 📖 Documentación: `/docs/`
- 💬 Código: Revisa los comentarios en el código
- 🆘 Problemas: Abre un issue o pregunta al equipo

---

## 🎯 Checklist: Estás Listo?

- [ ] Clonaste el repo
- [ ] Ejecutaste setup.bat/setup.sh
- [ ] `npm start` funciona sin errores
- [ ] Puedes logear en http://localhost:4200
- [ ] Leíste README.md
- [ ] Leíste PRIMEROS_PASOS.md
- [ ] Leíste AUTH_GUIDE.md
- [ ] Entiendes la estructura de carpetas
- [ ] Sabes dónde está el .env
- [ ] Sabes cómo crear una rama y hacer commit

---

## 🚀 OK, ¿Ahora Qué?

Perfecto, ya estás listo para:

1. **Entender:** Lee [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
2. **Explorar:** Revisa los módulos en `/backend/src/modules/`
3. **Practicar:** Haz un pequeño cambio y corre tests
4. **Contribuir:** Elige una tarea y contribuye!

---

## 📚 Lectura Recomendada (en orden)

```
HOY:
  - Esta guía ✓ (estás aquí)
  - README.md (10 min)
  - PRIMEROS_PASOS.md (15 min)

MAÑANA:
  - AUTH_GUIDE.md (5 min)
  - PRODUCTOS_GUIDE.md (5 min)
  - docs/ARCHITECTURE.md (30 min)

LA SEMANA:
  - docs/DATABASE_DIAGRAM.md (20 min)
  - docs/BUSINESS_FLOWS.md (30 min)
  - Código del proyecto (~2 horas)
```

---

## 🎓 Tips Finales

- **Lee los comentarios del código** - Explican mucho
- **Usa CHEATSHEET.md** - Está en bookmarks?
- **Los tests son tu amigo** - `npm run test` antes de commit
- **Pregunta sin miedo** - Preguntas tontas no existen
- **Git commit messages claros** - `git commit -m "Fix: bug en login"`
- **Rebase antes de push** - `git rebase main` antes del PR

---

**¡Bienvenido al equipo! 🎉 Nos alegra tenerte aquí.**

Cualquier duda, los mantainers estamos para ayudar.

Happy coding! 💻✨

