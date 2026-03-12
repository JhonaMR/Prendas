# Cambios Realizados - Porcentajes de Facturación

## Resumen
Se agregaron dos campos de porcentaje (Oficial y Remisión) a los pedidos, que se leen del Excel y se validan antes de guardar.

## Archivos Modificados

### 1. Base de Datos
- **`backend/scripts/verify-and-create-all-tables.sql`**
  - Agregadas columnas `porcentaje_oficial` y `porcentaje_remision` (numeric 5,2) a la tabla `orders`

- **`backend/scripts/add-porcentajes-to-orders.sql`** (NUEVO)
  - Script para agregar las columnas a la base de datos existente
  - Actualiza todos los registros existentes con valor 0
  - **EJECUTAR ESTE SCRIPT EN LA BASE DE DATOS**

### 2. Backend
- **`backend/src/controllers/movementsController.js`**
  - Función `createOrder` actualizada para recibir y guardar `porcentajeOficial` y `porcentajeRemision`
  - Los valores se insertan en la base de datos y se retornan en la respuesta

### 3. Frontend - Tipos
- **`src/types.ts`**
  - Interface `Order` actualizada con:
    - `porcentajeOficial?: number | null`
    - `porcentajeRemision?: number | null`

### 4. Frontend - Vista de Asentar Ventas
- **`src/views/OrderSettleView.tsx`**
  - Agregados estados para los porcentajes
  - Lectura automática de porcentajes del Excel (celdas J3 y K3)
  - Campos de entrada para % Oficial y % Remisión (debajo de las fechas)
  - Validación obligatoria: alerta si los porcentajes están vacíos antes de guardar
  - Selector de correría cambiado a autocomplete (usando `CorreriaAutocomplete`)
  - Los campos se limpian al guardar exitosamente

### 5. Frontend - Exportación
- **`src/utils/exportOrderExcel.ts`**
  - Al exportar un pedido a Excel, se escriben los porcentajes en J3 y K3

## Celdas del Excel
- **J3**: Porcentaje Oficial
- **K3**: Porcentaje Remisión
- **N9**: Código de Cliente
- **M4**: Número de Pedido
- **Fila 20+**: Items del pedido

## Validaciones
1. Los porcentajes deben estar presentes antes de guardar
2. Si no están en el Excel, los campos quedan vacíos y se muestra alerta al intentar guardar
3. El usuario debe llenar manualmente los porcentajes si no vienen del Excel

## Instrucciones de Despliegue
1. Ejecutar el script SQL: `backend/scripts/add-porcentajes-to-orders.sql`
2. Reiniciar el backend para cargar los cambios del controlador
3. El frontend se actualizará automáticamente

## Notas
- Los pedidos existentes tendrán valor 0 en ambos porcentajes (se pueden actualizar manualmente)
- Los nuevos pedidos requieren los porcentajes obligatoriamente
