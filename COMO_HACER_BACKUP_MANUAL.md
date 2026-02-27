# 🔄 CÓMO HACER UN BACKUP MANUAL

## ⚡ Opción 1: Desde la Terminal (Recomendado)

```bash
cd Prendas/backend
npm run backup:manual
```

**Resultado esperado**:
```
╔════════════════════════════════════════════════════════════╗
║           BACKUP MANUAL DE BASE DE DATOS                   ║
╚════════════════════════════════════════════════════════════╝

⏳ Ejecutando backup...

✅ ¡Backup completado exitosamente!

📊 Detalles:
   Archivo: inventory-backup-daily-2026-02-27-12-45-30.sql
   Tipo: daily
   Tamaño: 45.23 MB
   Ruta: Prendas/backend/backups/inventory-backup-daily-2026-02-27-12-45-30.sql
   Creado: 2026-02-27T12:45:30.123Z

📈 Estadísticas de almacenamiento:
   Total: 11 backups, 450.50 MB
   Diarios: 7 (315.61 MB)
   Semanales: 2 (89.45 MB)
   Mensuales: 2 (45.44 MB)
```

---

## ⚡ Opción 2: Desde la API (Si el servidor está corriendo)

```bash
curl -X POST http://localhost:3000/api/backups/manual \
  -H "Content-Type: application/json"
```

O desde Postman:
- **URL**: `POST http://localhost:3000/api/backups/manual`
- **Headers**: `Content-Type: application/json`
- **Body**: (vacío)

**Resultado esperado**:
```json
{
  "success": true,
  "message": "Backup manual completado",
  "data": {
    "database": {
      "success": true,
      "filename": "inventory-backup-daily-2026-02-27-12-45-30.sql",
      "type": "daily",
      "path": "Prendas/backend/backups/inventory-backup-daily-2026-02-27-12-45-30.sql",
      "sizeInMB": "45.23",
      "createdAt": "2026-02-27T12:45:30.123Z"
    },
    "images": {
      "success": true,
      "message": "Backup de imágenes completado: images-backup-2026-02-27-12-45-30.tar.gz (12.34 MB)"
    }
  }
}
```

---

## 📋 PASOS COMPLETOS

### Paso 1: Limpiar Backups Corruptos (5 minutos)

```bash
cd Prendas/backend
node scripts/validate-and-clean-backups.js
```

Responde "s" a cada archivo corrupto.

### Paso 2: Hacer Backup Manual (2 minutos)

```bash
npm run backup:manual
```

Espera a que se complete.

### Paso 3: Validar el Nuevo Backup (1 minuto)

```bash
node scripts/validate-and-clean-backups.js
```

Verifica que el nuevo backup aparece como "✅ OK"

---

## 🎯 SCRIPTS DISPONIBLES

```bash
# Hacer backup manual
npm run backup:manual

# Validar y limpiar backups
npm run backup:validate

# Ver logs de PM2
npm run pm2:logs

# Reiniciar servidor
npm run pm2:restart
```

---

## ✅ VERIFICACIÓN

Después de hacer el backup, verifica que fue exitoso:

```bash
# Ver el archivo creado
ls -lh Prendas/backend/backups/inventory-backup-daily-*.sql | tail -1

# Debe mostrar algo como:
# -rw-r--r-- 1 user group 45M Feb 27 12:45 Prendas/backend/backups/inventory-backup-daily-2026-02-27-12-45-30.sql
```

---

## 🆘 PROBLEMAS

### "Error: DB_PASSWORD no está configurada"
**Solución**: Verifica que tienes un archivo `.env` en `Prendas/backend/` con:
```
DB_PASSWORD=tu_contraseña
DB_USER=postgres
DB_HOST=localhost
DB_PORT=5433
DB_NAME=inventory
```

### "Error: No se puede conectar a PostgreSQL"
**Solución**: Verifica que PostgreSQL está corriendo:
```bash
psql -U postgres -h localhost -p 5433 -c "SELECT 1"
```

### "Error: El archivo de backup no se creó"
**Solución**: Verifica que tienes espacio en disco y permisos de escritura en `Prendas/backend/backups/`

---

## 📊 INFORMACIÓN ÚTIL

- **Ubicación de backups**: `Prendas/backend/backups/`
- **Tamaño típico**: 40-50 MB
- **Tiempo típico**: 1-2 minutos
- **Frecuencia automática**: Diaria a las 22:00 (10pm)
- **Política de retención**: 7 diarios, 4 semanales, 3 mensuales

---

**Última actualización**: 27 de febrero de 2026
