# Guía de Backup de Imágenes

## Descripción

Sistema automático de backup para las imágenes de referencias guardadas en `backend/public/images/references`. Los backups se comprimen en formato `.tar.gz` y se guardan en `backend/backups/images/`.

## Características

- ✅ Backup automático diario a las 23:00 (11pm)
- ✅ Compresión automática (.tar.gz)
- ✅ Limpieza automática (mantiene últimos 30 backups)
- ✅ Logs detallados
- ✅ Backup manual bajo demanda

## Estructura de Carpetas

```
backend/
├── public/
│   └── images/
│       └── references/          ← Aquí van tus fotos
├── backups/
│   └── images/                  ← Aquí se guardan los backups
│       ├── images-backup-2026-02-26-23-00-00.tar.gz
│       ├── images-backup-2026-02-25-23-00-00.tar.gz
│       └── ...
└── src/scripts/
    └── backupImages.js          ← Script de backup
```

## Uso

### Backup Automático (Recomendado)

El backup se ejecuta automáticamente cada día a las **23:00** (11pm) cuando PM2 está corriendo.

```bash
# Iniciar con PM2
npm run pm2:start

# Ver logs del backup
npm run pm2:logs
```

### Backup Manual

Ejecutar backup bajo demanda:

```bash
# Desde backend/
node src/scripts/backupImages.js
```

### Listar Backups Disponibles

Ver todos los backups creados:

```bash
# Desde backend/
node src/scripts/backupImages.js list
```

Salida esperada:
```
📋 Backups disponibles:

1. images-backup-2026-02-26-23-00-00.tar.gz (2.45 MB) - 2/26/2026, 11:00:00 PM
2. images-backup-2026-02-25-23-00-00.tar.gz (2.40 MB) - 2/25/2026, 11:00:00 PM
3. images-backup-2026-02-24-23-00-00.tar.gz (2.35 MB) - 2/24/2026, 11:00:00 PM
```

## Restaurar un Backup

### En Windows (PowerShell)

```powershell
# 1. Navegar a la carpeta de backups
cd backend/backups/images

# 2. Extraer el backup (reemplaza el nombre del archivo)
tar -xzf images-backup-2026-02-26-23-00-00.tar.gz -C ../../public/images/references

# 3. Confirmar que se restauraron las imágenes
ls ../../public/images/references
```

### En Linux/Mac

```bash
# 1. Navegar a la carpeta de backups
cd backend/backups/images

# 2. Extraer el backup
tar -xzf images-backup-2026-02-26-23-00-00.tar.gz -C ../../public/images/references

# 3. Confirmar
ls ../../public/images/references
```

## Configuración

### Cambiar Hora del Backup

Editar `backend/ecosystem.config.js`:

```javascript
{
  name: 'inventario-images-backup-scheduler',
  script: './src/scripts/backupImages.js',
  cron_restart: '0 23 * * *', // ← Cambiar aquí (formato: minuto hora día mes día-semana)
  // Ejemplos:
  // '0 22 * * *' = 22:00 (10pm)
  // '0 2 * * *'  = 02:00 (2am)
  // '30 12 * * *' = 12:30 (12:30pm)
}
```

Luego reiniciar PM2:

```bash
npm run pm2:restart
```

### Cambiar Cantidad de Backups Retenidos

Editar `backend/src/scripts/backupImages.js`:

```javascript
const MAX_BACKUPS = 30; // ← Cambiar este número
```

Luego reiniciar PM2:

```bash
npm run pm2:restart
```

## Monitoreo

### Ver Logs en Tiempo Real

```bash
npm run pm2:monit
```

### Ver Logs Específicos del Backup de Imágenes

```bash
# Logs de salida
tail -f backend/logs/images-backup-out.log

# Logs de error
tail -f backend/logs/images-backup-error.log
```

## Troubleshooting

### El backup no se ejecuta automáticamente

1. Verificar que PM2 está corriendo:
   ```bash
   npm run pm2:monit
   ```

2. Verificar que el proceso está activo:
   ```bash
   pm2 list
   ```

3. Reiniciar PM2:
   ```bash
   npm run pm2:restart
   ```

### Error: "tar command not found"

En Windows, asegúrate de tener `tar` disponible (incluido en Windows 10+). Si no funciona:

1. Instalar Git Bash o WSL
2. O usar 7-Zip desde PowerShell:
   ```powershell
   7z a -tzip backup.zip ../../public/images/references
   ```

### Carpeta de imágenes no existe

El script crea automáticamente la estructura necesaria. Si no funciona:

```bash
# Crear manualmente
mkdir backend/public/images/references
mkdir backend/backups/images
```

## Próximos Pasos

Cuando el proyecto crezca, puedes:

1. **Agregar backup en la nube** (Google Drive, AWS S3, etc.)
2. **Comprimir solo cambios** (incremental backups)
3. **Notificaciones** cuando falla un backup
4. **Versionado** de imágenes con historial

## Comandos Rápidos

```bash
# Crear backup manual
node backend/src/scripts/backupImages.js

# Listar backups
node backend/src/scripts/backupImages.js list

# Ver logs
npm run pm2:logs

# Monitorear en tiempo real
npm run pm2:monit

# Reiniciar PM2
npm run pm2:restart
```
