@echo off
REM 🐳 Script de Inicialización Docker - Proyecto Prendas (Windows, Multi-Instancia)
REM Este script configura y levanta el proyecto en Docker con Plow y Melas

setlocal enabledelayedexpansion

echo 🐳 Inicializando Proyecto Prendas con Docker (Plow + Melas)...
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

REM Crear carpetas de backups si no existen
echo 📁 Creando carpetas de backups...
if not exist "backend\backups\plow\images" mkdir backend\backups\plow\images
if not exist "backend\backups\melas\images" mkdir backend\backups\melas\images
echo ✓ Carpetas de backups creadas
echo.

REM Verificar archivos .env
echo 🔐 Verificando configuración de instancias...

if not exist ".env.prendas" (
    echo ❌ Archivo .env.prendas no encontrado
    pause
    exit /b 1
)

if not exist ".env.melas" (
    echo ❌ Archivo .env.melas no encontrado
    pause
    exit /b 1
)

echo ✓ .env.prendas encontrado (Plow)
echo ✓ .env.melas encontrado (Melas)
echo.

echo 🔨 Construyendo imágenes Docker...
docker-compose build

echo.
echo 🚀 Levantando servicios...
docker-compose up -d

echo.
echo ⏳ Esperando a que los servicios estén listos...
timeout /t 15 /nobreak

echo.
echo 🔍 Verificando estado de los servicios...
docker-compose ps

echo.
echo ✅ ¡Proyecto iniciado correctamente!
echo.
echo 📍 ACCESO A LAS APLICACIONES:
echo.
echo PLOW (Instancia 1):
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:3000/api
echo    Health:   http://localhost:3000/api/health
echo.
echo MELAS (Instancia 2):
echo    Frontend: http://localhost:5174
echo    Backend:  http://localhost:3001/api
echo    Health:   http://localhost:3001/api/health
echo.
echo 📋 COMANDOS ÚTILES:
echo.
echo Ver logs:
echo    docker-compose logs -f                    (Todos)
echo    docker-compose logs -f plow-backend       (Solo Plow backend)
echo    docker-compose logs -f melas-frontend     (Solo Melas frontend)
echo.
echo Gestión de servicios:
echo    docker-compose ps                         (Ver estado)
echo    docker-compose restart                    (Reiniciar todo)
echo    docker-compose down                       (Detener todo)
echo.
echo Backups:
echo    docker-compose exec plow-backend npm run backup:manual   (Backup Plow)
echo    docker-compose exec melas-backend npm run backup:manual  (Backup Melas)
echo.
echo Base de datos:
echo    docker-compose exec postgres psql -U postgres -d inventory_plow
echo    docker-compose exec postgres psql -U postgres -d inventory_melas
echo.
echo 📖 DOCUMENTACIÓN:
echo    Lee: DOCKER_MULTI_INSTANCE.md
echo.
pause
