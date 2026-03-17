# ✅ Sistema de Migraciones - Implementación Completa

**Fecha de implementación:** 16 de Marzo, 2026

---

## 📦 ¿Qué se implementó?

Se creó un sistema completo de migraciones de base de datos que permite:

✅ Versionar cambios de BD junto con el código en Git  
✅ Aplicar cambios automáticamente a múltiples bases de datos (Plow y Melas)  
✅ Trabajar en desarrollo sin afectar producción  
✅ Revertir cambios si algo sale mal  
✅ Backup automático antes de cada migración  
✅ Historial completo de cambios aplicados  

---

## 📁 Archivos Creados

### Scripts (backend/scripts/)
- `createMigration.js` - Crear nuevas migraciones
- `applyMigrations.js` - Aplicar migraciones pendientes
- `migrationStatus.js` - Ver estado de migraciones
- `rollbackMigration.js` - Revertir migraciones
- `setupDevDatabase.js` - Configurar BD de desarrollo

### Documentación
- `backend/migrations/README.md` - Guía de uso de migraciones
- `backend/MIGRATIONS-QUICKSTART.md` - Inicio rápido
- `documentacion/GUIA-MIGRACIONES.md` - Guía completa con ejemplos
- `documentacion/SISTEMA-MIGRACIONES-RESUMEN.md` - Este archivo

### Carpetas
- `backend/migrations/` - Archivos de migración SQL
- `backend/backups/migrations/` - Backups automáticos

---

## 🚀 Configuración Inicial

### Paso 1: Crear base de datos de desarrollo

```bash
cd backend
node scripts/setupDevDatabase.js
```

Esto crea la base de datos `prendas_dev` copiando la estructura de `inventory_plow`.

### Paso 2: Configurar .env para desarrollo (opcional)

Crea `backend/.env.dev`:
```env
NODE_ENV=development
PORT=3002
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=prendas_dev
```

### Paso 3: Verificar instalación

```bash
npm run migrate:status:all
```

Deberías ver:
```
Base de datos: DEV
Base de datos: PLOW
Base de datos: MELAS
```

---

## 💻 Comandos Disponibles

### Usando npm scripts (recomendado):

```bash
# Crear migración
npm run migrate:create "descripcion"

# Aplicar en desarrollo
npm run migrate:up

# Aplicar en producción
npm run migrate:up:prod

# Ver estado
npm run migrate:status
npm run migrate:status:all

# Revertir
npm run migrate:rollback

# Configurar BD desarrollo
npm run migrate:setup
```

### Usando node directamente:

```bash
# Crear migración
node scripts/createMigration.js "descripcion"

# Aplicar
node scripts/applyMigrations.js --env=dev
node scripts/applyMigrations.js --env=prod
node scripts/applyMigrations.js --target=plow
node scripts/applyMigrations.js --target=melas

# Ver estado
node scripts/migrationStatus.js
node scripts/migrationStatus.js --all

# Revertir
node scripts/rollbackMigration.js
node scripts/rollbackMigration.js 003_nombre
node scripts/rollbackMigration.js --target=plow
```

---

## 🔄 Flujo de Trabajo Completo

### En Desarrollo (Tu PC):

```bash
# 1. Crear rama
git checkout -b feature/nueva-funcionalidad

# 2. Crear migración
npm run migrate:create "add_email_to_clients"

# 3. Editar migrations/XXX_add_email_to_clients.sql
# Agregar SQL en sección UP y DOWN

# 4. Aplicar en desarrollo
npm run migrate:up

# 5. Probar
npm run dev

# 6. Commit
git add migrations/XXX_add_email_to_clients.sql
git add src/...  # Código que usa los cambios
git commit -m "Agregar campo email a clientes"

# 7. Merge
git checkout main
git merge feature/nueva-funcionalidad
git push origin main
```

### En Producción (Servidor):

```bash
# 1. Pull
cd /ruta/proyecto
git pull origin main

# 2. Aplicar migraciones (hace backup automático)
npm run migrate:up:prod

# 3. Reiniciar
pm2 restart all

# 4. Verificar
npm run migrate:status:all
```

---

## 📝 Estructura de Migración

Cada archivo de migración sigue este formato:

```sql
-- migrations/002_add_email_to_clients.sql
-- Descripción: Agregar campo email a clientes
-- Fecha: 2026-03-16
-- Autor: Luis

-- ==================== UP ====================
-- Cambios a aplicar

ALTER TABLE clientes ADD COLUMN email VARCHAR(255);
CREATE INDEX idx_clientes_email ON clientes(email);

-- ==================== DOWN ====================
-- Cómo revertir (comentado por seguridad)

-- DROP INDEX idx_clientes_email;
-- ALTER TABLE clientes DROP COLUMN email;
```

---

## 🎯 Casos de Uso Comunes

### 1. Agregar columna
```bash
npm run migrate:create "add_phone_to_clients"
```
```sql
ALTER TABLE clientes ADD COLUMN telefono VARCHAR(20);
```

