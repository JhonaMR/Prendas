# 🔄 CONFIGURAR INICIO AUTOMÁTICO EN WINDOWS

Para que ambas marcas se inicien automáticamente cuando enciendas la computadora:

## Opción 1: Usar Tareas Programadas (Recomendado)

### Paso 1: Crear archivo batch de inicio

Ya existe: `C:\Users\luisf\OneDrive\Desktop\Proyecto\Prendas\backend\start-pm2.bat`

### Paso 2: Abrir Tareas Programadas

1. Presiona `Win + R`
2. Escribe: `taskschd.msc`
3. Presiona Enter

### Paso 3: Crear nueva tarea

1. En el panel derecho, haz clic en "Crear tarea básica"
2. Nombre: `Iniciar Prendas y Melas`
3. Descripción: `Inicia automáticamente ambas marcas al iniciar Windows`
4. Haz clic en "Siguiente"

### Paso 4: Configurar desencadenador

1. Selecciona: "Al iniciar el sistema"
2. Haz clic en "Siguiente"

### Paso 5: Configurar acción

1. Selecciona: "Iniciar un programa"
2. Programa: `C:\Users\luisf\OneDrive\Desktop\Proyecto\Prendas\backend\start-pm2.bat`
3. Haz clic en "Siguiente"

### Paso 6: Finalizar

1. Revisa la configuración
2. Marca: "Abrir el cuadro de diálogo Propiedades para esta tarea cuando haga clic en Finalizar"
3. Haz clic en "Finalizar"

### Paso 7: Configurar propiedades adicionales

En la ventana de propiedades que se abre:

1. Pestaña "General":
   - Marca: "Ejecutar con los privilegios más altos"

2. Pestaña "Condiciones":
   - Desmarca: "Iniciar la tarea solo si la computadora está conectada a una red eléctrica"

3. Pestaña "Configuración":
   - Marca: "Permitir que la tarea se ejecute bajo demanda"
   - Marca: "Si la tarea falla, reintentar cada: 1 minuto"
   - Número de reintentos: 3

4. Haz clic en "Aceptar"

---

## Opción 2: Usar Carpeta de Inicio

### Paso 1: Crear acceso directo

1. Haz clic derecho en `start-pm2.bat`
2. Selecciona "Crear acceso directo"
3. Se creará `start-pm2 - Acceso directo.lnk`

### Paso 2: Mover a carpeta de inicio

1. Presiona `Win + R`
2. Escribe: `shell:startup`
3. Presiona Enter
4. Mueve el acceso directo a esta carpeta

### Paso 3: Configurar propiedades del acceso directo

1. Haz clic derecho en el acceso directo
2. Selecciona "Propiedades"
3. En "Destino", agrega al final: ` && pause`
4. En "Ejecutar", selecciona: "Minimizado"
5. Haz clic en "Aceptar"

---

## Opción 3: Usar PowerShell (Avanzado)

Ejecuta como administrador:

```powershell
# Crear tarea programada con PowerShell
$action = New-ScheduledTaskAction -Execute "C:\Users\luisf\OneDrive\Desktop\Proyecto\Prendas\backend\start-pm2.bat"
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -RunLevel Highest
$task = New-ScheduledTask -Action $action -Trigger $trigger -Principal $principal -Description "Inicia Prendas y Melas"
Register-ScheduledTask -TaskName "Iniciar Prendas y Melas" -InputObject $task
```

---

## ✅ Verificar que funciona

### Método 1: Reiniciar la computadora

1. Guarda todo tu trabajo
2. Reinicia la computadora
3. Espera 30 segundos
4. Abre: http://localhost:5173 (PRENDAS) y http://localhost:5174 (MELAS)
5. Ambas deben estar funcionando

### Método 2: Ejecutar manualmente la tarea

1. Abre Tareas Programadas (`taskschd.msc`)
2. Busca "Iniciar Prendas y Melas"
3. Haz clic derecho → "Ejecutar"
4. Verifica que los procesos se inician

---

## 🛑 Detener el inicio automático

### Si usas Tareas Programadas:

1. Abre Tareas Programadas (`taskschd.msc`)
2. Busca "Iniciar Prendas y Melas"
3. Haz clic derecho → "Deshabilitar"

### Si usas carpeta de inicio:

1. Presiona `Win + R`
2. Escribe: `shell:startup`
3. Presiona Enter
4. Elimina el acceso directo

---

## 📝 Notas importantes

1. **Permisos**: Necesitas ser administrador para configurar el inicio automático
2. **Espera**: Los procesos tardan ~10-15 segundos en iniciar completamente
3. **Logs**: Los logs se guardan en `backend/logs/`
4. **Detener**: Usa `stop-pm2.bat` para detener los procesos

---

## 🔍 Troubleshooting

### La tarea no se ejecuta

1. Verifica que tienes permisos de administrador
2. Abre Tareas Programadas y revisa el historial
3. Verifica que la ruta del archivo es correcta

### Los procesos no inician

1. Ejecuta `verify-setup.bat` para verificar la instalación
2. Revisa los logs: `pm2 logs`
3. Verifica que PostgreSQL está corriendo

### La ventana se cierra inmediatamente

1. Agrega `&& pause` al final del comando en el acceso directo
2. Así podrás ver los mensajes de error

