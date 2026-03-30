@echo off
REM ============================================================================
REM SCRIPT DE INSTALACIÓN - Ferretería POS
REM Sistema para Windows - Instala todo y configura la BD
REM ============================================================================

echo.
echo =============================================================================
echo  🚀 FERRETERÍA POS - INSTALACIÓN Y CONFIGURACIÓN
echo =============================================================================
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Node.js no está instalado
    echo Descargar desde: https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js detectado: 
node --version

REM Verificar si npm está instalado
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: npm no está instalado
    pause
    exit /b 1
)

echo ✅ npm detectado: 
npm --version

REM ============================================================================
REM PASO 1: Crear archivo .env desde .env.example
REM ============================================================================
echo.
echo [1/4] Configurando archivo .env...

if exist backend\.env (
    echo ⚠️  Ya existe backend\.env - Saltando copia
) else (
    if exist .env.bolivia (
        copy .env.bolivia backend\.env >nul
        echo ✅ Copiado .env.bolivia a backend\.env
    ) else (
        copy .env.example backend\.env >nul
        echo ✅ Copiado .env.example a backend\.env
        echo ⚠️  IMPORTANTE: Edita backend\.env con tus credenciales
    )
)

REM ============================================================================
REM PASO 2: Instalar dependencias
REM ============================================================================
echo.
echo [2/4] Instalando dependencias...

echo   - Raíz del proyecto...
call npm install >nul 2>&1
if errorlevel 1 (
    echo ❌ Error instalando dependencias raíz
    pause
    exit /b 1
)
echo ✅ Dependencias raíz instaladas

echo   - Backend...
cd backend
call npm install >nul 2>&1
if errorlevel 1 (
    echo ❌ Error instalando dependencias backend
    pause
    exit /b 1
)
echo ✅ Dependencias backend instaladas

cd..
echo   - Frontend...
cd frontend
call npm install >nul 2>&1
if errorlevel 1 (
    echo ❌ Error instalando dependencias frontend
    pause
    exit /b 1
)
echo ✅ Dependencias frontend instaladas

cd..

REM ============================================================================
REM PASO 3: Verificar conexión a BD
REM ============================================================================
echo.
echo [3/4] Verificando conexión a Base de Datos...
echo.

REM Aquí se podría agregar validación de BD
REM Por ahora, solo informar al usuario

echo ⚠️  IMPORTANTE: Asegúrate de que PostgreSQL esté corriendo
echo    - Host: localhost (o el especificado en .env)
echo    - Puerto: 5432
echo    - Usuario: postgres
echo    - BD: ferreteria_pos
echo.
echo    Para crear la BD manualmente, ejecuta:
echo    psql -U postgres -c "CREATE DATABASE ferreteria_pos;"
echo.

REM ============================================================================
REM PASO 4: Inicializar BD (opcional)
REM ============================================================================
echo [4/4] Inicialización de Base de Datos
echo.

echo ¿Deseas crear las tablas en la base de datos? (S/N)
set /p db_choice=
if /i "%db_choice%"=="S" (
    echo ⚠️  Asegúrate de que PostgreSQL esté corriendo
    echo    Conectándose a BD...
    cd database
    echo Ejecuta los scripts SQL en este orden:
    echo   1. psql -U postgres -d ferreteria_pos -f 01_create_schema.sql
    echo   2. psql -U postgres -d ferreteria_pos -f 02_insert_seeds.sql
    echo   3. psql -U postgres -d ferreteria_pos -f 03_create_views.sql
    echo   4. psql -U postgres -d ferreteria_pos -f 04_procedures_and_utilities.sql
    cd..
    echo.
    echo O simplemente coloca los archivos en pgAdmin y ejecútalos
)

REM ============================================================================
REM RESUMEN
REM ============================================================================
echo.
echo =============================================================================
echo  ✅ INSTALACIÓN COMPLETADA
echo =============================================================================
echo.
echo 📋 PRÓXIMOS PASOS:
echo.
echo   1. Edita backend\.env con tus credenciales reales (si es necesario)
echo.
echo   2. Crea la base de datos PostgreSQL:
echo      psql -U postgres -c "CREATE DATABASE ferreteria_pos;"
echo.
echo   3. Ejecuta los scripts SQL (order matters):
echo      - database\01_create_schema.sql
echo      - database\02_insert_seeds.sql
echo      - database\03_create_views.sql
echo      - database\04_procedures_and_utilities.sql
echo.
echo   4. Inicia la aplicación:
echo      npm start
echo.
echo   5. Accede a:
echo      - Backend:  http://localhost:3000
echo      - Frontend: http://localhost:4200
echo.
echo 📚 Documentación:
echo      - PRIMEROS_PASOS.md  - Guía paso a paso
echo      - AUTH_GUIDE.md      - Autenticación y login
echo      - PRODUCTOS_GUIDE.md - Módulo de productos
echo.
echo 🔓 Usuarios de prueba:
echo      Email: admin@ferreteria.com
echo      Pass:  Admin@123
echo.
echo =============================================================================
echo.
pause
