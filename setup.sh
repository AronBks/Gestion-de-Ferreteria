#!/bin/bash

# ============================================================================
# SCRIPT DE INSTALACIÓN - Ferretería POS
# Sistema para Linux/macOS - Instala todo y configura la BD
# ============================================================================

set -e

echo ""
echo "============================================================================="
echo " 🚀 FERRETERÍA POS - INSTALACIÓN Y CONFIGURACIÓN"
echo "============================================================================="
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js no está instalado"
    echo "Descargar desde: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js detectado: $(node --version)"

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ ERROR: npm no está instalado"
    exit 1
fi

echo "✅ npm detectado: $(npm --version)"

# ============================================================================
# PASO 1: Crear archivo .env desde .env.example o .env.bolivia
# ============================================================================
echo ""
echo "[1/4] Configurando archivo .env..."

if [ -f "backend/.env" ]; then
    echo "⚠️  Ya existe backend/.env - Saltando copia"
else
    if [ -f ".env.bolivia" ]; then
        cp .env.bolivia backend/.env
        echo "✅ Copiado .env.bolivia a backend/.env"
    else
        cp .env.example backend/.env
        echo "✅ Copiado .env.example a backend/.env"
        echo "⚠️  IMPORTANTE: Edita backend/.env con tus credenciales"
    fi
fi

# ============================================================================
# PASO 2: Instalar dependencias
# ============================================================================
echo ""
echo "[2/4] Instalando dependencias..."

echo "   - Raíz del proyecto..."
npm install --silent || { echo "❌ Error instalando dependencias raíz"; exit 1; }
echo "✅ Dependencias raíz instaladas"

echo "   - Backend..."
cd backend
npm install --silent || { echo "❌ Error instalando dependencias backend"; exit 1; }
echo "✅ Dependencias backend instaladas"

cd ..
echo "   - Frontend..."
cd frontend
npm install --silent || { echo "❌ Error instalando dependencias frontend"; exit 1; }
echo "✅ Dependencias frontend instaladas"

cd ..

# ============================================================================
# PASO 3: Verificar conexión a BD
# ============================================================================
echo ""
echo "[3/4] Verificando conexión a Base de Datos..."
echo ""

echo "⚠️  IMPORTANTE: Asegúrate de que PostgreSQL esté corriendo"
echo "   - Host: localhost (o el especificado en .env)"
echo "   - Puerto: 5432"
echo "   - Usuario: postgres"
echo "   - BD: ferreteria_pos"
echo ""
echo "   Para crear la BD manualmente, ejecuta:"
echo "   psql -U postgres -c \"CREATE DATABASE ferreteria_pos;\""
echo ""

# ============================================================================
# PASO 4: Inicializar BD (opcional)
# ============================================================================
echo "[4/4] Inicialización de Base de Datos"
echo ""

read -p "¿Deseas crear las tablas en la base de datos? (S/N): " db_choice

if [[ "$db_choice" == "S" || "$db_choice" == "s" ]]; then
    echo "⚠️  Asegúrate de que PostgreSQL esté corriendo"
    echo "   Conectándose a BD..."
    
    if command -v psql &> /dev/null; then
        cd database
        
        echo ""
        echo "Ejecutando scripts SQL..."
        
        psql -U postgres -d ferreteria_pos -f 01_create_schema.sql > /dev/null 2>&1 && \
            echo "✅ Schema creado" || echo "⚠️  Verifica el script de schema"
        
        psql -U postgres -d ferreteria_pos -f 02_insert_seeds.sql > /dev/null 2>&1 && \
            echo "✅ Datos semilla insertados" || echo "⚠️  Verifica el script de seeds"
        
        psql -U postgres -d ferreteria_pos -f 03_create_views.sql > /dev/null 2>&1 && \
            echo "✅ Vistas creadas" || echo "⚠️  Verifica el script de vistas"
        
        psql -U postgres -d ferreteria_pos -f 04_procedures_and_utilities.sql > /dev/null 2>&1 && \
            echo "✅ Procedimientos creados" || echo "⚠️  Verifica el script de procedimientos"
        
        cd ..
    else
        echo "⚠️  psql no encontrado. Ejecuta los scripts manualmente:"
        cd database
        echo "   1. psql -U postgres -d ferreteria_pos -f 01_create_schema.sql"
        echo "   2. psql -U postgres -d ferreteria_pos -f 02_insert_seeds.sql"
        echo "   3. psql -U postgres -d ferreteria_pos -f 03_create_views.sql"
        echo "   4. psql -U postgres -d ferreteria_pos -f 04_procedures_and_utilities.sql"
        cd ..
    fi
fi

# ============================================================================
# RESUMEN
# ============================================================================
echo ""
echo "============================================================================="
echo " ✅ INSTALACIÓN COMPLETADA"
echo "============================================================================="
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo ""
echo "   1. Edita backend/.env con tus credenciales reales (si es necesario)"
echo ""
echo "   2. Crea la base de datos PostgreSQL:"
echo "      psql -U postgres -c \"CREATE DATABASE ferreteria_pos;\""
echo ""
echo "   3. Ejecuta los scripts SQL (en orden):"
echo "      - database/01_create_schema.sql"
echo "      - database/02_insert_seeds.sql"
echo "      - database/03_create_views.sql"
echo "      - database/04_procedures_and_utilities.sql"
echo ""
echo "   4. Inicia la aplicación:"
echo "      npm start"
echo ""
echo "   5. Accede a:"
echo "      - Backend:  http://localhost:3000"
echo "      - Frontend: http://localhost:4200"
echo ""
echo "📚 Documentación:"
echo "      - PRIMEROS_PASOS.md  - Guía paso a paso"
echo "      - AUTH_GUIDE.md      - Autenticación y login"
echo "      - PRODUCTOS_GUIDE.md - Módulo de productos"
echo ""
echo "🔓 Usuarios de prueba:"
echo "      Email: admin@ferreteria.com"
echo "      Pass:  Admin@123"
echo ""
echo "============================================================================="
echo ""
