# Script para configurar PM2 para que se inicie automáticamente en Windows
# Ejecutar como administrador

Write-Host "Configurando PM2 para iniciar automáticamente..." -ForegroundColor Cyan

# Verificar si se ejecuta como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "ERROR: Este script debe ejecutarse como administrador" -ForegroundColor Red
    Write-Host "Por favor, abre PowerShell como administrador y vuelve a ejecutar este script" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

try {
    # Crear tarea programada
    $action = New-ScheduledTaskAction -Execute "pm2" -Argument "start ecosystem.config.cjs" -WorkingDirectory "C:\Users\jhona\Desktop\Prendas-master"
    $trigger = New-ScheduledTaskTrigger -AtStartup
    Register-ScheduledTask -TaskName "PM2-Inventario" -Action $action -Trigger $trigger -RunLevel Highest -Force | Out-Null
    
    Write-Host ""
    Write-Host "✓ Tarea programada creada exitosamente" -ForegroundColor Green
    Write-Host "✓ PM2 se iniciará automáticamente al reiniciar Windows" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos pasos:" -ForegroundColor Cyan
    Write-Host "1. Reinicia tu PC" -ForegroundColor White
    Write-Host "2. PM2 iniciará automáticamente con tu aplicación" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "✗ Error al crear la tarea programada:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
}

Read-Host "Presiona Enter para salir"
