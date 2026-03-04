# ✓ Sistema de Backup de Imágenes - Configuración Completada

## Qué se creó

### 1. Script de Backup
- **Archivo**: `src/scripts/backupImages.js`
- **Función**: Comprime automáticamente las imágenes en `.tar.gz`
- **Características**:
  - Backup manual bajo demanda
  - Limpieza automática (mantiene últimos 30 backups)
  - Logs detallados
  - Compatible con Windows y Linux

### 2. Integración con PM2
- **Actualizado**: `ecosystem.config.js`
- **Nuevo proceso**: `inventario-images-backup-scheduler`
- **Horario**: Diariamente a las 23:00 (11pm)
- **Logs**: `logs/images-backup-out.log` y `logs/images-backup-error.log`

### 3. Estructura de Carpetas
```
backend/
├── public/images/references/     ← Aquí van tus fotos
├── backups/images/               ← Aquí se guardan los backups
└── src/scripts/backupImages.js   ← Script de backup
```

### 4. Documentación
- **Guía completa**: `IMAGES_BACKUP_GUIDE.md`
- **Test de verificación**: `test-images-backup.js`

### 5. Git Configuration
- **Actualizado**: `.gitignore`
- Las imágenes y backups NO se suben a Git (son archivos grandes)
- Se mantienen carpetas con `.gitkeep`

## Cómo Usar

### Backup Manual (Prueba Rápida)
```bash
cd backend
node src/scripts/backupImages.js
```

### Ver Backups Disponibles
```bash
cd backend
node src/scripts/backupImages.js list
```

### Backup Automático (Recomendado)
```bash
npm run pm2:start
```
Se ejecutará automáticamente cada día a las 23:00

### Ver Logs
```bash
npm run pm2:logs
```

## Próximos Pasos

1. **Agregar fotos**: Coloca tus imágenes en `backend/public/images/references/`
2. **Probar**: Ejecuta `node src/scripts/backupImages.js` para crear un backup manual
3. **Iniciar PM2**: `npm run pm2:start` para que corra automáticamente
4. **Monitorear**: `npm run pm2:monit` para ver el estado en tiempo real

## Comandos Rápidos

```bash
# Crear backup manual
node backend/src/scripts/backupImages.js

# Listar backups
node backend/src/scripts/backupImages.js list

# Iniciar PM2 (backup automático)
npm run pm2:start

# Ver logs
npm run pm2:logs

# Monitorear
npm run pm2:monit

# Reiniciar
npm run pm2:restart

# Detener
npm run pm2:stop
```

## Configuración Personalizada

### Cambiar Hora del Backup
Editar `ecosystem.config.js`, línea con `cron_restart`:
```javascript
cron_restart: '0 23 * * *' // Cambiar aquí (formato cron)
```

### Cambiar Cantidad de Backups Retenidos
Editar `src/scripts/backupImages.js`, línea:
```javascript
const MAX_BACKUPS = 30; // Cambiar este número
```

## Restaurar un Backup

### Windows (PowerShell)
```powershell
cd backend/backups/images
tar -xzf images-backup-2026-02-26-23-00-00.tar.gz -C ../../public/images/references
```

### Linux/Mac
```bash
cd backend/backups/images
tar -xzf images-backup-2026-02-26-23-00-00.tar.gz -C ../../public/images/references
```

## Verificación

Ejecuta el test para verificar que todo está bien:
```bash
cd backend
node test-images-backup.js
```

Resultado esperado:
```
✓ Script de backup existe
✓ Carpeta de imágenes
✓ Carpeta de backups
✓ Configuración PM2

✓ Todo está configurado correctamente
```

---

**¡Sistema listo para usar!** 🎉
