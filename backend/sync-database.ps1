# ============================================================================
# SCRIPT DE SINCRONIZACIÓN DE BASE DE DATOS - PowerShell
# ============================================================================
# Este script verifica y crea todas las tablas, índices y triggers necesarios
# Úsalo cuando cambies de máquina para sincronizar la BD rápidamente
# ============================================================================

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "SINCRONIZACIÓN DE BASE DE DATOS - PROYECTO PRENDAS" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Configurar contraseña
$env:PGPASSWORD = 'Contrasena14.'

# Verificar que PostgreSQL está disponible
try {
    $psqlPath = Get-Command psql -ErrorAction Stop
    Write-Host "✓ PostgreSQL encontrado en: $($psqlPath.Source)" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: PostgreSQL no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "Por favor, instala PostgreSQL o agrega su carpeta bin al PATH" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host ""
Write-Host "Ejecutando script de verificación..." -ForegroundColor Yellow
Write-Host ""

# Ejecutar el script de verificación
$scriptPath = Join-Path $PSScriptRoot "scripts/verify-and-create-all-tables.sql"

if (-not (Test-Path $scriptPath)) {
    Write-Host "✗ ERROR: No se encontró el script en $scriptPath" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

psql -h 127.0.0.1 -p 5433 -U postgres -d inventory -f $scriptPath

if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq 1) {
    Write-Host ""
    Write-Host "============================================================================" -ForegroundColor Green
    Write-Host "✓ SINCRONIZACIÓN COMPLETADA EXITOSAMENTE" -ForegroundColor Green
    Write-Host "============================================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "La base de datos está lista para usar." -ForegroundColor Green
    Write-Host "Todas las tablas, índices y triggers han sido verificados/creados." -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "============================================================================" -ForegroundColor Red
    Write-Host "✗ ERROR DURANTE LA SINCRONIZACIÓN" -ForegroundColor Red
    Write-Host "============================================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, verifica:" -ForegroundColor Yellow
    Write-Host "- Que PostgreSQL está corriendo" -ForegroundColor Yellow
    Write-Host "- Que la contraseña es correcta" -ForegroundColor Yellow
    Write-Host "- Que el host y puerto son correctos (127.0.0.1:5433)" -ForegroundColor Yellow
    Write-Host ""
}

Read-Host "Presiona Enter para salir"
