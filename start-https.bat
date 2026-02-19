@echo off
REM Script para iniciar la aplicación con HTTPS
REM Ejecutar: start-https.bat

echo.
echo 🔐 Iniciando aplicación con HTTPS...
echo.

REM Verificar si los certificados existen
if not exist "backend\certs\server.key" (
    echo 📝 Generando certificados SSL...
    node backend/scripts/generate-ssl-manual.js
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Error generando certificados
        exit /b 1
    )
)

echo.
echo ✅ Certificados listos
echo.
echo 🚀 Iniciando backend con HTTPS...
echo.

cd backend
npm run dev

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error iniciando backend
    exit /b 1
)
