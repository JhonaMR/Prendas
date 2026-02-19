# 🚀 Inicio Rápido - Sistema de Backups

## ⚡ 5 Pasos para Activar

### 1️⃣ Verificar configuración de .env

```bash
# Asegúrate de que tienes estas variables en backend/.env
DB_USER=postgres
DB_PASSWORD=tu_contraseña_aqui
DB_HOST=localhost
DB_PORT=5433
DB_NAME=inventory
```

### 2️⃣ Instalar dependencias (si no está hecho)

```bash
cd backend
npm install
```

### 3️⃣ Probar el sistema

```bash
# Ejecutar pruebas del sistema
node src/scripts/testBackupSystem.js
```

Deberías ver algo como:
```
✅ PRUEBAS COMPLETADAS
   • Sistema de backups configurado correctamente
   • Política de retención: 7 diarios + 4 semanales + 3 mensuales
   • Ejecución automática: Cada día a las 22:00 (10pm)
```

### 4️⃣ Iniciar con PM2

```bash
# Inicia la aplicación + scheduler de backups
npm run pm2:start

# O en producción
npm run pm2:start:prod
```

### 5️⃣ Verificar que está corriendo

```bash
# Ver estado de procesos
npm run pm2:monit

# Ver logs
npm run pm2:logs
```

Deberías ver dos procesos:
- `inventario-backend` - La aplicación
- `inventario-backup-scheduler` - El scheduler de backups

---

## 📊 Usar desde la Aplicación

### Endpoints disponibles (requieren autenticación + admin)

**Listar backups:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/backups
```

**Ver estadísticas:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/backups/stats
```

**Ejecutar backup manual:**
```bash
curl -X POST -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/backups/manual
```

**Restaurar un backup:**
```bash
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"backupFilename":"inventory-backup-daily-2026-02-18-22-00-15.sql"}' \
  http://localhost:3000/api/backups/restore
```

---

## 🎯 Qué Sucede Automáticamente

**Cada día a las 22:00 (10pm):**

1. ✅ Se ejecuta un backup automático
2. ✅ Se determina el tipo (diario/semanal/mensual)
3. ✅ Se crea el archivo SQL
4. ✅ Se aplica la política de retención
5. ✅ Se eliminan backups antiguos automáticamente
6. ✅ Se registran logs

**Política de retención:**
- Últimos 7 backups diarios
- Últimos 4 backups semanales (domingos)
- Últimos 3 backups mensuales (1er día del mes)

---

## 📁 Archivos Creados

```
backend/
├── ecosystem.config.js                    # Configuración PM2
├── BACKUP_SYSTEM.md                       # Documentación completa
├── FRONTEND_BACKUP_COMPONENT.md           # Componente React
├── QUICK_START_BACKUPS.md                 # Este archivo
├── backups/                               # Carpeta de backups
├── logs/                                  # Logs de PM2
├── src/
│   ├── services/
│   │   ├── BackupExecutionService.js      # Ejecuta backups
│   │   └── BackupRotationService.js       # Gestiona rotación
│   ├── controllers/
│   │   └── backupController.js            # Endpoints API
│   ├── routes/
│   │   └── backupRoutes.js                # Rutas
│   └── scripts/
│       ├── scheduledBackup.js             # Script PM2
│       └── testBackupSystem.js            # Pruebas
```

---

## 🔧 Comandos Útiles

```bash
# Ver estado
npm run pm2:monit

# Ver logs en tiempo real
npm run pm2:logs

# Reiniciar
npm run pm2:restart

# Detener
npm run pm2:stop

# Eliminar procesos
npm run pm2:delete

# Guardar configuración
npm run pm2:save

# Restaurar procesos guardados
npm run pm2:resurrect
```

---

## ⚠️ Troubleshooting

**El backup no se ejecuta a las 22:00:**
```bash
# Verifica los logs
npm run pm2:logs

# Verifica que PM2 está corriendo
npm run pm2:monit
```

**Error de conexión a PostgreSQL:**
- Verifica que PostgreSQL está corriendo
- Verifica credenciales en `.env`
- Verifica que `pg_dump` está en el PATH

**Espacio en disco bajo:**
- Los backups se eliminan automáticamente
- Revisa estadísticas: `curl http://localhost:3000/api/backups/stats`

---

## 📝 Próximos Pasos

1. **Frontend**: Implementar componente React (ver `FRONTEND_BACKUP_COMPONENT.md`)
2. **Notificaciones**: Enviar email si falla un backup
3. **Compresión**: Comprimir backups para ahorrar espacio
4. **Almacenamiento remoto**: Guardar en S3/Google Drive

---

## 📞 Documentación Completa

Para más detalles, ver `BACKUP_SYSTEM.md`
