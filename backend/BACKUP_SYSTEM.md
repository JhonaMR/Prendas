# Sistema de Backups Automáticos

## 📋 Descripción General

Sistema de backups automáticos con rotación inteligente que mantiene un mes de datos con mínimo almacenamiento:

- **Backups Diarios**: Últimos 7 días (se eliminan automáticamente)
- **Backups Semanales**: Cada domingo, máximo 4 (un mes)
- **Backups Mensuales**: Primer día del mes, máximo 3

**Ejecución**: Automáticamente cada día a las **22:00 (10pm)** mediante PM2

## 🚀 Instalación y Configuración

### 1. Instalar dependencias (si no está hecho)

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

Asegúrate de que en `backend/.env` estén configuradas:

```env
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_HOST=localhost
DB_PORT=5433
DB_NAME=inventory
NODE_ENV=production
```

### 3. Iniciar con PM2

```bash
# Iniciar la aplicación y el scheduler de backups
npm run pm2:start

# O en producción
npm run pm2:start:prod
```

## 📊 Comandos Útiles

```bash
# Ver estado de procesos
npm run pm2:monit

# Ver logs en tiempo real
npm run pm2:logs

# Reiniciar la aplicación
npm run pm2:restart

# Detener la aplicación
npm run pm2:stop

# Eliminar procesos de PM2
npm run pm2:delete

# Guardar configuración de PM2
npm run pm2:save

# Restaurar procesos guardados
npm run pm2:resurrect
```

## 🔄 Cómo Funciona

### Backup Automático (22:00 cada día)

1. PM2 ejecuta el script `scheduledBackup.js` a las 22:00
2. El script determina el tipo de backup:
   - **Diario**: Lunes a sábado
   - **Semanal**: Domingos
   - **Mensual**: Primer día del mes
3. Se ejecuta `pg_dump` para crear el backup
4. Se aplica la política de retención (elimina backups antiguos)
5. Se registran estadísticas en los logs

### Restauración desde la Aplicación

#### Endpoints disponibles:

**GET `/api/backups`**
- Lista todos los backups disponibles
- Requiere: Autenticación + rol admin

**GET `/api/backups/stats`**
- Obtiene estadísticas de almacenamiento
- Requiere: Autenticación + rol admin

**GET `/api/backups/:filename`**
- Información de un backup específico
- Requiere: Autenticación + rol admin

**POST `/api/backups/manual`**
- Ejecuta un backup manual inmediato
- Requiere: Autenticación + rol admin

**POST `/api/backups/restore`**
```json
{
  "backupFilename": "inventory-backup-daily-2026-02-18-22-00-15.sql"
}
```
- Restaura desde un backup
- Crea automáticamente backup de seguridad antes de restaurar
- Requiere: Autenticación + rol admin

## 📁 Estructura de Archivos

```
backend/
├── ecosystem.config.js              # Configuración de PM2
├── BACKUP_SYSTEM.md                 # Este archivo
├── backups/                         # Carpeta de backups
│   ├── inventory-backup-daily-*.sql
│   ├── inventory-backup-weekly-*.sql
│   └── inventory-backup-monthly-*.sql
├── logs/                            # Logs de PM2
│   ├── out.log                      # Salida estándar
│   ├── error.log                    # Errores
│   ├── backup-out.log               # Salida de backups
│   └── backup-error.log             # Errores de backups
└── src/
    ├── services/
    │   ├── BackupExecutionService.js    # Ejecuta backups
    │   └── BackupRotationService.js     # Gestiona rotación
    ├── controllers/
    │   └── backupController.js          # Endpoints
    ├── routes/
    │   └── backupRoutes.js              # Rutas
    └── scripts/
        └── scheduledBackup.js           # Script de PM2
```

## 🔐 Seguridad

- Solo usuarios con rol **admin** pueden:
  - Ver backups
  - Restaurar backups
  - Ejecutar backups manuales
  
- Antes de restaurar, se crea automáticamente un **backup de seguridad** del estado actual

- Las credenciales de BD se obtienen de variables de entorno (nunca hardcodeadas)

## 📊 Ejemplo de Estadísticas

```json
{
  "totalBackups": 11,
  "totalSizeInMB": "550.25",
  "totalSizeInGB": "0.537",
  "byType": {
    "daily": {
      "count": 7,
      "sizeInMB": "350.00"
    },
    "weekly": {
      "count": 3,
      "sizeInMB": "150.00"
    },
    "monthly": {
      "count": 1,
      "sizeInMB": "50.25"
    }
  }
}
```

## 🐛 Troubleshooting

### El backup no se ejecuta a las 22:00

1. Verifica que PM2 está corriendo:
   ```bash
   npm run pm2:monit
   ```

2. Revisa los logs:
   ```bash
   npm run pm2:logs
   ```

3. Verifica la configuración de cron en `ecosystem.config.js`:
   ```javascript
   cron_restart: '0 22 * * *' // Cada día a las 22:00
   ```

### Error de conexión a PostgreSQL

1. Verifica que PostgreSQL está corriendo
2. Verifica las credenciales en `.env`
3. Verifica que `pg_dump` está instalado en el PATH

### Espacio en disco bajo

1. Revisa estadísticas:
   ```bash
   curl http://localhost:3000/api/backups/stats
   ```

2. Los backups se eliminan automáticamente según la política
3. Puedes eliminar manualmente backups antiguos de la carpeta `backups/`

## 📝 Logs

Los logs se guardan en:
- `backend/logs/out.log` - Salida de la aplicación
- `backend/logs/error.log` - Errores de la aplicación
- `backend/logs/backup-out.log` - Salida de backups
- `backend/logs/backup-error.log` - Errores de backups

Ver logs en tiempo real:
```bash
npm run pm2:logs
```

## 🎯 Próximos Pasos

1. **Frontend**: Crear interfaz para ver/restaurar backups
2. **Notificaciones**: Enviar email si falla un backup
3. **Compresión**: Comprimir backups para ahorrar espacio
4. **Almacenamiento remoto**: Guardar backups en S3/Google Drive

## 📞 Soporte

Para problemas o preguntas, revisa:
1. Los logs en `backend/logs/`
2. La configuración en `backend/ecosystem.config.js`
3. Las variables de entorno en `backend/.env`
