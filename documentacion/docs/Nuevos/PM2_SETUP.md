# Configuración de PM2 para el Proyecto

## ✅ Instalación Completada

PM2 está instalado y configurado para ejecutar tu aplicación automáticamente.

## Estado Actual

✅ **Backend + Frontend** - Corriendo en puerto 3000
✅ Aplicación en segundo plano
✅ Configuración guardada

## Cómo Usar

### Iniciar la aplicación
```bash
pm2 start ecosystem.config.cjs
```

### Ver estado
```bash
pm2 list
```

### Ver logs en tiempo real
```bash
pm2 logs
```

### Monitoreo en tiempo real
```bash
pm2 monit
```

### Detener la aplicación
```bash
pm2 stop all
```

### Reiniciar la aplicación
```bash
pm2 restart all
```

## URLs de Acceso

- **Frontend + Backend**: http://localhost:3000
- **Red Local**: http://192.168.40.88:3000

## Configurar Inicio Automático (Windows)

Para que PM2 se inicie automáticamente cuando reinicies Windows:

### Opción 1: Script PowerShell (Recomendado)

1. Abre PowerShell como administrador
2. Navega a la carpeta del proyecto:
   ```powershell
   cd C:\Users\jhona\Desktop\Prendas-master
   ```
3. Ejecuta el script:
   ```powershell
   .\setup-autostart.ps1
   ```
4. Reinicia tu PC

### Opción 2: Script Batch

1. Abre CMD como administrador
2. Navega a la carpeta del proyecto:
   ```cmd
   cd C:\Users\jhona\Desktop\Prendas-master
   ```
3. Ejecuta el script:
   ```cmd
   setup-autostart.bat
   ```
4. Reinicia tu PC

### Opción 3: Manual

1. Abre PowerShell como administrador
2. Ejecuta:
   ```powershell
   $action = New-ScheduledTaskAction -Execute "pm2" -Argument "start ecosystem.config.cjs" -WorkingDirectory "C:\Users\jhona\Desktop\Prendas-master"
   $trigger = New-ScheduledTaskTrigger -AtStartup
   Register-ScheduledTask -TaskName "PM2-Inventario" -Action $action -Trigger $trigger -RunLevel Highest -Force
   ```

## Verificar que está configurado

Para ver si la tarea programada se creó correctamente:

```powershell
Get-ScheduledTask -TaskName "PM2-Inventario"
```

## Desactivar Inicio Automático

Si quieres desactivar el inicio automático:

```powershell
Unregister-ScheduledTask -TaskName "PM2-Inventario" -Confirm:$false
```

## Archivos de Configuración

- **ecosystem.config.cjs** - Configuración de PM2
- **setup-autostart.ps1** - Script PowerShell para configurar autostart
- **setup-autostart.bat** - Script Batch para configurar autostart
- **logs/** - Carpeta donde se guardan los logs

## Características Configuradas

- **Modo fork**: Un proceso
- **Reinicio automático**: Se reinicia si falla
- **Límite de memoria**: 500MB
- **Logs con fecha**: Incluye timestamp en los logs
- **Modo producción**: Optimizado para producción

## Troubleshooting

### Ver todos los procesos de PM2
```bash
pm2 list
```

### Ver información detallada
```bash
pm2 info inventario-backend
```

### Ver logs de errores
```bash
pm2 logs --err
```

### Limpiar todos los procesos
```bash
pm2 kill
```

### Reiniciar PM2 daemon
```bash
pm2 kill
pm2 start ecosystem.config.cjs
```

## Cambios en el Frontend

Si haces cambios en el frontend, necesitas recompilar:

```bash
npm run build
pm2 restart inventario-backend
```
