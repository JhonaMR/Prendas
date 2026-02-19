# ✅ PM2 Setup Completo - Backend + Frontend

## 🎯 Configuración Actualizada

PM2 ahora gestiona **3 procesos**:

1. **inventario-backend** - Servidor Node.js (puerto 3000)
2. **inventario-frontend** - Vite dev server (puerto 5173)
3. **inventario-backup-scheduler** - Backups automáticos (22:00 cada día)

---

## 🚀 Inicio Rápido

### Desde la carpeta backend:

```bash
cd backend
npm run pm2:start
```

Esto iniciará:
- ✅ Backend en http://localhost:3000
- ✅ Frontend en http://localhost:5173
- ✅ Scheduler de backups

### Ver estado:

```bash
npm run pm2:monit
```

Deberías ver 3 procesos online:
```
┌─────────────────────────────────────────────────────────────────┐
│ Name                     │ PID    │ CPU │ Memory   │ Uptime      │
├──────────────────────────────────────────────────────────────────┤
│ inventario-backend       │ 12346  │ 2%  │ 85.2 MB  │ 2h 15m 30s  │
│ inventario-frontend      │ 12347  │ 1%  │ 45.3 MB  │ 2h 15m 30s  │
│ inventario-backup-sch... │ 12348  │ 0%  │ 12.5 MB  │ 2h 15m 30s  │
└──────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Comandos Útiles

```bash
# Ver logs en tiempo real
npm run pm2:logs

# Reiniciar todos los procesos
npm run pm2:restart

# Detener todos los procesos
npm run pm2:stop

# Eliminar todos los procesos
npm run pm2:delete

# Guardar configuración
npm run pm2:save

# Restaurar procesos guardados
npm run pm2:resurrect
```

---

## 📊 Procesos Configurados

### 1. Backend (inventario-backend)
- **Script**: `src/server.js`
- **Puerto**: 3000
- **Modo**: cluster
- **Reinicio automático**: Sí
- **Logs**: `logs/out.log` y `logs/error.log`

### 2. Frontend (inventario-frontend)
- **Script**: `npm run dev` (desde raíz)
- **Puerto**: 5173
- **Modo**: fork
- **Reinicio automático**: Sí
- **Logs**: `logs/frontend-out.log` y `logs/frontend-error.log`

### 3. Scheduler (inventario-backup-scheduler)
- **Script**: `src/scripts/scheduledBackup.js`
- **Ejecución**: Cada día a las 22:00 (10pm)
- **Modo**: fork
- **Reinicio automático**: No (solo por cron)
- **Logs**: `logs/backup-out.log` y `logs/backup-error.log`

---

## 🔗 Acceso

Una vez iniciado con PM2:

- **Backend API**: http://localhost:3000
- **Frontend**: http://localhost:5173
- **Health Check**: http://localhost:3000/api/health

---

## 📝 Logs

Ver logs de todos los procesos:

```bash
npm run pm2:logs
```

Ver logs específicos:

```bash
# Solo backend
npm run pm2:logs inventario-backend

# Solo frontend
npm run pm2:logs inventario-frontend

# Solo backups
npm run pm2:logs inventario-backup-scheduler
```

---

## 🐛 Troubleshooting

### El frontend no inicia

Verifica que estés en la carpeta `backend` cuando ejecutas PM2:

```bash
cd backend
npm run pm2:start
```

### Puerto 5173 en uso

Si el puerto 5173 está en uso, PM2 intentará usar otro puerto. Verifica los logs:

```bash
npm run pm2:logs inventario-frontend
```

### Backend no responde

Verifica que PostgreSQL está corriendo y las credenciales en `.env` son correctas:

```bash
npm run pm2:logs inventario-backend
```

---

## 📊 Monitoreo

Para monitoreo en tiempo real:

```bash
npm run pm2:monit
```

Verás:
- Estado de cada proceso
- CPU y memoria
- Tiempo de actividad
- PID

---

## 🔄 Reiniciar Todo

Si necesitas reiniciar todo:

```bash
npm run pm2:restart
```

---

## 💾 Guardar Configuración

Para que PM2 inicie automáticamente al reiniciar la máquina:

```bash
npm run pm2:save
```

Luego, para restaurar:

```bash
npm run pm2:resurrect
```

---

## ✨ Resumen

| Componente | Puerto | Estado | Logs |
|-----------|--------|--------|------|
| Backend | 3000 | ✅ Online | `logs/out.log` |
| Frontend | 5173 | ✅ Online | `logs/frontend-out.log` |
| Backups | - | ✅ Scheduler | `logs/backup-out.log` |

**Todo gestionado por PM2 con un solo comando: `npm run pm2:start`**
