# Script para configurar HTTPS en Windows
# Ejecutar: .\setup-https.ps1

Write-Host "🔐 Configurando HTTPS para PWA..." -ForegroundColor Cyan
Write-Host ""

# Verificar si OpenSSL está instalado
$openssl = Get-Command openssl -ErrorAction SilentlyContinue

if (-not $openssl) {
    Write-Host "❌ OpenSSL no está instalado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Opciones para instalar OpenSSL en Windows:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Usando Chocolatey (recomendado):"
    Write-Host "   choco install openssl"
    Write-Host ""
    Write-Host "2. Descarga manual:"
    Write-Host "   https://slproweb.com/products/Win32OpenSSL.html"
    Write-Host ""
    Write-Host "3. Usando WSL (Windows Subsystem for Linux):"
    Write-Host "   wsl openssl req -x509 -newkey rsa:2048 -keyout backend/certs/server.key -out backend/certs/server.crt -days 365 -nodes -subj '/CN=localhost'"
    Write-Host ""
    exit 1
}

Write-Host "✅ OpenSSL encontrado" -ForegroundColor Green
Write-Host ""

# Generar certificados
Write-Host "📝 Generando certificados SSL autofirmados..." -ForegroundColor Cyan
cd backend
node scripts/generate-ssl-cert.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Configuración completada" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos pasos:" -ForegroundColor Yellow
    Write-Host "1. Inicia el backend: npm run dev"
    Write-Host "2. Abre https://localhost:3000 en Chrome"
    Write-Host "3. Chrome mostrará una advertencia de seguridad"
    Write-Host "4. Escribe 'thisisunsafe' para continuar"
    Write-Host "5. Ahora podrás instalar la PWA"
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Error generando certificados" -ForegroundColor Red
    exit 1
}
