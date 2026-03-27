# 🚀 Guía de Ejecución - Sistema POS Ferretería Bolivia

## 📋 Requisitos
- Node.js >= 18.0.0
- npm >= 9.0.0  
- PostgreSQL corriendo localmente
- Puerto 3000 disponible (Backend)
- Puerto 4200 disponible (Frontend)

---

## 🎯 Opción 1: Ejecutar TODO (Backend + Frontend)

### Desde la carpeta raíz:
```powershell
npm start
```

Esto iniciará:
- ✅ **Backend** en `http://localhost:3000`
- ✅ **Frontend** en `http://localhost:4200`

---

## 🎯 Opción 2: Ejecutar SEPARADO

### Solo Backend
```powershell
npm run start:backend
# O directamente:
cd backend
npm run start:dev
```

### Solo Frontend
```powershell
npm run start:frontend
# O directamente:
cd frontend
npm start
```

---

## 🎯 Opción 3: Instalar todo de nuevo

Si falta instalar dependencias:

```powershell
npm run install:all
```

Esto hará:
1. `npm install` en raíz
2. `npm install` en backend/
3. `npm install` en frontend/

---

## ✅ Verificar que está funcionando

Abre en tu navegador:
- **Frontend**: `http://localhost:4200`
- **Backend API**: `http://localhost:3000/api`

### Credenciales de Prueba
- **Email**: admin@ferreteria.com
- **Contraseña**: Admin123

---

## 🔧 Troubleshooting

### Error: "Cannot find module"
```powershell
npm run install:all
```

### Puertos ya en uso
- Backend (3000): `netstat -ano | findstr :3000`
- Frontend (4200): `netstat -ano | findstr :4200`

### PostgreSQL no conecta
Verifica que PostgreSQL está corriendo y la BD `ferreteria_pos` existe.

---

## 📦 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Ejecuta backend + frontend |
| `npm run start:backend` | Solo backend |
| `npm run start:frontend` | Solo frontend |
| `npm run build` | Build production de ambos |
| `npm run build:backend` | Build backend |
| `npm run build:frontend` | Build frontend |
| `npm test` | Ejecuta tests |
| `npm run install:all` | Instala dependencias |

---

## 🇧🇴 Sistema Localizado para Bolivia

- 💰 Moneda: **Bs. (Bolivianos)**
- 🇧🇴 País: **Bolivia**
- 🕐 Zona: **America/La_Paz**
- 📱 Idioma: **Español (es-BO)**

---

**POS Ferretería Bolivia v1.0** | 2026
