# Sistema de Backups Separado por Instancia

## Descripción General

El sistema de backups ahora está completamente separado entre Plow y Melas. Cada instancia tiene su propia carpeta de backups e imágenes.

## Estructura de Carpetas

```
backend/backups/
├── plow/
│   ├── inventory-backup-*.sql (backups de BD)
│   └── images/
│       └── images-backup-*.tar.gz (backups de imágenes)
└── melas/
    ├── inventory-backup-*.sql (backups de BD)
    └── images/
        └── images-backup-*.tar.gz (backups de imágenes)
```

## Cómo Funciona

### Backend

1. **Detección de Instancia**: El servidor detecta automáticamente si es Plow o Melas basándose en `DB_NAME`:
   - `inventory_plow` → Instancia Plow
   - `inventory_melas` → Instancia Melas

2. **BackupExecutionService**:
   - Lee `DB_NAME` del entorno
   - Extrae el nombre de la instancia (plow/melas)
   - Usa la carpeta correspondiente: `backups/plow/` o `backups/melas/`

3. **API Responses**: Todas las respuestas incluyen el campo `instance`:
   ```json
   {
     "success": true,
     "instance": "plow",
     "backups": [...],
     "stats": {...}
   }
   ```

### Frontend

1. **Detección Automática**: `instanceDetector.ts` detecta la instancia basándose en:
   - Puerto del navegador (3000/5173 = Plow, 3001/5174 = Melas)
   - Hostname (si contiene "melas")

2. **UI**: Muestra un badge con el nombre de la instancia en el header

3. **Funciones Disponibles**:
   ```typescript
   detectInstance()        // Retorna 'plow' o 'melas'
   getInstanceName()       // Retorna 'Plow' o 'Melas'
   getInstanceColor()      // Retorna color para UI
   getBackendPort()        // Retorna puerto del backend
   getFrontendPort()       // Retorna puerto del frontend
   ```

## Rutas API

### Obtener Instancia Actual
```
GET /api/backups/instance/current
Response: { success, instance, dbName, port }
```

### Listar Backups
```
GET /api/backups
Response: { success, instance, backups, stats, count }
```

### Estadísticas
```
GET /api/backups/stats
Response: { success, instance, stats, backupsByType }
```

### Backup Manual
```
POST /api/backups/manual
Response: { success, instance, message, data, alerts }
```

### Restaurar Backup
```
POST /api/backups/restore
Body: { backupFilename }
Response: { success, message, data }
```

## Configuración PM2

Los schedulers de backup ya están configurados para usar los .env correctos:

```javascript
// Plow
{
  name: 'plow-backup-scheduler',
  env_file: 'backend/.env.prendas',  // DB_NAME=inventory_plow
  cron_restart: '0 22 * * *'
}

// Melas
{
  name: 'melas-backup-scheduler',
  env_file: 'backend/.env.melas',    // DB_NAME=inventory_melas
  cron_restart: '0 22 * * *'
}
```

## Migración de Backups Antiguos

Todos los backups antiguos (12 SQL + 30 imágenes) fueron movidos a `backups/plow/` porque pertenecían a la instancia Plow.

## Notas Importantes

1. **Cada instancia es independiente**: Los backups de Plow no afectan a Melas y viceversa
2. **Restauración segura**: Al restaurar, se crea automáticamente un backup de seguridad del estado actual
3. **Política de retención**: Se mantienen 7 diarios, 4 semanales y 3 mensuales por instancia
4. **Imágenes**: Se mantienen máximo 30 backups de imágenes por instancia

## Troubleshooting

### Los backups no aparecen
- Verifica que estés en la instancia correcta (puerto 3000/5173 para Plow, 3001/5174 para Melas)
- Revisa que la carpeta `backups/plow/` o `backups/melas/` exista
- Comprueba los logs: `logs/plow-backup-*.log` o `logs/melas-backup-*.log`

### Error al hacer backup
- Verifica que PostgreSQL esté corriendo
- Comprueba las credenciales en `.env.prendas` o `.env.melas`
- Revisa que haya espacio en disco

### Instancia detectada incorrectamente
- Asegúrate de acceder por el puerto correcto
- Limpia el cache del navegador
- Verifica que `window.location.port` sea correcto en la consola del navegador