### 2. Crear tabla
```bash
npm run migrate:create "create_notifications"
```
```sql
CREATE TABLE notificaciones (
  id SERIAL PRIMARY KEY,
  mensaje TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Modificar datos
```bash
npm run migrate:create "update_prices"
```
```sql
UPDATE referencias SET precio = precio * 1.10 WHERE categoria = 'premium';
```

### 4. Agregar índice
```bash
npm run migrate:create "add_index_clients_email"
```
```sql
CREATE INDEX idx_clientes_email ON clientes(email);
```

---

## 🔐 Seguridad y Backups

### Backups Automáticos

Antes de aplicar cada migración, el sistema:
1. Crea backup automático de la BD
2. Guarda en `backend/backups/migrations/`
3. Formato: `{bd}_pre_migration_{fecha}.sql`

### Transacciones

Cada migración se ejecuta en una transacción:
- Si algo falla, se revierte automáticamente
- No quedan cambios parciales
- La BD queda en estado consistente

### Registro de Cambios

Tabla `schema_migrations` registra:
- Nombre de migración
- Fecha de aplicación
- Éxito/Error
- Tiempo de ejecución
- Mensaje de error (si aplica)

---

## 🆘 Solución de Problemas

### Migración falló

```bash
# Ver el error
npm run migrate:status

# La migración NO se aplicó (rollback automático)
# Corregir el SQL en el archivo

# Volver a aplicar
npm run migrate:up
```

### Bases desincronizadas

```bash
# Ver estado de todas
npm run migrate:status:all

# Aplicar solo donde falta
node scripts/applyMigrations.js --target=melas
```

### Necesito revertir

```bash
# Revertir última
npm run migrate:rollback

# Revertir específica
node scripts/rollbackMigration.js 003_nombre
```

### Olvidé crear migración

```bash
# Crear migración ahora
npm run migrate:create "cambios_que_hice"

# Escribir el SQL

# Marcar como aplicada en desarrollo (si ya lo hiciste manualmente)
psql -d prendas_dev -c "INSERT INTO schema_migrations (migration_name) VALUES ('XXX_cambios_que_hice.sql');"

# Aplicar en producción
npm run migrate:up:prod
```

---

## ✅ Mejores Prácticas

1. **Siempre probar en desarrollo primero**
   ```bash
   npm run migrate:up  # Desarrollo
   npm run dev         # Probar
   # Luego aplicar en producción
   ```

2. **Una migración = Un cambio lógico**
   - ✅ Una migración para agregar sistema de notificaciones
   - ❌ Múltiples cambios no relacionados en una migración

3. **Nombres descriptivos**
   - ✅ `add_email_to_clients`
   - ❌ `changes` o `fix`

4. **Siempre incluir sección DOWN**
   - Permite revertir si algo sale mal
   - Documenta cómo deshacer el cambio

5. **Documentar el "por qué"**
   ```sql
   -- Descripción: Agregar email para notificaciones
   -- Requerimiento: Ticket #123
   ```

6. **Considerar datos existentes**
   ```sql
   -- Agregar columna con default
   ALTER TABLE clientes ADD COLUMN activo BOOLEAN DEFAULT TRUE;
   -- Luego hacer NOT NULL
   ALTER TABLE clientes ALTER COLUMN activo SET NOT NULL;
   ```

---

## 📊 Monitoreo

### Ver estado general
```bash
npm run migrate:status:all
```

### Ver última migración aplicada
```bash
npm run migrate:status
```

### Ver backups creados
```bash
ls -lh backend/backups/migrations/
```

### Ver logs (si hay errores)
```bash
# Los errores se muestran en consola
# También puedes revisar logs de PM2
pm2 logs
```

---

## 🎓 Recursos de Aprendizaje

1. **Quick Start:** `backend/MIGRATIONS-QUICKSTART.md`
2. **Guía Completa:** `documentacion/GUIA-MIGRACIONES.md`
3. **README Migraciones:** `backend/migrations/README.md`
4. **Ejemplo de Migración:** `backend/migrations/001_example_migration.sql`

---

## 📈 Próximos Pasos

### Inmediato
1. ✅ Configurar BD de desarrollo: `npm run migrate:setup`
2. ✅ Verificar instalación: `npm run migrate:status:all`
3. ✅ Crear primera migración de prueba

### Cuando necesites hacer cambios
1. Crear migración
2. Aplicar en desarrollo
3. Probar
4. Commit
5. Aplicar en producción

### Futuro (opcional)
- Integrar con CI/CD para aplicar migraciones automáticamente
- Agregar tests para validar migraciones
- Crear migraciones de datos (seeds) para desarrollo

---

## 🎉 Beneficios Obtenidos

✅ **Control de versiones:** Cambios de BD en Git junto con código  
✅ **Automatización:** Aplicar a múltiples BDs con un comando  
✅ **Seguridad:** Backups automáticos y transacciones  
✅ **Trazabilidad:** Historial completo de cambios  
✅ **Reversibilidad:** Puedes deshacer cambios  
✅ **Colaboración:** Equipo puede ver y aplicar cambios fácilmente  
✅ **Desarrollo seguro:** Trabaja sin afectar producción  

---

## 📞 Soporte

Si tienes dudas o problemas:
1. Consulta la guía completa: `documentacion/GUIA-MIGRACIONES.md`
2. Revisa el estado: `npm run migrate:status:all`
3. Verifica backups: `backend/backups/migrations/`

---

**Sistema implementado:** 16 de Marzo, 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Listo para usar
