# 🔄 Migración: Delivery Dates - Texto Libre

## Descripción
Cambiar la tabla `delivery_dates` para permitir que `confeccionista_id` y `reference_id` sean texto libre, sin restricciones de clave foránea.

## Cambios
- ✅ Remover restricción de clave foránea en `confeccionista_id`
- ✅ Remover restricción de clave foránea en `reference_id` (si existe)
- ✅ Hacer ambos campos NOT NULL
- ✅ Permitir valores de texto libre

## Instrucciones

### Opción 1: Ejecutar el script SQL directamente

```bash
# Conectar a PostgreSQL
psql -U postgres -d inventory_db -f Prendas/backend/scripts/migrate-delivery-dates-to-text.sql
```

### Opción 2: Ejecutar desde Node.js

```bash
cd Prendas/backend
node -e "
const { query } = require('./src/config/database');
const fs = require('fs');
const sql = fs.readFileSync('./scripts/migrate-delivery-dates-to-text.sql', 'utf8');
query(sql).then(() => {
  console.log('✅ Migración completada');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
"
```

### Opción 3: Ejecutar manualmente en pgAdmin o DBeaver

1. Abre tu cliente SQL (pgAdmin, DBeaver, etc.)
2. Conecta a la base de datos `inventory_db`
3. Copia y pega el contenido de `scripts/migrate-delivery-dates-to-text.sql`
4. Ejecuta el script

## Verificación

Después de ejecutar la migración, verifica que se haya completado correctamente:

```sql
-- Ver la estructura de la tabla
\d delivery_dates

-- Ver las restricciones
SELECT constraint_name, table_name, column_name 
FROM information_schema.key_column_usage 
WHERE table_name = 'delivery_dates';
```

Debería mostrar solo la restricción PRIMARY KEY, sin restricciones de clave foránea.

## Rollback (si es necesario)

Si necesitas revertir los cambios:

```sql
-- Agregar nuevamente la restricción de clave foránea
ALTER TABLE public.delivery_dates 
ADD CONSTRAINT delivery_dates_confeccionista_id_fkey 
FOREIGN KEY (confeccionista_id) REFERENCES public.confeccionistas(id) ON DELETE SET NULL;
```

## Impacto

- ✅ Permite guardar confeccionistas como texto libre
- ✅ Permite guardar referencias como texto libre
- ✅ No afecta datos existentes
- ✅ Compatible con el nuevo sistema de importación

## Notas

- La migración es segura y no elimina datos
- Los campos siguen siendo NOT NULL
- Se pueden seguir usando IDs de confeccionistas/referencias si existen en las tablas maestras
