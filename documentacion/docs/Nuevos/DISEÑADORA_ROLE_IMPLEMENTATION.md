# Implementación del Rol "Diseñadora"

## Resumen
Se ha creado un nuevo tipo de usuario "Diseñadora" con permisos limitados similares a "Vista general" pero con restricciones específicas.

## Cambios Realizados

### Frontend

#### 1. **src/types.ts**
- Agregado nuevo rol `DISEÑADORA = 'diseñadora'` al enum `UserRole`

#### 2. **src/components/HomeView/DiseñadoraLayout.tsx** (Nuevo archivo)
- Creado nuevo layout específico para usuarios Diseñadora
- Muestra solo 4 opciones de navegación:
  - Inventario
  - Pedidos
  - Control de Despachos
  - Fechas de Entrega

#### 3. **src/views/HomeView.tsx**
- Importado `DiseñadoraLayout`
- Agregada lógica para renderizar `DiseñadoraLayout` cuando el rol es `DISEÑADORA`

#### 4. **src/views/App.tsx**
- Importados `DispatchControlView` y `DeliveryDatesView`
- Agregadas restricciones de acceso para Diseñadora en los siguientes casos:
  - `reception`: No puede acceder
  - `dispatch`: No puede acceder
  - `settle`: No puede acceder
  - `orderHistory`: No puede acceder
  - `reports`: No puede acceder
  - `salesReport`: No puede acceder
- Actualizado el menú lateral para mostrar solo las opciones permitidas según el rol
- Agregados casos para `dispatchControl` y `deliveryDates`

#### 5. **src/utils/permissions.ts**
- Agregada función `isDiseñadora()` para verificar si un usuario es Diseñadora
- Actualizada función `getPermissionLevel()` para retornar 'LIMITED' para Diseñadora

### Backend

#### 1. **backend/src/utils/permissions.js**
- Agregada función `isDiseñadora()` para verificar si un usuario es Diseñadora
- Actualizada función `canAccessSection()` para permitir acceso limitado a Diseñadora:
  - Puede acceder a: inventory, orders, dispatch-control, delivery-dates
  - No puede acceder a: dashboard, maestras, user-management
- Actualizada función `getPermissionLevel()` para retornar 'LIMITED' para Diseñadora
- Exportada nueva función `isDiseñadora`

## Permisos del Rol Diseñadora

### Vistas Permitidas:
✅ Inventario
✅ Pedidos
✅ Fechas de Entrega

### Vistas NO Permitidas:
❌ Recepción de Lotes
❌ Devolución de Mercancía
❌ Despachos
❌ Asentar Ventas
❌ Informe de Ventas
❌ Historial de Pedidos
❌ Control de Despachos
❌ Reportes Generales
❌ Maestros (solo Admin)
❌ Backups (solo Admin)

### Permisos de Edición:
- Como "Vista general", Diseñadora **NO puede editar** ningún dato
- Solo puede **ver** la información

## Cómo Crear un Usuario Diseñadora

1. Ir a Maestros (solo Admin)
2. Crear nuevo usuario
3. Seleccionar rol: **diseñadora**
4. El usuario tendrá acceso limitado a las 4 vistas permitidas

## Notas Técnicas

- El rol se almacena en la base de datos como `'diseñadora'` (minúsculas)
- El frontend valida el rol en múltiples niveles (HomeView, App.tsx, permisos)
- El backend también valida los permisos en `permissions.js`
- El menú lateral se adapta dinámicamente según el rol del usuario
- Las restricciones se aplican tanto en el frontend como en el backend
