# 🔄 Sincronización de Base de Datos

## Descripción
Este documento explica cómo sincronizar la base de datos entre diferentes máquinas (oficina y casa) para que puedas continuar trabajando sin problemas.

## Problema que Resuelve
Cuando trabajas en diferentes máquinas, la base de datos puede tener diferencias:
- Tablas faltantes
- Índices no creados
- Triggers no configurados
- Constraints faltantes

Este script verifica y crea automáticamente todo lo necesario.

## Cómo Usar

### Opción 1: Ejecutar el Script de Verificación (RECOMENDADO)

Este script verifica que todas las tablas, índices y triggers existan. Si algo falta, lo crea automáticamente.

```bash
cd Prendas/backend
psql -h 127.0.0.1 -p 5433 -U postgres -d inventory -f scripts/verify-and-create-all-tables.sql
```

**Con contraseña en PowerShell:**
```powershell
$env:PGPASSWORD='Contrasena14.'; psql -h 127.0.0.1 -p 5433 -U postgres -d inventory -f scripts/verify-and-create-all-tables.sql
```

### Opción 2: Restaurar desde Backup

Si prefieres restaurar desde un backup completo:

```bash
cd Prendas/backend
psql -h 127.0.0.1 -p 5433 -U postgres -d inventory -f backups/inventory-backup-daily-2026-02-24-15-24-24.sql
```

## Qué Verifica el Script

### Tablas (27 total)
- ✅ users
- ✅ sellers
- ✅ clients
- ✅ confeccionistas
- ✅ correrias
- ✅ correria_catalog
- ✅ product_references
- ✅ receptions
- ✅ reception_items
- ✅ return_receptions
- ✅ return_reception_items
- ✅ dispatches
- ✅ dispatch_items
- ✅ orders
- ✅ order_items
- ✅ production_tracking
- ✅ inventory_movements
- ✅ delivery_dates
- ✅ disenadoras
- ✅ fichas_diseno
- ✅ fichas_costo
- ✅ fichas_cortes
- ✅ maletas
- ✅ maletas_referencias
- ✅ compras
- ✅ audit_log
- ✅ user_view_preferences

### Índices
- ✅ Índices de búsqueda rápida en todas las tablas
- ✅ Índices en foreign keys
- ✅ Índices en campos de búsqueda frecuente

### Triggers
- ✅ Trigger para actualizar `updated_at` en `user_view_preferences`

### Constraints
- ✅ Primary Keys
- ✅ Foreign Keys
- ✅ Unique Constraints

## Flujo de Trabajo Recomendado

### En la Oficina (Máquina Principal)
1. Trabajas normalmente
2. Al final del día, haces un backup:
   ```bash
   cd Prendas/backend
   pg_dump -h 127.0.0.1 -p 5433 -U postgres -d inventory > backups/inventory-backup-$(date +%Y-%m-%d-%H-%M-%S).sql
   ```
3. Subes los cambios a Git (código + backup)

### En Casa (Máquina Secundaria)
1. Clonas/actualizas el repositorio
2. Ejecutas el script de verificación:
   ```bash
   cd Prendas/backend
   psql -h 127.0.0.1 -p 5433 -U postgres -d inventory -f scripts/verify-and-create-all-tables.sql
   ```
3. Listo, la BD está sincronizada
4. Puedes continuar trabajando

## Verificación Manual

Para verificar que todo está correcto:

```bash
# Ver todas las tablas
psql -h 127.0.0.1 -p 5433 -U postgres -d inventory -c "\dt"

# Ver índices
psql -h 127.0.0.1 -p 5433 -U postgres -d inventory -c "\di"

# Ver triggers
psql -h 127.0.0.1 -p 5433 -U postgres -d inventory -c "\dy"

# Ver una tabla específica
psql -h 127.0.0.1 -p 5433 -U postgres -d inventory -c "\d users"
```

## Archivos Relacionados

- `scripts/verify-and-create-all-tables.sql` - Script de verificación
- `backups/` - Carpeta con backups automáticos
- `BACKUP_SYSTEM.md` - Documentación del sistema de backups

## Notas Importantes

1. **El script es seguro** - Usa `CREATE TABLE IF NOT EXISTS` y `CREATE INDEX IF NOT EXISTS`, así que no sobrescribe nada existente

2. **Preserva datos** - No elimina ni modifica datos existentes, solo crea lo que falta

3. **Idempotente** - Puedes ejecutarlo múltiples veces sin problemas

4. **Rápido** - Solo crea lo que no existe, así que es muy rápido en ejecuciones posteriores

## Troubleshooting

### Error: "relation already exists"
- Esto es normal, significa que la tabla ya existe
- El script usa `IF NOT EXISTS` para evitar errores

### Error: "permission denied"
- Verifica que tienes permisos en la BD
- Usa el usuario `postgres` con la contraseña correcta

### Error: "connection refused"
- Verifica que PostgreSQL está corriendo
- Verifica el host (127.0.0.1) y puerto (5433)

## Automatización (Opcional)

Puedes crear un script batch para automatizar esto:

**Windows (sync-db.bat):**
```batch
@echo off
set PGPASSWORD=Contrasena14.
psql -h 127.0.0.1 -p 5433 -U postgres -d inventory -f scripts/verify-and-create-all-tables.sql
pause
```

**Linux/Mac (sync-db.sh):**
```bash
#!/bin/bash
export PGPASSWORD='Contrasena14.'
psql -h 127.0.0.1 -p 5433 -U postgres -d inventory -f scripts/verify-and-create-all-tables.sql
```

---

**Última actualización:** 2026-02-24
