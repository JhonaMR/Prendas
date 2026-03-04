@echo off
REM Script para crear las bases de datos usando psql

echo.
echo ========================================
echo Creando bases de datos
echo ========================================
echo.

REM Verificar si psql está disponible
psql --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: psql no está instalado o no está en el PATH
    echo Asegúrate de que PostgreSQL está instalado y agregado al PATH
    pause
    exit /b 1
)

REM Crear bases de datos
echo Ejecutando script SQL...
psql -U postgres -f init-databases.sql

if errorlevel 1 (
    echo.
    echo ERROR: No se pudieron crear las bases de datos
    echo Verifica que PostgreSQL está corriendo y que tienes permisos
    pause
    exit /b 1
)

echo.
echo ========================================
echo Bases de datos creadas correctamente
echo ========================================
echo.
echo Bases de datos creadas:
echo   - inventory_prendas
echo   - inventory_melas
echo.
pause
