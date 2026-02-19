# Script para iniciar la aplicación con HTTPS
# Ejecutar: .\start-https.ps1

Write-Host ""
Write-Host "🔐 Iniciando aplicación con HTTPS..." -ForegroundColor Cyan
Write-Host ""

# Verificar si los certificados existen
if (-not (Test-Path "backend/certs/server.key")) {
    Write-Host "📝 Generando certificados SSL..." -ForegroundColor Yellow
    node backend/scripts/generate-ssl-manual.js
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error generando certificados" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✅ Certificados listos" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Iniciando backend con HTTPS..." -ForegroundColor Cyan
Write-Host ""

cd backend
npm run dev

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error iniciando backend" -ForegroundColor Red
    exit 1
}
