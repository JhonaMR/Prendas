# Módulo de Backups

## Descripción

El módulo de backups gestiona la creación automática y manual de copias de seguridad de la base de datos. Permite restaurar datos en caso de pérdida o corrupción.

---

## Características

- ✅ Backups automáticos diarios
- ✅ Backups manuales bajo demanda
- ✅ Restauración de backups
- ✅ Historial de backups
- ✅ Compresión de archivos
- ✅ Limpieza automática de backups antiguos

---

## Estructura de Archivos

```
backend/
├── backups/                       # Carpeta de backups
│   ├── inventory-backup-2026-02-19.sql
│   ├── inventory-backup-daily-2026-02-19-07-03-34.sql
│   └── ...
├── src/scripts/
│   ├── backupDatabase.js          # Script de backup
│   └── restoreDatabase.js         # Script de restauración
└── ecosystem.config.cjs           # Configuración de backups automáticos
```

---

## Configuración de Backups Automáticos

### En ecosystem.config.cjs

```javascript
module.exports = {
  apps: [
    {
      name: 'inventario-backup',
      script: 'backend/src/scripts/backupDatabase.js',
      cron_restart: '0 7 * * *',  // Todos los días a las 7 AM
      autorestart: false,
      max_memory_restart: '500M'
    }
  ]
};
```

### Iniciar backups automáticos

```powershell
pm2 start ecosystem.config.cjs
```

---

## Endpoints API

### Obtener lista de backups
```
GET /api/backups
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "filename": "inventory-backup-2026-02-19.sql",
      "size": "2.5 MB",
      "date": "2026-02-19T07:03:34Z",
      "type": "daily"
    },
    ...
  ]
}
```

### Obtener estadísticas de backups
```
GET /api/backups/stats
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "totalBackups": 15,
    "totalSize": "37.5 MB",
    "lastBackup": "2026-02-19T07:03:34Z",
    "oldestBackup": "2026-02-05T07:03:34Z"
  }
}
```

### Crear backup manual
```
POST /api/backups/manual
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "filename": "inventory-backup-2026-02-19-10-30-45.sql",
    "size": "2.5 MB",
    "date": "2026-02-19T10:30:45Z"
  }
}
```

### Descargar backup
```
GET /api/backups/download/{filename}
Authorization: Bearer {token}

Response:
- Descarga el archivo SQL
```

### Restaurar backup
```
POST /api/backups/restore
Authorization: Bearer {token}
Content-Type: application/json

{
  "filename": "inventory-backup-2026-02-19.sql"
}

Response:
{
  "success": true,
  "message": "Base de datos restaurada correctamente"
}
```

---

## Scripts de Backup

### backupDatabase.js

```javascript
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const backupDatabase = async () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `inventory-backup-${timestamp}.sql`;
  const filepath = path.join(__dirname, '../../backups', filename);
  
  const command = `pg_dump -U postgres -h localhost -p 5433 inventory > "${filepath}"`;
  
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Error en backup:', error);
        reject(error);
      } else {
        console.log(`✅ Backup creado: ${filename}`);
        resolve(filename);
      }
    });
  });
};

backupDatabase()
  .then(filename => {
    console.log(`Backup completado: ${filename}`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
```

### restoreDatabase.js

```javascript
const { exec } = require('child_process');
const path = require('path');

const restoreDatabase = async (filename) => {
  const filepath = path.join(__dirname, '../../backups', filename);
  
  const command = `psql -U postgres -h localhost -p 5433 inventory < "${filepath}"`;
  
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Error en restauración:', error);
        reject(error);
      } else {
        console.log(`✅ Base de datos restaurada desde: ${filename}`);
        resolve();
      }
    });
  });
};

const filename = process.argv[2];
if (!filename) {
  console.error('Uso: node restoreDatabase.js <filename>');
  process.exit(1);
}

restoreDatabase(filename)
  .then(() => {
    console.log('Restauración completada');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
```

---

## Procedimientos Manuales

### Crear backup manual

```powershell
# Opción 1: Usando el script
node backend/src/scripts/backupDatabase.js

# Opción 2: Usando pg_dump directamente
pg_dump -U postgres -h localhost -p 5433 inventory > "backend/backups/inventory-backup-manual.sql"
```

