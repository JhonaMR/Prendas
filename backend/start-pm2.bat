@echo off
REM Script para iniciar PM2 con ambas marcas (PLOW y MELAS)
REM Este script se ejecuta automáticamente al iniciar Windows

echo.
echo ========================================
echo Iniciando PLOW y MELAS con PM2
echo ========================================
echo.

cd /d "C:\Users\luisf\OneDrive\Desktop\Proyecto\Prendas"

REM Verificar si PM2 está instalado
pm2 --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: PM2 no está instalado
    echo Instálalo con: npm install -g pm2
    pause
    exit /b 1
)

REM Detener procesos anteriores si existen
echo Deteniendo procesos anteriores...
pm2 delete all >nul 2>&1

REM Iniciar con la configuración
echo Iniciando procesos...
pm2 start ecosystem.config.js

REM Guardar configuración para que se inicie automáticamente
pm2 save

echo.
echo ========================================
echo Procesos iniciados correctamente
echo ========================================
echo.
echo PLOW:
echo   - Backend: https://10.10.0.34:3000
echo   - Frontend: https://10.10.0.34:5173
echo.
echo MELAS:
echo   - Backend: https://10.10.0.34:3001
echo   - Frontend: https://10.10.0.34:5174
echo.
echo Ver logs: pm2 logs
echo Monitor: pm2 monit
echo.
pause
