@echo off
REM Script para inicializar las bases de datos de ambas marcas

echo.
echo ========================================
echo Inicializando bases de datos
echo ========================================
echo.

cd /d "C:\Users\luisf\OneDrive\Desktop\Proyecto\Prendas\backend"

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no está instalado
    pause
    exit /b 1
)

echo Inicializando BD de PRENDAS...
set NODE_ENV=development
node -e "require('dotenv').config({path: '.env.prendas'}); require('./src/scripts/initDatabase.js')"

echo.
echo Inicializando BD de MELAS...
node -e "require('dotenv').config({path: '.env.melas'}); require('./src/scripts/initDatabase.js')"

echo.
echo ========================================
echo Bases de datos inicializadas
echo ========================================
echo.
pause
