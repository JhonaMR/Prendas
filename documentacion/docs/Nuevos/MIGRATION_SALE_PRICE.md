# Migración: Agregar Precio de Venta a Pedidos

## ✅ Migración Completada

La migración se ha ejecutado exitosamente. La columna `sale_price` ha sido agregada a la tabla `order_items`.

## Cambios Realizados

Se han realizado los siguientes cambios para agregar soporte de precio de venta en los pedidos:

### 1. Base de Datos
- ✅ Se agregó la columna `sale_price` a la tabla `order_items`
- Tipo: `NUMERIC(10, 2)` con valor por defecto `0`

### 2. Backend
- Actualizado `movementsController.js`:
  - `createOrder()`: Ahora acepta `sale_price` en cada item
  - `getOrders()`: Ahora retorna `sale_price` en los items
- Actualizado `schemas.js`:
  - Validación de `sale_price` como campo requerido y positivo

### 3. Frontend
- Actualizado `OrderSettleView.tsx`:
  - Ahora parsea 3 columnas del CSV: `referencia,cantidad,precio_venta`
  - Muestra el precio de venta en la tabla de vista previa
  - Agrega fila de totales con:
    - Total de referencias
    - Total de unidades
    - Total de valor vendido
- Actualizado `types.ts`:
  - `ItemEntry` ahora incluye campo opcional `salePrice`
- Actualizado `public/ejemplo_pedidos.csv`:
  - Nuevo formato con 3 columnas

## Formato del CSV

El nuevo formato del CSV para importar pedidos es:

```
referencia,cantidad,precio_venta
REF001,10,25000
REF002,5,35000
REF003,8,28000
```

Donde:
- `referencia`: ID de la referencia (debe existir en el sistema)
- `cantidad`: Cantidad de unidades
- `precio_venta`: Precio de venta unitario (puede ser diferente al precio de catálogo)

## Validaciones

- El `precio_venta` es obligatorio
- El `precio_venta` debe ser mayor a 0
- La `cantidad` debe ser mayor a 0
- La `referencia` debe existir en el sistema

## Notas

- Los pedidos anteriores que no tengan `sale_price` tendrán valor `0` por defecto
- El total del pedido se calcula como: `SUM(cantidad * precio_venta)` para cada item
- El precio de venta es independiente del precio de catálogo de la referencia
- La vista previa ahora muestra un resumen con el total de valor vendido
