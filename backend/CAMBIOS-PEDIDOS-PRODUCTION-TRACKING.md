# 📝 Cambios en Pedidos - Integración con Production Tracking

## Resumen
Se agregó soporte para actualizar automáticamente la tabla `production_tracking` cuando se crean o actualizan pedidos, permitiendo guardar los valores de **programmed** (programadas), **cut** (cortadas) e **inventory** (inventario) directamente desde la vista de Pedidos.

## Cambios Realizados

### 1. Función `createOrder` (línea 719)
**Antes:** Solo creaba el pedido y sus items en `orders` y `order_items`

**Ahora:** 
- Crea el pedido y sus items (comportamiento anterior se mantiene)
- **NUEVO:** Si cada item incluye `programmed`, `cut` o `inventory`, automáticamente actualiza la tabla `production_tracking`
- Usa UPSERT para crear o actualizar según sea necesario

### 2. Función `updateOrder` (línea 936)
**Antes:** Solo actualizaba el pedido y sus items en `orders` y `order_items`

**Ahora:**
- Actualiza el pedido y sus items (comportamiento anterior se mantiene)
- **NUEVO:** Si cada item incluye `programmed`, `cut` o `inventory`, automáticamente actualiza la tabla `production_tracking`
- Usa UPSERT para crear o actualizar según sea necesario

## Retrocompatibilidad ✅

**IMPORTANTE:** Los cambios son 100% retrocompatibles:
- Si el frontend NO envía `programmed`, `cut` o `inventory` en los items, el código funciona exactamente igual que antes
- No hay cambios en la validación de campos requeridos
- No hay cambios en la estructura de respuesta
- Plow seguirá funcionando sin cambios

## Estructura del Request

### Opción 1: Sin production_tracking (funciona igual que antes)
```json
{
  "clientId": "123",
  "sellerId": "456",
  "correriaId": "789",
  "items": [
    {
      "reference": "REF001",
      "quantity": 10,
      "salePrice": 100
    }
  ],
  "totalValue": 1000,
  "settledBy": "user@example.com"
}
```

### Opción 2: Con production_tracking (NUEVO - solo para Melas)
```json
{
  "clientId": "123",
  "sellerId": "456",
  "correriaId": "789",
  "items": [
    {
      "reference": "REF001",
      "quantity": 10,
      "salePrice": 100,
      "programmed": 5,
      "cut": 3,
      "inventory": 2
    }
  ],
  "totalValue": 1000,
  "settledBy": "user@example.com"
}
```

## Detalles Técnicos

### SQL Generado
```sql
INSERT INTO production_tracking (ref_id, correria_id, programmed, cut, inventory)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (ref_id, correria_id) DO UPDATE SET programmed = $3, cut = $4, inventory = $5
```

### Lógica
1. Si `item.programmed` está definido, usa ese valor; si no, usa 0
2. Si `item.cut` está definido, usa ese valor; si no, usa 0
3. Si `item.inventory` está definido, usa ese valor; si no, usa 0
4. Usa la `correria_id` del pedido como clave para `production_tracking`

## Logging
Se agregó logging para rastrear cuando se actualiza `production_tracking`:
```
📊 Actualizando production_tracking para REF001: { programmed: 5, cut: 3, inventory: 2 }
📊 Creando production_tracking para REF001: { programmed: 5, cut: 3, inventory: 2 }
```

## Pruebas Recomendadas

### En Plow (sin cambios esperados)
1. Crear un pedido sin `programmed`, `cut`, `inventory` → Debe funcionar igual que antes
2. Actualizar un pedido sin `programmed`, `cut`, `inventory` → Debe funcionar igual que antes

### En Melas (nuevas funcionalidades)
1. Crear un pedido CON `programmed`, `cut`, `inventory` → Debe guardar en `production_tracking`
2. Actualizar un pedido CON `programmed`, `cut`, `inventory` → Debe actualizar en `production_tracking`
3. Verificar que los valores aparecen en la vista de Pedidos

## Archivos Modificados
- `Prendas/backend/src/controllers/movementsController.js`
  - Función `createOrder` (línea 719)
  - Función `updateOrder` (línea 936)

## Notas de Seguridad
- Los cambios ocurren dentro de una transacción, por lo que si algo falla, todo se revierte
- No hay cambios en los permisos o middleware
- No hay cambios en la validación de datos
