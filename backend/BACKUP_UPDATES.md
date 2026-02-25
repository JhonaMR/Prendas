# Actualizaciones del Sistema de Backup - Febrero 2026

## 🎯 Cambios Realizados

### 1. Ampliación de Cobertura de Backup
- ✅ Ahora se respaldan **TODAS las tablas** del sistema en cada backup
- Incluye: Clientes, Referencias, Pedidos, Despachos, Recepciones, Compras, Fichas de Costo, Movimientos de Inventario, Auditoría, Preferencias de Vista
- El comando `pg_dump` respalda la BD completa con toda su estructura

### 2. Limpieza Automática de Logs
- ✅ Se agregó función `cleanOldBackupLogs()` en `BackupExecutionService.js`
- Se ejecuta automáticamente **cada vez que se hace un backup**
- Elimina logs más antiguos de **30 días**
- Archivos afectados:
  - `backup-out.log`
  - `backup-error.log`
  - `out.log`
  - `error.log`

### 3. Documentación Actualizada
- ✅ `BACKUP_SYSTEM.md` actualizado con:
  - Nueva sección "Qué se Respalda" con todas las tablas
  - Información sobre limpieza automática de logs
  - Troubleshooting para limpieza de logs
  - Clarificación de que logs se mantienen solo 30 días

## 📊 Política de Retención Actual

### Backups
- **Diarios**: Últimos 7 días
- **Semanales**: Últimos 4 (aproximadamente 1 mes)
- **Mensuales**: Últimos 3 (aproximadamente 3 meses)

### Logs
- **Máximo**: 30 días
- **Limpieza**: Automática en cada backup
- **Archivos**: Todos los logs de PM2

## 🚀 Cómo Funciona Ahora

1. **22:00 cada día**: PM2 ejecuta `scheduledBackup.js`
2. **Limpieza de logs**: Se eliminan automáticamente logs > 30 días
3. **Backup**: Se respalda la BD completa (todas las tablas)
4. **Rotación**: Se eliminan backups antiguos según política
5. **Estadísticas**: Se registran en los logs

## ✅ Verificación

Para verificar que todo funciona:

```bash
# Ver logs en tiempo real
npm run pm2:logs

# Ver estadísticas de backups
curl http://localhost:3000/api/backups/stats

# Ver backups disponibles
curl http://localhost:3000/api/backups
```

## 📝 Notas

- La limpieza de logs es **no-destructiva**: solo elimina archivos > 30 días
- Los backups siguen su política de retención independiente
- No hay cambios en los endpoints de la API
- Compatible con versiones anteriores
