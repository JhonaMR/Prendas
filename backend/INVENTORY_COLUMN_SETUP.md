# Setup de Columna Inventory en Production Tracking

## Descripción
Se agregó una nueva columna `inventory` a la tabla `production_tracking` para permitir el seguimiento manual de inventario en la vista de Ventas y Producción.

## Cambios Realizados

### 1. Base de Datos
- **Archivo**: `scripts/add-inventory-column.sql`
- **Acción**: Agrega la columna `inventory` (integer, default 0) a la tabla `production_tracking`

### 2. Backend
- **Archivo**: `src/controllers/movementsController.js`
- **Cambios**:
  - `getProductionTracking()`: Ahora devuelve el campo `inventory`
  - `updateProductionTracking()`: Acepta y guarda el campo `inventory`
  - `saveProductionBatch()`: Acepta y guarda el campo `inventory` en lotes

### 3. Frontend
- **Archivo**: `src/types.ts`
  - Agregado campo `inventory?: number` a la interfaz `ProductionTracking`
- **Archivo**: `src/views/OrdersView.tsx`
  - Nueva columna "Inventario" después de "Vendido"
  - Editable solo para admins
  - Se guarda junto con Programadas y Cortadas

## Instrucciones de Instalación

### Opción 1: Ejecutar Script SQL Directamente (Recomendado)

```bash
# Conectarse a PostgreSQL
psql -U postgres -d inventory

# Ejecutar el script
\i scripts/add-inventory-column.sql
```

### Opción 2: Ejecutar desde Node.js

```bash
# En la carpeta backend
node -e "
const { query } = require('./src/config/database');
(async () => {
  try {
    await query('ALTER TABLE public.production_tracking ADD COLUMN IF NOT EXISTS inventory integer DEFAULT 0');
    console.log('✅ Columna inventory agregada exitosamente');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();
"
```

### Opción 3: Usar pgAdmin

1. Conectarse a la base de datos `inventory`
2. Ir a: Schemas > public > Tables > production_tracking
3. Click derecho > Scripts > CREATE Script
4. Ejecutar:
```sql
ALTER TABLE public.production_tracking
ADD COLUMN IF NOT EXISTS inventory integer DEFAULT 0;
```

## Verificación

Para verificar que la columna se agregó correctamente:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'production_tracking'
ORDER BY ordinal_position;
```

Deberías ver:
- ref_id (character varying)
- correria_id (character varying)
- programmed (integer)
- cut (integer)
- **inventory (integer)** ← Nueva columna

## Rollback (Si es necesario)

Si necesitas revertir los cambios:

```sql
ALTER TABLE public.production_tracking
DROP COLUMN IF EXISTS inventory;
```

## Notas

- La columna tiene un valor por defecto de 0
- Es compatible con datos existentes (no afecta registros anteriores)
- El campo es opcional en las peticiones API (si no se envía, se asume 0)
