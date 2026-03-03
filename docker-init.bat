@echo off
REM 🐳 Script de Inicialización Docker - Proyecto Prendas (Windows)
REM Este script configura y levanta el proyecto en Docker

setlocal enabledelayedexpansion

echo 🐳 Inicializando Proyecto Prendas con Docker...
echo.

REM Verificar que Docker está instalado
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker no está instalado. Por favor instala Docker Desktop.
    pause
    exit /b 1
)

REM Verificar que Docker Compose está instalado
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose no está instalado.
    pause
    exit /b 1
)

echo ✓ Docker y Docker Compose detectados
echo.

REM Crear archivo .env si no existe
if not exist "backend\.env" (
    echo 📝 Creando backend\.env...
    copy backend\.env.example backend\.env
    
    REM Generar JWT_SECRET seguro
    for /f "delims=" %%i in ('node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"') do set JWT_SECRET=%%i
    
    REM Reemplazar en el archivo (usando PowerShell para mejor compatibilidad)
    powershell -Command "(Get-Content backend\.env) -replace 'tu_secreto_super_seguro_cambialo_123456', '%JWT_SECRET%' | Set-Content backend\.env"
    
    echo ✓ backend\.env creado con JWT_SECRET seguro
) else (
    echo ✓ backend\.env ya existe
)

echo.
echo 🔨 Construyendo imágenes Docker...
docker-compose build

echo.
echo 🚀 Levantando servicios...
docker-compose up -d

echo.
echo ⏳ Esperando a que los servicios estén listos...
timeout /t 10 /nobreak

echo.
echo 🔍 Verificando estado de los servicios...
docker-compose ps

echo.
echo ✅ ¡Proyecto iniciado correctamente!
echo.
echo 📍 Acceso a la aplicación:
echo    Frontend: http://localhost:3001
echo    Backend:  http://localhost:3000/api
echo    Health:   http://localhost:3000/api/health
echo.
echo 📋 Comandos útiles:
echo    Ver logs:        docker-compose logs -f
echo    Detener:         docker-compose down
echo    Reiniciar:       docker-compose restart
echo    Acceder a BD:    docker-compose exec postgres psql -U postgres -d inventory
echo.
echo 📖 Para más información, lee DOCKER_SETUP.md
echo.
pause
