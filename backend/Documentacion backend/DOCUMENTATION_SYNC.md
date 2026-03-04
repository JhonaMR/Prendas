# 📚 Documentación - Sincronización de Base de Datos

## Resumen
Se ha creado un script SQL completo que verifica y crea automáticamente todas las tablas, índices y triggers necesarios para la base de datos del proyecto Prendas.

## Archivos Creados

### 1. Script de Verificación
**Archivo:** `scripts/verify-and-create-all-tables.sql`

Este script:
- ✅ Verifica que todas las 27 tablas existan
- ✅ Crea las tablas si no existen
- ✅ Crea todos los índices necesarios
- ✅ Configura todos los triggers
- ✅ Establece todas las foreign keys y constraints
- ✅ Es completamente seguro (usa IF NOT EXISTS)
- ✅ Preserva todos los datos existentes

### 2. Documentación
**Archivo:** `SYNC_DATABASE.md`

Guía completa con:
- Instrucciones de uso
- Flujo de trabajo recomendado
- Verificación manual
- Troubleshooting
- Automatización opcional

## Tablas Verificadas (27 total)

### Usuarios y Roles
- users
- user_view_preferences

### Maestros
- sellers
- clients
- confeccionistas
- correrias
- correria_catalog
- disenadoras

### Productos
- product_references
- fichas_diseno
- fichas_costo
- fichas_cortes
- maletas
- maletas_referencias

### Operaciones
- receptions
- reception_items
- return_receptions
- return_reception_items
- dispatches
- dispatch_items
- orders
- order_items

### Seguimiento
- production_tracking
- inventory_movements
- delivery_dates

### Compras
- compras

### Auditoría
- audit_log

## Índices Creados

Se crean índices en:
- Campos de búsqueda frecuente
- Foreign keys
- Campos de filtrado común
- Campos de ordenamiento

Total: 20+ índices para optimizar consultas

## Triggers Configurados

- `trigger_update_user_view_preferences_timestamp` - Actualiza automáticamente `updated_at` en preferencias de usuario

## Cómo Usar

### Opción Rápida (Recomendada)
```bash
cd Prendas/backend
$env:PGPASSWORD='Contrasena14.'; psql -h 127.0.0.1 -p 5433 -U postgres -d inventory -f scripts/verify-and-create-all-tables.sql
```

### Verificación
```bash
# Ver todas las tablas
psql -h 127.0.0.1 -p 5433 -U postgres -d inventory -c "\dt"

# Contar tablas
psql -h 127.0.0.1 -p 5433 -U postgres -d inventory -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
```

## Flujo de Trabajo Recomendado

### En la Oficina
1. Trabajas normalmente
2. Al final del día, haces un backup
3. Subes cambios a Git

### En Casa
1. Clonas/actualizas el repositorio
2. Ejecutas el script de verificación
3. Continúas trabajando

## Ventajas

✅ **Rápido** - Solo crea lo que falta
✅ **Seguro** - No sobrescribe datos existentes
✅ **Idempotente** - Puedes ejecutarlo múltiples veces
✅ **Completo** - Verifica tablas, índices, triggers y constraints
✅ **Documentado** - Incluye comentarios en el SQL

## Resultado de la Ejecución

```
VERIFICACIÓN COMPLETADA | 27 tablas
```

Todas las 27 tablas están presentes y correctamente configuradas.

## Próximos Pasos

1. Usa este script cada vez que cambies de máquina
2. Mantén los backups actualizados
3. Documenta cualquier cambio en la estructura de la BD

## Archivos Relacionados

- `scripts/verify-and-create-all-tables.sql` - Script principal
- `SYNC_DATABASE.md` - Guía de uso
- `BACKUP_SYSTEM.md` - Sistema de backups
- `backups/` - Carpeta con backups automáticos

---

**Creado:** 2026-02-24
**Estado:** ✅ Verificado y Funcional
