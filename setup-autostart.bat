@echo off
REM Script para configurar PM2 para que se inicie automáticamente en Windows
REM Ejecutar como administrador

echo Configurando PM2 para iniciar automáticamente...

REM Crear tarea programada
powershell -Command "^
$action = New-ScheduledTaskAction -Execute 'pm2' -Argument 'start ecosystem.config.cjs' -WorkingDirectory 'C:\Users\jhona\Desktop\Prendas-master'; ^
$trigger = New-ScheduledTaskTrigger -AtStartup; ^
Register-ScheduledTask -TaskName 'PM2-Inventario' -Action $action -Trigger $trigger -RunLevel Highest -Force"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Tarea programada creada exitosamente
    echo ✓ PM2 se iniciará automáticamente al reiniciar Windows
    echo.
    echo Próximos pasos:
    echo 1. Reinicia tu PC
    echo 2. PM2 iniciará automáticamente con tu aplicación
    echo.
) else (
    echo.
    echo ✗ Error al crear la tarea programada
    echo Asegúrate de ejecutar este script como administrador
    echo.
)

pause
