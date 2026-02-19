@echo off
REM Script para configurar HTTPS en Windows
REM Ejecutar: setup-https.bat

echo.
echo 🔐 Configurando HTTPS para PWA...
echo.

REM Verificar si OpenSSL está instalado
where openssl >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ OpenSSL no está instalado
    echo.
    echo Opciones para instalar OpenSSL en Windows:
    echo.
    echo 1. Usando Chocolatey (recomendado):
    echo    choco install openssl
    echo.
    echo 2. Descarga manual:
    echo    https://slproweb.com/products/Win32OpenSSL.html
    echo.
    echo 3. Usando WSL (Windows Subsystem for Linux):
    echo    wsl openssl req -x509 -newkey rsa:2048 -keyout backend/certs/server.key -out backend/certs/server.crt -days 365 -nodes -subj "/CN=localhost"
    echo.
    exit /b 1
)

echo ✅ OpenSSL encontrado
echo.

REM Generar certificados
echo 📝 Generando certificados SSL autofirmados...
cd backend
node scripts/generate-ssl-cert.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Configuración completada
    echo.
    echo Próximos pasos:
    echo 1. Inicia el backend: npm run dev
    echo 2. Abre https://localhost:3000 en Chrome
    echo 3. Chrome mostrará una advertencia de seguridad
    echo 4. Escribe 'thisisunsafe' para continuar
    echo 5. Ahora podrás instalar la PWA
    echo.
) else (
    echo.
    echo ❌ Error generando certificados
    exit /b 1
)
