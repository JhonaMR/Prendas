# 🔄 Guía Completa del Sistema de Migraciones

## 📚 Índice

1. [Introducción](#introducción)
2. [Instalación Inicial](#instalación-inicial)
3. [Flujo de Trabajo](#flujo-de-trabajo)
4. [Comandos](#comandos)
5. [Ejemplos Prácticos](#ejemplos-prácticos)
6. [Mejores Prácticas](#mejores-prácticas)
7. [Solución de Problemas](#solución-de-problemas)

---

## 🎯 Introducción

El sistema de migraciones te permite:
- ✅ Versionar cambios de base de datos junto con el código
- ✅ Aplicar cambios automáticamente a múltiples bases de datos (Plow y Melas)
- ✅ Revertir cambios si algo sale mal
- ✅ Mantener sincronizadas desarrollo y producción
- ✅ Historial completo de cambios en Git

---

## 🚀 Instalación Inicial

### 1. Crear base de datos de desarrollo

```bash
# Conectar a PostgreSQL
psql -U postgres -h localhost -p 5433

# Crear base de datos de desarrollo
CREATE DATABASE prendas_dev;

# Salir
\q
```

### 2. Copiar datos de producción a desarrollo (opcional)

```bash
# Exportar desde producción
pg_dump -h localhost -p 5433 -U postgres -d inventory_plow -f plow_backup.sql

# Importar a desarrollo
psql -h localhost -p 5433 -U postgres -d prendas_dev -f plow_backup.sql
```

### 3. Configurar .env para desarrollo

Crea o modifica `backend/.env.dev`:

```env
NODE_ENV=development
PORT=3002
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=prendas_dev
```

### 4. Verificar instalación

```bash
cd backend
node scripts/migrationStatus.js --all
```

---

## 🔄 Flujo de Trabajo

### Desarrollo Local (Tu PC)

```
1. Crear rama de desarrollo
   ↓
2. Crear archivo de migración
   ↓
3. Escribir SQL de cambios
   ↓
4. Aplicar en BD de desarrollo
   ↓
5. Probar que funciona
   ↓
6. Commit código + migración
   ↓
7. Merge a main
```

### Producción (Servidor)

```
1. Pull de cambios
   ↓
2. Aplicar migraciones (hace backup automático)
   ↓
3. Reiniciar PM2
```

---

## 📝 Comandos

### Crear nueva migración

```bash
cd backend
node scripts/createMigration.js "descripcion_del_cambio"
```

**Ejemplo:**
```bash
node scripts/createMigration.js "add_email_to_clients"
# Genera: migrations/002_add_email_to_clients.sql
```

### Ver estado de migraciones

```bash
# Estado de BD actual
node scripts/migrationStatus.js

# Estado de todas las BDs
node scripts/migrationStatus.js --all
```

### Aplicar migraciones

```bash
# En desarrollo (tu PC)
node scripts/applyMigrations.js --env=dev

# En producción (servidor) - aplica a Plow y Melas
node scripts/applyMigrations.js --env=prod

# Solo en una BD específica
node scripts/applyMigrations.js --target=plow
node scripts/applyMigrations.js --target=melas
```

### Revertir migración

```bash
# Revertir última migración
node scripts/rollbackMigration.js

# Revertir migración específica
node scripts/rollbackMigration.js 003_add_discounts

# Revertir en BD específica
node scripts/rollbackMigration.js --target=plow
```

---

## 💡 Ejemplos Prácticos

### Ejemplo 1: Agregar columna a tabla existente

**1. Crear migración:**
```bash
node scripts/createMigration.js "add_phone_to_clients"
```

**2. Editar `migrations/002_add_phone_to_clients.sql`:**
```sql
-- migrations/002_add_phone_to_clients.sql
-- Descripción: Agregar campo teléfono a clientes
-- Fecha: 2026-03-16
-- Autor: Luis

-- ==================== UP ====================
ALTER TABLE clientes 
ADD COLUMN telefono VARCHAR(20);

CREATE INDEX idx_clientes_telefono ON clientes(telefono);

-- ==================== DOWN ====================
-- DROP INDEX idx_clientes_telefono;
-- ALTER TABLE clientes DROP COLUMN telefono;
```

**3. Aplicar en desarrollo:**
```bash
node scripts/applyMigrations.js --env=dev
```

**4. Probar:**
```bash
npm run dev
# Verificar que el campo aparece en la aplicación
```

**5. Commit:**
```bash
git add migrations/002_add_phone_to_clients.sql
git add backend/src/models/Cliente.js  # Si modificaste el modelo
git commit -m "Agregar campo teléfono a clientes"
```

**6. Merge y aplicar en producción:**
```bash
# En tu PC
git checkout main
git merge develop
git push origin main

# En el servidor
cd /ruta/proyecto
git pull origin main
node scripts/applyMigrations.js --env=prod
pm2 restart all
```

---

### Ejemplo 2: Crear nueva tabla

**1. Crear migración:**
```bash
node scripts/createMigration.js "create_notifications_table"
```

**2. Editar migración:**
```sql
-- migrations/003_create_notifications_table.sql
-- Descripción: Crear tabla de notificaciones
-- Fecha: 2026-03-16
-- Autor: Luis

-- ==================== UP ====================
CREATE TABLE notificaciones (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  mensaje TEXT NOT NULL,
  leido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notificaciones_user ON notificaciones(user_id);
CREATE INDEX idx_notificaciones_leido ON notificaciones(leido);
CREATE INDEX idx_notificaciones_created ON notificaciones(created_at);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notificaciones_updated_at 
  BEFORE UPDATE ON notificaciones 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ==================== DOWN ====================
-- DROP TRIGGER update_notificaciones_updated_at ON notificaciones;
-- DROP FUNCTION update_updated_at_column();
-- DROP TABLE notificaciones;
```

**3. Aplicar y probar:**
```bash
node scripts/applyMigrations.js --env=dev
```

---

### Ejemplo 3: Modificar datos existentes

**1. Crear migración:**
```bash
node scripts/createMigration.js "update_default_prices"
```

**2. Editar migración:**
```sql
-- migrations/004_update_default_prices.sql
-- Descripción: Actualizar precios con incremento del 10%
-- Fecha: 2026-03-16
-- Autor: Luis

-- ==================== UP ====================
-- Guardar precios anteriores en tabla temporal
CREATE TEMP TABLE precios_anteriores AS
SELECT id, precio FROM referencias;

-- Aplicar incremento
UPDATE referencias 
SET precio = precio * 1.10 
WHERE categoria = 'premium' AND precio > 0;

-- Log de cambios
INSERT INTO audit_log (tabla, accion, descripcion, created_at)
VALUES ('referencias', 'UPDATE', 'Incremento de precios 10% categoría premium', NOW());

-- ==================== DOWN ====================
-- Restaurar precios desde backup
-- UPDATE referencias r
-- SET precio = pa.precio
-- FROM precios_anteriores pa
-- WHERE r.id = pa.id;
```

---

### Ejemplo 4: Agregar columna con datos por defecto

**1. Crear migración:**
```bash
node scripts/createMigration.js "add_status_to_orders"
```

**2. Editar migración:**
```sql
-- migrations/005_add_status_to_orders.sql
-- Descripción: Agregar campo estado a pedidos
-- Fecha: 2026-03-16
-- Autor: Luis

-- ==================== UP ====================
-- Agregar columna
ALTER TABLE pedidos 
ADD COLUMN estado VARCHAR(20);

-- Establecer valores por defecto para registros existentes
UPDATE pedidos 
SET estado = CASE 
  WHEN fecha_entrega IS NOT NULL THEN 'entregado'
  WHEN fecha_despacho IS NOT NULL THEN 'despachado'
  ELSE 'pendiente'
END;

-- Hacer la columna NOT NULL ahora que tiene valores
ALTER TABLE pedidos 
ALTER COLUMN estado SET NOT NULL;

-- Agregar constraint
ALTER TABLE pedidos 
ADD CONSTRAINT chk_pedidos_estado 
CHECK (estado IN ('pendiente', 'despachado', 'entregado', 'cancelado'));

-- Crear índice
CREATE INDEX idx_pedidos_estado ON pedidos(estado);

-- ==================== DOWN ====================
-- DROP INDEX idx_pedidos_estado;
-- ALTER TABLE pedidos DROP CONSTRAINT chk_pedidos_estado;
-- ALTER TABLE pedidos DROP COLUMN estado;
```

---

## ✅ Mejores Prácticas

### 1. Nombres descriptivos
```bash
# ✅ Bien
node scripts/createMigration.js "add_email_to_clients"
node scripts/createMigration.js "create_notifications_table"
node scripts/createMigration.js "update_prices_2026_q1"

# ❌ Mal
node scripts/createMigration.js "changes"
node scripts/createMigration.js "fix"
node scripts/createMigration.js "update"
```

### 2. Una migración = Un cambio lógico
```sql
-- ✅ Bien: Una migración para agregar sistema de notificaciones
CREATE TABLE notificaciones (...);
CREATE INDEX idx_notificaciones_user (...);
CREATE TRIGGER update_notificaciones (...);

-- ❌ Mal: Múltiples cambios no relacionados
ALTER TABLE clientes ADD COLUMN telefono (...);
CREATE TABLE notificaciones (...);
UPDATE referencias SET precio = precio * 1.1;
```

### 3. Siempre incluir sección DOWN
```sql
-- ✅ Bien
-- ==================== DOWN ====================
-- DROP INDEX idx_clientes_telefono;
-- ALTER TABLE clientes DROP COLUMN telefono;

-- ❌ Mal
-- ==================== DOWN ====================
-- (vacío)
```

### 4. Probar en desarrollo primero
```bash
# ✅ Siempre
node scripts/applyMigrations.js --env=dev
npm run dev  # Probar que funciona
git commit   # Luego commit

# ❌ Nunca
git commit   # Commit sin probar
# Aplicar directo en producción
```

### 5. Usar transacciones implícitas
```sql
-- ✅ Bien: Todo en la sección UP se ejecuta en una transacción
ALTER TABLE clientes ADD COLUMN email VARCHAR(255);
CREATE INDEX idx_clientes_email ON clientes(email);
-- Si algo falla, se revierte todo automáticamente

-- ❌ Mal: Comandos que no se pueden revertir
-- VACUUM FULL clientes;  # No se puede hacer en transacción
```

### 6. Documentar el "por qué"
```sql
-- ✅ Bien
-- Descripción: Agregar campo email para sistema de notificaciones
-- Requerimiento: Ticket #123 - Notificaciones por email
-- Impacto: Permite enviar emails a clientes

-- ❌ Mal
-- Descripción: Agregar columna
```

### 7. Considerar datos existentes
```sql
-- ✅ Bien: Agregar columna con valores por defecto
ALTER TABLE clientes ADD COLUMN activo BOOLEAN DEFAULT TRUE;
UPDATE clientes SET activo = TRUE WHERE activo IS NULL;
ALTER TABLE clientes ALTER COLUMN activo SET NOT NULL;

-- ❌ Mal: Agregar columna NOT NULL sin default
ALTER TABLE clientes ADD COLUMN activo BOOLEAN NOT NULL;
-- Esto falla si hay registros existentes
```

---

## 🆘 Solución de Problemas

### Problema 1: Migración falla a mitad de camino

**Síntomas:**
```
✗ Error: syntax error at or near "CREAT"
```

**Solución:**
```bash
# 1. Ver el estado
node scripts/migrationStatus.js

# 2. La migración NO se registró (gracias a transacciones)
# 3. Corregir el SQL en el archivo de migración

# 4. Volver a aplicar
node scripts/applyMigrations.js --env=dev
```

---

### Problema 2: Olvidé crear migración y cambié la BD directamente

**Síntomas:**
- Desarrollo funciona
- Producción no tiene los cambios

**Solución:**
```bash
# 1. Crear migración con los cambios que hiciste
node scripts/createMigration.js "add_missing_column"

# 2. Escribir el SQL que aplicaste manualmente

# 3. NO aplicar en desarrollo (ya lo tienes)
# Marcar como aplicada manualmente:
psql -d prendas_dev -c "INSERT INTO schema_migrations (migration_name) VALUES ('002_add_missing_column.sql');"

# 4. Aplicar en producción
node scripts/applyMigrations.js --env=prod
```

---

### Problema 3: Bases de datos desincronizadas

**Síntomas:**
```bash
node scripts/migrationStatus.js --all
# Plow: 5 migraciones
# Melas: 3 migraciones
```

**Solución:**
```bash
# Aplicar solo a la que falta
node scripts/applyMigrations.js --target=melas
```

---

### Problema 4: Necesito revertir una migración

**Solución:**
```bash
# 1. Ver qué migraciones están aplicadas
node scripts/migrationStatus.js

# 2. Revertir la última
node scripts/rollbackMigration.js

# 3. O revertir una específica
node scripts/rollbackMigration.js 005_add_status

# 4. Verificar
node scripts/migrationStatus.js
```

---

### Problema 5: Error "schema_migrations table does not exist"

**Solución:**
```bash
# La tabla se crea automáticamente en la primera migración
# Si no existe, aplicar cualquier migración la creará
node scripts/applyMigrations.js --env=dev
```

---

## 📊 Checklist de Migración

Antes de aplicar en producción, verifica:

- [ ] Migración probada en desarrollo
- [ ] Código que usa los cambios está funcionando
- [ ] Sección DOWN está completa
- [ ] Migración está commiteada en Git
- [ ] Backup automático está configurado
- [ ] Notificaste al equipo (si aplica)
- [ ] Tienes acceso al servidor
- [ ] Es horario de bajo tráfico (si es cambio grande)

---

## 🎯 Resumen de Comandos Rápidos

```bash
# Crear migración
node scripts/createMigration.js "descripcion"

# Ver estado
node scripts/migrationStatus.js
node scripts/migrationStatus.js --all

# Aplicar
node scripts/applyMigrations.js --env=dev
node scripts/applyMigrations.js --env=prod
node scripts/applyMigrations.js --target=plow

# Revertir
node scripts/rollbackMigration.js
node scripts/rollbackMigration.js 003_nombre
```

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs: `backend/logs/migrations.log`
2. Verifica el estado: `node scripts/migrationStatus.js --all`
3. Revisa los backups: `backend/backups/migrations/`
4. Consulta esta guía

---

**Última actualización:** 16 de Marzo, 2026
