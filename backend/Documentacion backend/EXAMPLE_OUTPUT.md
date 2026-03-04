# 📺 Ejemplo de Salida del Sistema

## 🧪 Ejecutar Pruebas

```bash
$ node backend/src/scripts/testBackupSystem.js
```

### Salida esperada:

```
======================================================================
🧪 PRUEBA DEL SISTEMA DE BACKUPS
======================================================================

📋 Test 1: Determinar tipo de backup para hoy
   ✅ Tipo de backup: daily
   📅 Fecha: 18/2/2026
   📊 Día de semana: Martes
   📆 Día del mes: 18

📋 Test 2: Generar nombre de archivo
   ✅ Nombre generado: inventory-backup-daily-2026-02-18-22-00-15.sql

📋 Test 3: Listar backups existentes
   ✅ Total de backups: 11
   Últimos 3 backups:
      1. inventory-backup-daily-2026-02-18-22-00-15.sql (52.34 MB)
      2. inventory-backup-daily-2026-02-17-22-00-12.sql (51.89 MB)
      3. inventory-backup-weekly-2026-02-15-22-00-08.sql (53.12 MB)

📋 Test 4: Estadísticas de almacenamiento
   ✅ Total: 11 backups, 550.25 MB
   📊 Diarios: 7 (350.00 MB)
   📊 Semanales: 3 (150.00 MB)
   📊 Mensuales: 1 (50.25 MB)

📋 Test 5: Backups agrupados por tipo
   ✅ Diarios: 7
   ✅ Semanales: 3
   ✅ Mensuales: 1

📋 Test 6: Política de retención
   Límites configurados:
   ✅ Máximo 7 backups diarios
   ✅ Máximo 4 backups semanales
   ✅ Máximo 3 backups mensuales
   ✅ Total máximo: ~11 backups

📋 Test 7: Verificar configuración de BD
   ✅ Usuario: postgres
   ✅ Host: localhost
   ✅ Puerto: 5433
   ✅ Base de datos: inventory
   ✅ Contraseña: ✓ Configurada

📋 Test 8: Verificar ruta de backups
   ✅ Ruta: C:\Users\jhona\Desktop\Prendas-master\backend\backups
   ✅ Carpeta existe: Sí

======================================================================
✅ PRUEBAS COMPLETADAS
======================================================================

📝 Resumen:
   • Sistema de backups configurado correctamente
   • Política de retención: 7 diarios + 4 semanales + 3 mensuales
   • Ejecución automática: Cada día a las 22:00 (10pm)
   • Almacenamiento actual: 550.25 MB

🚀 Próximos pasos:
   1. Iniciar con: npm run pm2:start
   2. Ver logs con: npm run pm2:logs
   3. Acceder a: http://localhost:3000/api/backups

```

---

## 🚀 Iniciar con PM2

```bash
$ npm run pm2:start
```

### Salida esperada:

```
[PM2] Spawning PM2 daemon with pm2_home=C:\Users\jhona\.pm2
[PM2] PM2 daemon PID12345
[PM2] Starting app [inventario-backend] in cluster mode ...
[PM2] Starting app [inventario-backup-scheduler] in fork mode ...
[PM2] App [inventario-backend:0] online
[PM2] App [inventario-backup-scheduler] online
[PM2] Done.

┌─────────────────────────────────────────────────────────────────────┐
│ App name                 │ id │ version │ mode    │ pid      │ status │
├─────────────────────────────────────────────────────────────────────┤
│ inventario-backend       │ 0  │ 1.0.0   │ cluster │ 12346    │ online │
│ inventario-backup-sch... │ 1  │ 1.0.0   │ fork    │ 12347    │ online │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Ver Estado (monit)

```bash
$ npm run pm2:monit
```

### Salida esperada:

```
PM2 Monit [CTRL-C to quit]

┌─ Process ─────────────────────────────────────────────────────────┐
│ Name                     │ PID    │ CPU │ Memory   │ Uptime      │
├──────────────────────────────────────────────────────────────────┤
│ inventario-backend       │ 12346  │ 2%  │ 85.2 MB  │ 2h 15m 30s  │
│ inventario-backup-sch... │ 12347  │ 0%  │ 12.5 MB  │ 2h 15m 30s  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📝 Ver Logs

```bash
$ npm run pm2:logs
```

### Salida esperada:

