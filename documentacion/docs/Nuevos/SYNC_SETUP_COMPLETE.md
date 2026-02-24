# ✅ Sistema de Sincronización de Base de Datos - COMPLETADO

## Resumen
Se ha creado un sistema completo para sincronizar la base de datos entre diferentes máquinas (oficina y casa). Ahora puedes trabajar en cualquier lugar sin preocuparte por diferencias en la estructura de la BD.

## Archivos Creados

### 1. Script SQL Principal
**Archivo:** `Prendas/backend/scripts/verify-and-create-all-tables.sql`

- Verifica y crea 27 tablas
- Crea 20+ índices
- Configura triggers
- Establece constraints y foreign keys
- Completamente seguro (IF NOT EXISTS)

### 2. Scripts de Ejecución

#### Windows Batch
**Archivo:** `Prendas/backend/sync-database.bat`
```bash
# Simplemente haz doble click o ejecuta:
sync-database.bat
```

#### PowerShell
**Archivo:** `Prendas/backend/sync-database.ps1`
```powershell
# Ejecuta:
.\sync-database.ps1
```

#### Línea de Comandos
```bash
$env:PGPASSWORD='Contrasena14.'; psql -h 127.0.0.1 -p 5433 -U postgres -d inventory -f scripts/verify-and-create-all-tables.sql
```

### 3. Documentación

#### Guía Completa
**Archivo:** `Prendas/backend/SYNC_DATABASE.md`
- Instrucciones detalladas
- Flujo de trabajo recomendado
- Verificación manual
- Troubleshooting
- Automatización

#### Documentación Técnica
**Archivo:** `Prendas/backend/DOCUMENTATION_SYNC.md`
- Resumen técnico
- Lista de tablas
- Índices creados
- Triggers configurados

## Cómo Usar

### Opción 1: Más Fácil (Recomendado)
1. Abre `Prendas/backend/`
2. Haz doble click en `sync-database.bat`
3. Espera a que termine
4. ¡Listo!

### Opción 2: PowerShell
1. Abre PowerShell en `Prendas/backend/`
2. Ejecuta: `.\sync-database.ps1`
3. ¡Listo!

### Opción 3: Línea de Comandos
```bash
cd Prendas/backend
$env:PGPASSWORD='Contrasena14.'; psql -h 127.0.0.1 -p 5433 -U postgres -d inventory -f scripts/verify-and-create-all-tables.sql
```

## Flujo de Trabajo Recomendado

### En la Oficina
```
1. Trabajas normalmente
2. Al final del día:
   - Haces un backup (automático o manual)
   - Subes cambios a Git
```

### En Casa
```
1. Clonas/actualizas el repositorio
2. Ejecutas: sync-database.bat (o .ps1)
3. ¡Continúas trabajando!
```

## Qué Verifica

✅ **27 Tablas**
- Usuarios, clientes, vendedores
- Productos, referencias, fichas
- Recepciones, despachos, pedidos
- Seguimiento de producción
- Compras, auditoría

✅ **20+ Índices**
- Búsqueda rápida
- Foreign keys
- Campos de filtrado

✅ **Triggers**
- Actualización automática de timestamps

✅ **Constraints**
- Primary keys
- Foreign keys
- Unique constraints

## Ventajas

| Ventaja | Descripción |
|---------|------------|
| ⚡ Rápido | Solo crea lo que falta |
| 🔒 Seguro | No sobrescribe datos |
| 🔄 Idempotente | Puedes ejecutarlo múltiples veces |
| 📋 Completo | Verifica todo |
| 📚 Documentado | Incluye comentarios |

## Verificación

Para verificar que todo está correcto:

```bash
# Ver todas las tablas
psql -h 127.0.0.1 -p 5433 -U postgres -d inventory -c "\dt"

# Contar tablas (debe mostrar 27)
psql -h 127.0.0.1 -p 5433 -U postgres -d inventory -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
```

## Resultado Esperado

```
VERIFICACIÓN COMPLETADA | 27 tablas
```

## Archivos Relacionados

- `scripts/verify-and-create-all-tables.sql` - Script principal
- `sync-database.bat` - Script Windows
- `sync-database.ps1` - Script PowerShell
- `SYNC_DATABASE.md` - Guía completa
- `DOCUMENTATION_SYNC.md` - Documentación técnica
- `BACKUP_SYSTEM.md` - Sistema de backups

## Próximos Pasos

1. ✅ Usa `sync-database.bat` cada vez que cambies de máquina
2. ✅ Mantén los backups actualizados
3. ✅ Documenta cambios en la estructura de la BD

## Notas Importantes

- El script es **completamente seguro**
- No elimina ni modifica datos existentes
- Puedes ejecutarlo múltiples veces sin problemas
- Es muy rápido en ejecuciones posteriores

## Troubleshooting

### "PostgreSQL no está instalado"
- Instala PostgreSQL desde https://www.postgresql.org/download/
- Agrega la carpeta `bin` al PATH

### "connection refused"
- Verifica que PostgreSQL está corriendo
- Verifica host (127.0.0.1) y puerto (5433)

### "permission denied"
- Verifica la contraseña
- Verifica que tienes permisos en la BD

---

**Creado:** 2026-02-24
**Estado:** ✅ COMPLETADO Y VERIFICADO
**Versión:** 1.0
