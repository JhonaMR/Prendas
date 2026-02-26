# Integración de Backup Manual - BD + Imágenes

## Descripción

Cuando haces clic en el botón **"💾 Backup Manual"** en la vista de Gestión de Backups, ahora se ejecutan automáticamente **ambos backups**:

1. **Backup de Base de Datos** (BD PostgreSQL)
2. **Backup de Imágenes** (fotos comprimidas en `.tar.gz`)

## Cómo Funciona

### Flujo en la Vista (Frontend)

```
Usuario hace clic en "💾 Backup Manual"
    ↓
handleManualBackup() se ejecuta
    ↓
Llamada a API: POST /api/backups/manual
    ↓
Espera respuesta
    ↓
Muestra resultado de ambos backups
```

### Flujo en el Controlador (Backend)

```
POST /api/backups/manual
    ↓
1. Ejecuta backup de BD
   └─ Si falla → Retorna error
    ↓
2. Ejecuta backup de imágenes
   ├─ Verifica si existen imágenes
   ├─ Comprime en .tar.gz
   ├─ Limpia backups antiguos (mantiene últimos 30)
   └─ Retorna resultado
    ↓
Retorna respuesta combinada con ambos resultados
```

## Respuesta de la API

```json
{
  "success": true,
  "message": "Backup manual completado",
  "data": {
    "database": {
      "success": true,
      "message": "Backup de BD completado: inventory-backup-daily-2026-02-26-23-00-00.sql (15.5 MB)"
    },
    "images": {
      "success": true,
      "message": "Backup de imágenes completado: images-backup-2026-02-26-23-00-00.tar.gz (2.45 MB)"
    }
  }
}
```

## Mensaje en la Vista

Cuando el backup se completa, ves un alert como este:

```
✅ Backup completado exitosamente

📊 BD: Backup de BD completado: inventory-backup-daily-2026-02-26-23-00-00.sql (15.5 MB)
📸 Imágenes: Backup de imágenes completado: images-backup-2026-02-26-23-00-00.tar.gz (2.45 MB)
```

## Sistemas de Backup Independientes

### Backup Automático (PM2)

Sigue funcionando como antes:

- **22:00** → Backup automático de BD
- **23:00** → Backup automático de imágenes

### Backup Manual (Vista)

Ahora ejecuta ambos:

- **Botón "💾 Backup Manual"** → BD + Imágenes

## Archivos Modificados

1. **`src/controllers/backupController.js`**
   - Método `executeManualBackup()` ahora ejecuta ambos backups
   - Incluye lógica de compresión de imágenes
   - Limpieza automática de backups antiguos

2. **`src/views/BackupManagementView.tsx`**
   - Método `handleManualBackup()` actualizado
   - Muestra mensajes de ambos backups en el alert

## Manejo de Errores

Si falla el backup de BD:
```
❌ Error ejecutando backup: Error en backup de BD: [mensaje de error]
```

Si falla el backup de imágenes (pero la BD se respalda):
```
✅ Backup completado exitosamente

📊 BD: Backup de BD completado: ...
📸 Imágenes: Error en backup de imágenes: [mensaje de error]
```

## Casos Especiales

### Sin imágenes para respaldar
Si no hay imágenes en `backend/public/images/references/`:
```
✅ Backup completado exitosamente

📊 BD: Backup de BD completado: ...
📸 Imágenes: Sin imágenes para respaldar
```

### Carpeta de imágenes no existe
Se crea automáticamente si no existe.

## Próximos Pasos

Cuando el proyecto crezca:

1. Agregar backup en la nube
2. Notificaciones por email cuando falla un backup
3. Historial de backups en la BD
4. Descarga de backups desde la vista
5. Backup incremental (solo cambios)

## Comandos Útiles

```bash
# Ver logs del backend
npm run pm2:logs

# Monitorear en tiempo real
npm run pm2:monit

# Reiniciar PM2
npm run pm2:restart

# Ver backups de BD
ls backend/backups/

# Ver backups de imágenes
ls backend/backups/images/
```
