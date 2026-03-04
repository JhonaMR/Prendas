@echo off
REM Script para verificar que todo está configurado correctamente

echo.
echo ========================================
echo Verificando configuración
echo ========================================
echo.

cd /d "C:\Users\luisf\OneDrive\Desktop\Proyecto\Prendas"

REM Verificar Node.js
echo [1/6] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js NO está instalado
    goto error
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js %NODE_VERSION% instalado
)

REM Verificar npm
echo [2/6] Verificando npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm NO está instalado
    goto error
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm %NPM_VERSION% instalado
)

REM Verificar PM2
echo [3/6] Verificando PM2...
pm2 --version >nul 2>&1
if errorlevel 1 (
    echo ❌ PM2 NO está instalado
    echo    Instálalo con: npm install -g pm2
    goto error
) else (
    for /f "tokens=*" %%i in ('pm2 --version') do set PM2_VERSION=%%i
    echo ✅ PM2 %PM2_VERSION% instalado
)

REM Verificar PostgreSQL
echo [4/6] Verificando PostgreSQL...
psql --version >nul 2>&1
if errorlevel 1 (
    echo ❌ PostgreSQL NO está instalado
    goto error
) else (
    for /f "tokens=*" %%i in ('psql --version') do set PG_VERSION=%%i
    echo ✅ %PG_VERSION% instalado
)

REM Verificar archivos de configuración
echo [5/6] Verificando archivos de configuración...
if not exist "backend\.env.prendas" (
    echo ❌ Falta: backend\.env.prendas
    goto error
) else (
    echo ✅ backend\.env.prendas existe
)

if not exist "backend\.env.melas" (
    echo ❌ Falta: backend\.env.melas
    goto error
) else (
    echo ✅ backend\.env.melas existe
)

if not exist "backend\ecosystem.config.js" (
    echo ❌ Falta: backend\ecosystem.config.js
    goto error
) else (
    echo ✅ backend\ecosystem.config.js existe
)

if not exist "public\config.js" (
    echo ❌ Falta: public\config.js
    goto error
) else (
    echo ✅ public\config.js existe
)

REM Verificar carpetas de logs
echo [6/6] Verificando carpetas...
if not exist "backend\logs" (
    echo Creando carpeta backend\logs...
    mkdir backend\logs
)
echo ✅ Carpeta backend\logs existe

echo.
echo ========================================
echo ✅ Verificación completada exitosamente
echo ========================================
echo.
echo Próximos pasos:
echo 1. Ejecuta: create-databases.bat (para crear las BDs)
echo 2. Ejecuta: start-pm2.bat (para iniciar ambas marcas)
echo 3. Accede a:
echo    - PRENDAS: http://localhost:5173
echo    - MELAS: http://localhost:5174
echo.
pause
exit /b 0

:error
echo.
echo ========================================
echo ❌ Verificación fallida
echo ========================================
echo.
echo Por favor, instala los componentes faltantes y vuelve a intentar
echo.
pause
exit /b 1