```
[TAILING 30 LINES]

[2026-02-18 22:00:15] [inventario-backup-scheduler] ============================================================
[2026-02-18 22:00:15] [inventario-backup-scheduler] 🔄 Backup programado iniciado: 2026-02-18T22:00:15.123Z
[2026-02-18 22:00:15] [inventario-backup-scheduler] ============================================================
[2026-02-18 22:00:15] [inventario-backup-scheduler] 
[2026-02-18 22:00:15] [inventario-backup-scheduler] 🔄 Iniciando backup daily...
[2026-02-18 22:00:15] [inventario-backup-scheduler] 📁 Archivo: inventory-backup-daily-2026-02-18-22-00-15.sql
[2026-02-18 22:00:15] [inventario-backup-scheduler] 🗄️  Base de datos: inventory
[2026-02-18 22:00:15] [inventario-backup-scheduler] 🖥️  Host: localhost:5433
[2026-02-18 22:00:18] [inventario-backup-scheduler] ✅ Backup daily completado
[2026-02-18 22:00:18] [inventario-backup-scheduler] 📦 Tamaño: 52.34 MB
[2026-02-18 22:00:18] [inventario-backup-scheduler] 
[2026-02-18 22:00:18] [inventario-backup-scheduler] 🗑️  Backups eliminados por política de retención:
[2026-02-18 22:00:18] [inventario-backup-scheduler]    - inventory-backup-daily-2026-02-11-22-00-10.sql (daily): Excede límite de 7 backups diarios
[2026-02-18 22:00:18] [inventario-backup-scheduler] 
[2026-02-18 22:00:18] [inventario-backup-scheduler] 📊 Estadísticas de almacenamiento:
[2026-02-18 22:00:18] [inventario-backup-scheduler]    Total: 11 backups, 550.25 MB
[2026-02-18 22:00:18] [inventario-backup-scheduler]    Diarios: 7 (350.00 MB)
[2026-02-18 22:00:18] [inventario-backup-scheduler]    Semanales: 3 (150.00 MB)
[2026-02-18 22:00:18] [inventario-backup-scheduler]    Mensuales: 1 (50.25 MB)
[2026-02-18 22:00:18] [inventario-backup-scheduler] 
[2026-02-18 22:00:18] [inventario-backup-scheduler] ✅ Backup programado completado exitosamente
[2026-02-18 22:00:18] [inventario-backup-scheduler] 📁 Archivo: inventory-backup-daily-2026-02-18-22-00-15.sql
[2026-02-18 22:00:18] [inventario-backup-scheduler] 📦 Tamaño: 52.34 MB
[2026-02-18 22:00:18] [inventario-backup-scheduler] 🔄 Tipo: daily
[2026-02-18 22:00:18] [inventario-backup-scheduler] ============================================================
```

---

## 🌐 Llamadas a API

### Listar Backups

```bash
$ curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:3000/api/backups | jq
```

### Respuesta:

```json
{
  "success": true,
  "backups": [
    {
      "filename": "inventory-backup-daily-2026-02-18-22-00-15.sql",
      "path": "C:\\...\\backups\\inventory-backup-daily-2026-02-18-22-00-15.sql",
      "size": 54857216,
      "sizeInMB": "52.34",
      "createdAt": "2026-02-18T22:00:18.000Z",
      "createdAtISO": "2026-02-18T22:00:18.000Z",
      "type": "daily"
    },
    {
      "filename": "inventory-backup-daily-2026-02-17-22-00-12.sql",
      "path": "C:\\...\\backups\\inventory-backup-daily-2026-02-17-22-00-12.sql",
      "size": 54394880,
      "sizeInMB": "51.89",
      "createdAt": "2026-02-17T22:00:15.000Z",
      "createdAtISO": "2026-02-17T22:00:15.000Z",
      "type": "daily"
    },
    {
      "filename": "inventory-backup-weekly-2026-02-15-22-00-08.sql",
      "path": "C:\\...\\backups\\inventory-backup-weekly-2026-02-15-22-00-08.sql",
      "size": 55705600,
      "sizeInMB": "53.12",
      "createdAt": "2026-02-15T22:00:12.000Z",
      "createdAtISO": "2026-02-15T22:00:12.000Z",
      "type": "weekly"
    }
  ],
  "stats": {
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
  },
  "count": 11
}
```

---

### Estadísticas

```bash
$ curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:3000/api/backups/stats | jq
```

### Respuesta:

```json
{
  "success": true,
  "stats": {
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
  },
  "backupsByType": {
    "daily": [
      {
        "filename": "inventory-backup-daily-2026-02-18-22-00-15.sql",
        "sizeInMB": "52.34",
        "createdAt": "2026-02-18T22:00:18.000Z"
      }
    ],
    "weekly": [
      {
        "filename": "inventory-backup-weekly-2026-02-15-22-00-08.sql",
        "sizeInMB": "53.12",
        "createdAt": "2026-02-15T22:00:12.000Z"
      }
    ],
    "monthly": [
      {
        "filename": "inventory-backup-monthly-2026-02-01-22-00-05.sql",
        "sizeInMB": "50.25",
        "createdAt": "2026-02-01T22:00:08.000Z"
      }
    ]
  }
}
```

---

### Backup Manual

```bash
$ curl -X POST -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:3000/api/backups/manual | jq
```

### Respuesta:

```json
{
  "success": true,
  "message": "Backup ejecutado exitosamente",
  "data": {
    "success": true,
    "filename": "inventory-backup-daily-2026-02-18-23-15-42.sql",
    "type": "daily",
    "path": "C:\\...\\backups\\inventory-backup-daily-2026-02-18-23-15-42.sql",
    "sizeInMB": "52.45",
    "createdAt": "2026-02-18T23:15:45.123Z",
    "deleted": [],
    "stats": {
      "totalBackups": 11,
      "totalSizeInMB": "550.50",
      "totalSizeInGB": "0.537",
      "byType": {
        "daily": {
          "count": 7,
          "sizeInMB": "350.25"
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
  }
}
```

---

### Restaurar Backup

```bash
$ curl -X POST -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"backupFilename":"inventory-backup-daily-2026-02-17-22-00-12.sql"}' \
  http://localhost:3000/api/backups/restore | jq
```

### Respuesta:

```json
{
  "success": true,
  "message": "Backup restaurado exitosamente",
  "data": {
    "success": true,
    "restoredFrom": "inventory-backup-daily-2026-02-17-22-00-12.sql",
    "securityBackup": "inventory-backup-daily-2026-02-18-23-20-15.sql",
    "restoredAt": "2026-02-18T23:20:18.456Z"
  }
}
```

---

## 🎯 Resumen

El sistema está completamente funcional y listo para:
- ✅ Ejecutar backups automáticos cada día a las 22:00
- ✅ Gestionar rotación de backups automáticamente
- ✅ Restaurar desde la API
- ✅ Mostrar estadísticas en tiempo real
- ✅ Registrar todos los eventos en logs
