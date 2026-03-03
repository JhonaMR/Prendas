@echo off
REM 🐳 Script de Backup - Proyecto Prendas (Windows)
REM Realiza backup de la base de datos

setlocal enabledelayedexpansion

set BACKUP_DIR=backups\docker-backups
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a-%%b)
set TIMESTAMP=%mydate%_%mytime%
set BACKUP_FILE=%BACKUP_DIR%\inventory-backup-%TIMESTAMP%.sql

REM Crear directorio de backups si no existe
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo 🔄 Iniciando backup de la base de datos...
echo 📁 Ubicación: %BACKUP_FILE%

REM Hacer backup de PostgreSQL
docker-compose exec -T postgres pg_dump -U postgres inventory > "%BACKUP_FILE%"

if errorlevel 1 (
    echo ❌ Error durante el backup
    pause
    exit /b 1
)

echo ✅ Backup completado exitosamente
echo 📁 Archivo: %BACKUP_FILE%
echo.
echo 💡 Para restaurar este backup:
echo    docker-compose exec -T postgres psql -U postgres inventory ^< "%BACKUP_FILE%"
echo.
pause
