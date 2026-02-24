@echo off
REM ============================================================================
REM SCRIPT DE SINCRONIZACIÓN DE BASE DE DATOS
REM ============================================================================
REM Este script verifica y crea todas las tablas, índices y triggers necesarios
REM Úsalo cuando cambies de máquina para sincronizar la BD rápidamente
REM ============================================================================

echo.
echo ============================================================================
echo SINCRONIZACIÓN DE BASE DE DATOS - PROYECTO PRENDAS
echo ============================================================================
echo.

REM Configurar contraseña
set PGPASSWORD=Contrasena14.

REM Verificar que PostgreSQL está disponible
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PostgreSQL no está instalado o no está en el PATH
    echo Por favor, instala PostgreSQL o agrega su carpeta bin al PATH
    pause
    exit /b 1
)

echo ✓ PostgreSQL encontrado
echo.

REM Ejecutar el script de verificación
echo Ejecutando script de verificación...
echo.

psql -h 127.0.0.1 -p 5433 -U postgres -d inventory -f scripts/verify-and-create-all-tables.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================================================
    echo ✓ SINCRONIZACIÓN COMPLETADA EXITOSAMENTE
    echo ============================================================================
    echo.
    echo La base de datos está lista para usar.
    echo Todas las tablas, índices y triggers han sido verificados/creados.
    echo.
) else (
    echo.
    echo ============================================================================
    echo ✗ ERROR DURANTE LA SINCRONIZACIÓN
    echo ============================================================================
    echo.
    echo Por favor, verifica:
    echo - Que PostgreSQL está corriendo
    echo - Que la contraseña es correcta
    echo - Que el host y puerto son correctos (127.0.0.1:5433)
    echo.
)

pause
