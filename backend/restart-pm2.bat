@echo off
REM Script para reiniciar todos los procesos de PM2
REM Reinicia ambas marcas: PLOW y MELAS

echo.
echo Reiniciando todos los procesos de PM2...
echo.

cd /d "C:\Users\luisf\OneDrive\Desktop\Proyecto\Prendas"

pm2 restart all

echo.
echo Todos los procesos han sido reiniciados exitosamente
echo.
echo PLOW:
echo   - Backend: https://10.10.0.34:3000
echo   - Frontend: https://10.10.0.34:5173
echo.
echo MELAS:
echo   - Backend: https://10.10.0.34:3001
echo   - Frontend: https://10.10.0.34:5174
echo.
pause
