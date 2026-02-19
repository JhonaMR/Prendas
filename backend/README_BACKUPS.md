# 🔄 Sistema de Backups Automáticos

## 🎯 Resumen Ejecutivo

Sistema completo de backups automáticos con:
- ✅ Ejecución automática cada día a las **22:00 (10pm)**
- ✅ Política de retención inteligente (7 diarios + 4 semanales + 3 mensuales)
- ✅ API para restauración desde la aplicación
- ✅ Estadísticas en tiempo real
- ✅ Logs detallados
- ✅ Listo para producción

---

## 📁 Archivos Principales

| Archivo | Descripción |
|---------|-------------|
| `ecosystem.config.js` | Configuración de PM2 |
| `src/services/BackupRotationService.js` | Gestión de rotación |
| `src/services/BackupExecutionService.js` | Ejecución de backups |
| `src/controllers/backupController.js` | Endpoints API |
| `src/routes/backupRoutes.js` | Rutas protegidas |
| `src/scripts/scheduledBackup.js` | Script de PM2 |
| `src/scripts/testBackupSystem.js` | Pruebas del sistema |

---

## 🚀 Inicio Rápido

### 1. Verificar configuración
```bash
node src/scripts/testBackupSystem.js
```

### 2. Iniciar sistema
```bash
npm run pm2:start
```

### 3. Ver logs
```bash
npm run pm2:logs
```

### 4. Acceder a backups
```bash
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/backups
```

---

## 📊 Política de Retención

```
Tipo        | Máximo | Frecuencia      | Almacenamiento
------------|--------|-----------------|------------------
Diario      | 7      | Lunes-Sábado    | 350 MB (7 × 50 MB)
Semanal     | 4      | Domingos        | 200 MB (4 × 50 MB)
Mensual     | 3      | 1er día del mes | 150 MB (3 × 50 MB)
------------|--------|-----------------|------------------
TOTAL       | ~11    | Automático      | ~700 MB (1 mes)
```

---

## 🔗 Endpoints API

### Listar Backups
```
GET /api/backups
Authorization: Bearer TOKEN
```

### Estadísticas
```
GET /api/backups/stats
Authorization: Bearer TOKEN
```

### Backup Manual
```
POST /api/backups/manual
Authorization: Bearer TOKEN
```

### Restaurar
```
POST /api/backups/restore
Authorization: Bearer TOKEN
Body: { "backupFilename": "..." }
```

---

## 📚 Documentación

| Documento | Contenido |
|-----------|----------|
| `QUICK_START_BACKUPS.md` | Inicio rápido (5 pasos) |
| `BACKUP_SYSTEM.md` | Documentación completa |
| `FRONTEND_BACKUP_COMPONENT.md` | Componente React |
| `IMPLEMENTATION_SUMMARY.md` | Resumen técnico |
| `EXAMPLE_OUTPUT.md` | Ejemplos de salida |
| `VERIFICATION_CHECKLIST.md` | Checklist de verificación |

---

## ⚙️ Comandos Útiles

```bash
# Ver estado
npm run pm2:monit

# Ver logs
npm run pm2:logs

# Reiniciar
npm run pm2:restart

# Detener
npm run pm2:stop

# Eliminar
npm run pm2:delete

# Guardar configuración
npm run pm2:save

# Restaurar procesos
npm run pm2:resurrect
```

---

## 🔐 Seguridad

- ✅ Solo admin puede acceder
- ✅ Autenticación JWT requerida
- ✅ Backup de seguridad automático
- ✅ Credenciales en variables de entorno

---

## 📅 Programación

**Cron:** `0 22 * * *` (22:00 cada día)

**Tipos de backup:**
- **Lunes-Sábado:** Backup diario
- **Domingos:** Backup semanal
- **1er día del mes:** Backup mensual

---

## 🧪 Pruebas

```bash
# Ejecutar pruebas
node src/scripts/testBackupSystem.js

# Resultado esperado:
# ✅ PRUEBAS COMPLETADAS
# • Sistema de backups configurado correctamente
# • Política de retención: 7 diarios + 4 semanales + 3 mensuales
# • Ejecución automática: Cada día a las 22:00 (10pm)
```

---

## 📊 Estructura

```
backend/
├── ecosystem.config.js
├── BACKUP_SYSTEM.md
├── QUICK_START_BACKUPS.md
├── FRONTEND_BACKUP_COMPONENT.md
├── IMPLEMENTATION_SUMMARY.md
├── EXAMPLE_OUTPUT.md
├── VERIFICATION_CHECKLIST.md
├── README_BACKUPS.md (este archivo)
├── backups/
├── logs/
└── src/
    ├── services/
    │   ├── BackupRotationService.js
    │   └── BackupExecutionService.js
    ├── controllers/
    │   └── backupController.js
    ├── routes/
    │   └── backupRoutes.js
    └── scripts/
        ├── scheduledBackup.js
        └── testBackupSystem.js
```

---

## ✨ Características

- ✅ Backups automáticos cada día a las 22:00
- ✅ Rotación inteligente de backups
- ✅ Eliminación automática de backups antiguos
- ✅ API para restauración
- ✅ Estadísticas en tiempo real
- ✅ Backup de seguridad antes de restaurar
- ✅ Logs detallados
- ✅ Documentación completa
- ✅ Componente React listo
- ✅ Listo para producción

---

## 🎯 Próximos Pasos

1. **Frontend:** Implementar componente React
2. **Notificaciones:** Email si falla backup
3. **Compresión:** Comprimir backups
4. **Almacenamiento remoto:** S3/Google Drive
5. **Encriptación:** Encriptar backups

---

## 📞 Soporte

Para problemas:
1. Revisar logs: `npm run pm2:logs`
2. Ejecutar pruebas: `node src/scripts/testBackupSystem.js`
3. Ver documentación: `BACKUP_SYSTEM.md`

---

## 📝 Versión

- **Versión:** 1.0.0
- **Fecha:** 2026-02-18
- **Estado:** Producción

---

**Sistema completamente funcional y listo para usar.**
