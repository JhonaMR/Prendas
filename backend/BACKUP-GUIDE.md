# 📚 Guía de Backups - Sistema Prendas

## ¿Cómo funciona el sistema de backups?

### 🔄 Proceso de Backup (NO borra nada)

Tu sistema usa `pg_dump` de PostgreSQL que:
- ✅ **Exporta** toda la base de datos a un archivo SQL
- ✅ **NO toca** la base de datos original
- ✅ **NO borra** ningún dato
- ✅ Es completamente seguro ejecutarlo en cualquier momento

### 📦 Tipos de Backup

El sistema mantiene 3 tipos de backups automáticamente:

1. **Diarios** - Últimos 7 días
2. **Semanales** - Últimas 4 semanas  
3. **Mensuales** - Últimos 12 meses

### 🕐 Programación

- **Base de datos**: Todos los días a las 22:00 (10pm)
- **Imágenes**: Todos los días a las 23:00 (11pm)

## 📁 Ubicación de Backups

```
backend/backups/
├── plow/
│   ├── inventory-backup-daily-2026-03-16.sql
│   ├── inventory-backup-weekly-2026-03-10.sql
│   └── inventory-backup-monthly-2026-03-01.sql
├── melas/
│   ├── inventory-backup-daily-2026-03-16.sql
│   ├── inventory-backup-weekly-2026-03-10.sql
│   └── inventory-backup-monthly-2026-03-01.sql
└── images/
    ├── images-backup-2026-03-16-22-00-00.tar.gz
    └── ...
```

## 🛠️ Comandos Útiles

### Crear backup manual

```bash
# Base de datos
cd backend
node src/scripts/backupDatabase.js

# Imágenes
node src/scripts/backupImages.js
```

### Listar backups disponibles

```bash
# Base de datos
node src/scripts/backupDatabase.js list

# Imágenes
node src/scripts/backupImages.js list
```

### Restaurar un backup

```bash
# Base de datos
node src/scripts/backupDatabase.js restore inventory-backup-daily-2026-03-16.sql.gz

# IMPORTANTE: Esto SÍ sobrescribe la base de datos actual
# Siempre hace un backup de seguridad antes de restaurar
```

## ⚠️ Importante sobre Restauración

Cuando RESTAURAS un backup:
1. El sistema hace un backup de seguridad del estado actual
2. Borra las tablas existentes (`DROP TABLE`)
3. Recrea las tablas con los datos del backup
4. Durante este proceso hay un momento sin datos (segundos)

**Por eso:**
- ❌ NO restaures en horario laboral
- ✅ Restaura en horarios sin usuarios
- ✅ Avisa al equipo antes de restaurar

## 🔐 Backup de Seguridad Automático

Antes de cada restauración, el sistema:
1. Crea un backup del estado actual
2. Lo guarda con nombre especial
3. Si algo sale mal, puedes volver a ese estado

## 📊 Estrategia de Retención

```
Últimas 24 horas: Cada 4 horas (6 backups)
Última semana: 1 por día (7 backups)
Último mes: 1 por semana (4 backups)
Último año: 1 por mes (12 backups)
Más de 1 año: Se eliminan automáticamente
```

## 🚀 Para Desarrollo

### Copiar base de datos de producción a desarrollo

```bash
# 1. En el servidor (producción)
cd backend
node src/scripts/backupDatabase.js
# Esto crea: backups/plow/inventory-backup-daily-2026-03-16.sql.gz

# 2. Descargar el archivo a tu PC

# 3. En tu PC (desarrollo)
# Descomprimir
gunzip inventory-backup-daily-2026-03-16.sql.gz

# Crear base de datos de desarrollo
psql -U postgres -c "CREATE DATABASE prendas_plow_dev;"

# Restaurar
psql -U postgres -d prendas_plow_dev -f inventory-backup-daily-2026-03-16.sql
```

## ☁️ Google Drive

Los backups también se suben automáticamente a Google Drive si está configurado:

```env
GOOGLE_DRIVE_FOLDER_ID_PLOW=tu_folder_id
GOOGLE_DRIVE_FOLDER_ID_MELAS=tu_folder_id
```

## 🆘 Recuperación de Desastres

Si algo sale muy mal:

1. **Detener el sistema**
   ```bash
   pm2 stop all
   ```

2. **Restaurar último backup bueno**
   ```bash
   cd backend
   node src/scripts/backupDatabase.js list
   node src/scripts/backupDatabase.js restore <nombre-archivo>
   ```

3. **Reiniciar sistema**
   ```bash
   pm2 restart all
   ```

## 📝 Logs de Backup

Los logs se guardan en:
```
logs/
├── plow-backup-out.log
├── plow-backup-error.log
├── melas-backup-out.log
└── melas-backup-error.log
```

## ✅ Verificar que los backups funcionan

```bash
# Ver logs recientes
pm2 logs plow-backup-scheduler --lines 50

# Ver backups creados
ls -lh backend/backups/plow/

# Verificar tamaño (debe ser > 0)
du -h backend/backups/plow/
```

## 🎯 Resumen

- ✅ Los backups NO borran nada
- ✅ Se ejecutan automáticamente cada día
- ✅ Mantienen historial de 1 año
- ✅ Se suben a Google Drive
- ⚠️ La restauración SÍ sobrescribe datos
- ⚠️ Siempre restaura fuera de horario laboral
