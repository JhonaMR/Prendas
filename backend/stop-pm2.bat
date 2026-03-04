@echo off
REM Script para detener todos los procesos de PM2

echo.
echo Deteniendo todos los procesos...
echo.

cd /d "C:\Users\luisf\OneDrive\Desktop\Proyecto\Prendas"

pm2 stop all
pm2 delete all

echo.
echo Todos los procesos han sido detenidos
echo.
pause
