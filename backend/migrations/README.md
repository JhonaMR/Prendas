# 🔄 Sistema de Migraciones - Base de Datos

## ¿Qué son las migraciones?

Las migraciones son archivos SQL que documentan y aplican cambios en la estructura de la base de datos de forma controlada y versionada.

## 📁 Estructura

```
migrations/
├── README.md (este archivo)
├── 001_initial_schema.sql
├── 002_add_feature.sql
└── ...
```

## 📝 Formato de Archivo

Cada migración debe seguir este formato:

```sql
-- migrations/XXX_descripcion.sql
-- Descripción: Descripción detallada del cambio
-- Fecha: YYYY-MM-DD
-- Autor: Nombre

-- ==================== UP ====================
-- Cambios a aplicar

ALTER TABLE tabla ADD COLUMN nueva_columna VARCHAR(50);

-- ==================== DOWN ====================
-- Cómo revertir los cambios (comentado por seguridad)

-- ALTER TABLE tabla DROP COLUMN nueva_columna;
```

## 🚀 Comandos

### Crear nueva migración
```bash
cd backend
node scripts/createMigration.js "descripcion_del_cambio"
```

### Aplicar migraciones pendientes

**Desarrollo (tu PC):**
```bash
node scripts/applyMigrations.js --env=dev
```

**Producción (servidor):**
```bash
node scripts/applyMigrations.js --env=prod
# Aplica automáticamente a Plow y Melas
```

**Solo una base de datos:**
```bash
node scripts/applyMigrations.js --target=plow
node scripts/applyMigrations.js --target=melas
```

### Ver estado de migraciones
```bash
node scripts/migrationStatus.js
```

### Revertir última migración
```bash
node scripts/rollbackMigration.js
```

## 📋 Flujo de Trabajo

### 1. Desarrollo Local

```bash
# Crear rama
git checkout -b feature/nueva-funcionalidad

# Crear migración
node scripts/createMigration.js "agregar_campo_telefono"
# Genera: migrations/003_agregar_campo_telefono.sql

# Editar el archivo y agregar SQL

# Aplicar en tu BD local
node scripts/applyMigrations.js --env=dev

# Probar que funciona
npm run dev

# Commit
git add migrations/003_agregar_campo_telefono.sql
git commit -m "Agregar campo teléfono a clientes"
```

### 2. Merge a Main

```bash
git checkout main
git merge feature/nueva-funcionalidad
git push origin main
```

### 3. Aplicar en Producción

```bash
# En el servidor
cd /ruta/proyecto
git pull origin main

# Aplicar migraciones (hace backup automático)
node scripts/applyMigrations.js --env=prod

# Reiniciar aplicación
pm2 restart all
```

## ⚠️ Reglas Importantes

### ✅ HACER:
- Crear una migración por cada cambio de BD
- Probar la migración en desarrollo antes de producción
- Incluir comentarios descriptivos
- Commitear la migración junto con el código que la usa
- Incluir sección DOWN para poder revertir

### ❌ NO HACER:
- Modificar migraciones ya aplicadas en producción
- Eliminar archivos de migración
- Aplicar cambios directamente en producción sin migración
- Olvidar hacer backup antes de aplicar

## 🔐 Seguridad

- El sistema hace backup automático antes de aplicar migraciones
- Cada migración se registra en la tabla `schema_migrations`
- Si una migración falla, se detiene el proceso
- Los backups se guardan en `backend/backups/migrations/`

## 📊 Tabla de Control

El sistema crea automáticamente una tabla para rastrear migraciones:

```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) NOT NULL UNIQUE,
  applied_at TIMESTAMP DEFAULT NOW(),
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  execution_time_ms INTEGER
);
```

## 🆘 Solución de Problemas

### Migración falló a mitad de camino
```bash
# Ver el error
node scripts/migrationStatus.js

# Restaurar backup
node scripts/restoreMigrationBackup.js <nombre-backup>

# Corregir la migración
# Volver a aplicar
node scripts/applyMigrations.js --env=dev
```

### Necesito revertir una migración
```bash
# Revertir última migración
node scripts/rollbackMigration.js

# Revertir migración específica
node scripts/rollbackMigration.js 003_agregar_campo_telefono
```

### Bases de datos desincronizadas
```bash
# Ver estado de cada BD
node scripts/migrationStatus.js --all

# Aplicar solo a la que falta
node scripts/applyMigrations.js --target=melas
```

## 📚 Ejemplos

### Agregar columna
```sql
-- migrations/004_add_email_to_clients.sql
-- Descripción: Agregar campo email a tabla clientes
-- Fecha: 2026-03-16
-- Autor: Luis

-- ==================== UP ====================
ALTER TABLE clientes 
ADD COLUMN email VARCHAR(255);

CREATE INDEX idx_clientes_email ON clientes(email);

-- ==================== DOWN ====================
-- DROP INDEX idx_clientes_email;
-- ALTER TABLE clientes DROP COLUMN email;
```

### Crear tabla
```sql
-- migrations/005_create_notifications.sql
-- Descripción: Crear tabla de notificaciones
-- Fecha: 2026-03-16
-- Autor: Luis

-- ==================== UP ====================
CREATE TABLE notificaciones (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES usuarios(id),
  mensaje TEXT NOT NULL,
  leido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notificaciones_user ON notificaciones(user_id);
CREATE INDEX idx_notificaciones_leido ON notificaciones(leido);

-- ==================== DOWN ====================
-- DROP TABLE notificaciones;
```

### Modificar datos
```sql
-- migrations/006_update_default_prices.sql
-- Descripción: Actualizar precios por defecto
-- Fecha: 2026-03-16
-- Autor: Luis

-- ==================== UP ====================
UPDATE referencias 
SET precio = precio * 1.10 
WHERE categoria = 'premium';

-- ==================== DOWN ====================
-- UPDATE referencias 
-- SET precio = precio / 1.10 
-- WHERE categoria = 'premium';
```

## 🎯 Tips

1. **Nombres descriptivos:** Usa nombres claros que expliquen el cambio
2. **Una cosa a la vez:** Una migración = un cambio lógico
3. **Prueba primero:** Siempre prueba en desarrollo
4. **Documenta:** Explica el "por qué" en los comentarios
5. **Reversible:** Siempre incluye la sección DOWN

## 📞 Soporte

Si tienes problemas con las migraciones, revisa:
1. Los logs en `backend/logs/migrations.log`
2. El estado con `node scripts/migrationStatus.js`
3. Los backups en `backend/backups/migrations/`