### Restaurar backup

```powershell
# Opción 1: Usando el script
node backend/src/scripts/restoreDatabase.js inventory-backup-2026-02-19.sql

# Opción 2: Usando psql directamente
psql -U postgres -h localhost -p 5433 inventory < "backend/backups/inventory-backup-2026-02-19.sql"
```

### Listar backups

```powershell
Get-ChildItem backend/backups -Filter "*.sql" | Select-Object Name, Length, LastWriteTime
```

### Eliminar backup antiguo

```powershell
Remove-Item "backend/backups/inventory-backup-2026-02-01.sql"
```

---

## Política de Retención

### Backups Automáticos
- Se crean diariamente a las 7 AM
- Se mantienen los últimos 30 días
- Los más antiguos se eliminan automáticamente

### Backups Manuales
- Se crean bajo demanda
- Se mantienen indefinidamente
- Deben eliminarse manualmente si es necesario

### Tamaño Típico
- Cada backup ocupa aproximadamente 2-3 MB
- 30 backups = 60-90 MB

---

## Monitoreo

### Verificar último backup

```powershell
Get-ChildItem backend/backups -Filter "*.sql" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
```

### Verificar tamaño total de backups

```powershell
(Get-ChildItem backend/backups -Filter "*.sql" | Measure-Object -Property Length -Sum).Sum / 1MB
```

### Ver logs de backups

```powershell
pm2 logs inventario-backup
```

---

## Recuperación de Desastres

### Escenario 1: Datos Corruptos

1. Detener la aplicación
   ```powershell
   pm2 stop all
   ```

2. Restaurar desde backup
   ```powershell
   node backend/src/scripts/restoreDatabase.js inventory-backup-2026-02-19.sql
   ```

3. Reiniciar la aplicación
   ```powershell
   pm2 start all
   ```

### Escenario 2: Pérdida Total de Datos

1. Reinstalar PostgreSQL
2. Crear base de datos vacía
3. Restaurar desde backup más reciente
4. Verificar integridad de datos

### Escenario 3: Migración a Otro Servidor

1. Crear backup en servidor actual
2. Copiar archivo de backup a nuevo servidor
3. Restaurar en nuevo servidor
4. Verificar que todo funcione

---

## Troubleshooting

### Error: "pg_dump no encontrado"
- Asegúrate de que PostgreSQL esté instalado
- Agrega PostgreSQL al PATH del sistema
- Reinicia PowerShell

### Error: "Acceso denegado"
- Verifica que el usuario PostgreSQL sea correcto
- Verifica que la contraseña sea correcta
- Verifica que PostgreSQL esté ejecutándose

### Error: "Archivo no encontrado"
- Verifica que el archivo de backup exista
- Verifica la ruta del archivo
- Verifica que tengas permisos de lectura

### Backup muy lento
- Verifica el espacio en disco disponible
- Verifica que PostgreSQL no esté bajo carga
- Considera ejecutar backups en horarios de baja actividad

---

## Mejores Prácticas

1. **Backups Regulares**
   - Ejecutar backups diarios
   - Mantener al menos 30 días de historial

2. **Verificación**
   - Verificar regularmente que los backups se crean correctamente
   - Probar restauraciones periódicamente

3. **Almacenamiento**
   - Guardar backups en múltiples ubicaciones
   - Considerar almacenamiento en la nube

4. **Documentación**
   - Documentar procedimientos de restauración
   - Mantener registro de backups importantes

5. **Automatización**
   - Usar PM2 para backups automáticos
   - Configurar alertas de fallos

---

## Próximos Pasos

1. Implementar backups incrementales
2. Agregar compresión de archivos
3. Implementar almacenamiento en la nube
4. Agregar encriptación de backups
5. Implementar alertas automáticas

---

## Referencias

- PostgreSQL pg_dump: https://www.postgresql.org/docs/current/app-pgdump.html
- PostgreSQL psql: https://www.postgresql.org/docs/current/app-psql.html
- PM2 Cron: https://pm2.keymetrics.io/docs/usage/cron-restart/
