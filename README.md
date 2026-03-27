# 🏗️ FERRETERÍA POS
## Sistema Integral de Punto de Venta e Inventario

![Status](https://img.shields.io/badge/Status-Alpha%201.0-yellow)
![License](https://img.shields.io/badge/License-MIT-green)
![Node](https://img.shields.io/badge/Node-18%2B-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

---

## 📑 Tabla de Contenidos

1. [🚀 Quick Start](#-quick-start)
2. [📖 Descripción](#-descripción)
3. [✨ Características](#-características)
4. [📋 Stack Tecnológico](#-stack-tecnológico)
5. [🗂️ Estructura](#-estructura-del-proyecto)
6. [📦 Instalación](#-instalación)
7. [🐳 Docker](#-docker)
8. [🧪 Testing](#-testing)
9. [📚 Documentación](#-documentación)
10. [🤝 Soporte](#-soporte)

---

## 🚀 Quick Start

**Tiempo estimado: 2 minutos**

### Windows
```powershell
cd d:\python\Ferreteria
.\setup.bat
```

### Linux / macOS
```bash
cd ~/Ferreteria
bash setup.sh
```

**¡Listo!** Base de datos configurada en `localhost:5432`

Para ver credenciales de prueba y próximos pasos → [CONFIGURACION_RAPIDA.md](CONFIGURACION_RAPIDA.md)

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
- Autenticación JWT
- Auditoría completa
- Trazabilidad de cambios
- Contraseñas encriptadas

---

## 📋 Stack Tecnológico

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
| **NgRx** | 17+ | State management |

### DevOps
| Componente | Propósito |
|-----------|----------|
| **Docker** | Contenedores |
| **Docker Compose** | Orquestación |
| **Redis** | Caché (opcional) |
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
│   ├── package.json
│   └── docker-compose.yml
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
├── docker-compose.yml           # Orquestación
├── .env.example                 # Variables de entorno
├── .gitignore
├── setup.bat                    # Setup Windows
├── setup.sh                     # Setup Linux/Mac
├── README.md                    # Este archivo
├── CONFIGURACION_RAPIDA.md      # 3 opciones de setup
└── PROJECT_STATUS.md            # Estado del proyecto
```

---

## 📦 Instalación

### Opción 1: Setup Automatizado (RECOMENDADO) ⭐

```bash
# Windows
cd d:\python\Ferreteria
.\setup.bat

# Linux / macOS
cd ~/Ferreteria
bash setup.sh
```

**Resultado**: Base de datos completamente lista.

### Opción 2: Manual en pgAdmin

1. Abre pgAdmin (http://localhost:5050)
2. Crea DB `ferreteria_pos`
3. Abre Query Tool
4. Copia y ejecuta cada SQL en orden:
   - `database/01_create_schema.sql`
   - `database/02_insert_seeds.sql`
   - `database/03_create_views.sql`
   - `database/04_procedures_and_utilities.sql`

### Opción 3: Línea de comandos PostgreSQL

```bash
createdb -U postgres ferreteria_pos

psql -U postgres -d ferreteria_pos -f database/01_create_schema.sql
psql -U postgres -d ferreteria_pos -f database/02_insert_seeds.sql
psql -U postgres -d ferreteria_pos -f database/03_create_views.sql
psql -U postgres -d ferreteria_pos -f database/04_procedures_and_utilities.sql
```

### ✅ Verificar Instalación

```sql
SELECT COUNT(*) FROM usuarios;      -- Debe retornar: 4
SELECT COUNT(*) FROM productos;     -- Debe retornar: 6
SELECT COUNT(*) FROM categorias;    -- Debe retornar: 6
```

---

## 🐳 Docker

### Con Docker Compose (Recomendado para Producción)

```bash
# Construir imágenes
docker-compose build

# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

### Servicios Disponibles

| Servicio | Puerto | URL |
|----------|--------|-----|
| PostgreSQL | 5432 | localhost:5432 |
| pgAdmin | 5050 | http://localhost:5050 |
| Redis | 6379 | localhost:6379 |
| Redis Commander | 8081 | http://localhost:8081 |
| Backend | 3000 | http://localhost:3000 |
| Frontend | 4200 | http://localhost:4200 |

### Credenciales PostgreSQL

```
Host: localhost
Puerto: 5432
Usuario: postgres
Contraseña: postgres
BD: ferreteria_pos
```

---

## 🔐 Usuarios de Prueba

Contraseña para todos: `Admin@123`

| Email | Rol | Acceso |
|-------|-----|--------|
| admin@ferreteria.com | ADMIN | Todo |
| gerente@ferreteria.com | GERENTE | Reportes, usuarios |
| vendedor@ferreteria.com | VENDEDOR | POS, ventas |
| almacen@ferreteria.com | ALMACENERO | Inventario, compras |

---

## 🧪 Testing

**Próximo**: Será añadido en Phase 2

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

---

## 📚 Documentación

| Documento | Contenido |
|-----------|-----------|
| **ARCHITECTURE.md** | Principios SOLID, patrones, seguridad |
| **DATABASE_DIAGRAM.md** | ERD, relaciones, indices |
| **BUSINESS_FLOWS.md** | 12 diagramas Mermaid |
| **QUICK_START.md** | Paso a paso para empezar |
| **CONFIGURACION_RAPIDA.md** | 3 opciones setup |
| **PROJECT_STATUS.md** | Estado actual del proyecto |

---

## 🎯 Roadmap

```
Phase 1: Database & Docs           ✅ COMPLETADO
Phase 2: Backend (NestJS)          ⏳ Próximo
Phase 3: Frontend (Angular)        ⏳ Próximo
Phase 4: Testing & DevOps          ⏳ Próximo
Phase 5: Deployment & Monitoreo    ⏳ Futuro
```

---

## 💡 Variables de Entorno

Copia `.env.example` a `.env` y edita según tu entorno:

```bash
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ferreteria_pos

# JWT
JWT_SECRET=tu-secret-key-super-seguro
JWT_EXPIRATION=24h

# API
API_PORT=3000
API_URL=http://localhost:3000

# Frontend
FRONTEND_URL=http://localhost:4200
```

---

## 🤝 Soporte

### Problemas Comunes

**Base de datos no se crea**
```
→ Ver CONFIGURACION_RAPIDA.md § Troubleshooting
```

**Puerto 5432 ocupado**
```
→ Cambiar puerto en docker-compose.yml
```

**Docker no inicia**
```
→ Instalar Docker Desktop desde docker.com
```

### Documentación Técnica

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Arquitectura completa
- [DATABASE_DIAGRAM.md](docs/DATABASE_DIAGRAM.md) - Diagrama ER
- [BUSINESS_FLOWS.md](docs/BUSINESS_FLOWS.md) - Flujos de negocio

---

## 📄 Licencia

MIT License - Libre para usar, modificar y distribuir

---

## 👨‍💻 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crear una rama (`git checkout -b feature/amazing-feature`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
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

