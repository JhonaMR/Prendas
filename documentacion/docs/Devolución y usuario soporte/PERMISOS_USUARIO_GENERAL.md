# 📋 PERMISOS DEL USUARIO TIPO "GENERAL"

## Resumen Ejecutivo
El usuario tipo **GENERAL** tiene acceso **LIMITADO** a la mayoría de las vistas del sistema. Su nivel de permiso es **"LIMITED"** (según `getPermissionLevel()`).

---

## 🔐 Matriz de Permisos por Vista

### 1. **RECEPCIÓN DE LOTES** ✅ ACCESO COMPLETO
- **Lectura**: ✅ Sí
- **Crear**: ✅ Sí (puede iniciar conteos)
- **Editar**: ❌ No (solo ADMIN)
- **Eliminar**: ❌ No (solo ADMIN)
- **Detalles**: Puede registrar lotes de confeccionistas, indicar si tienen segundas, registrar cobros

---

### 2. **DEVOLUCIÓN DE MERCANCÍA** ✅ ACCESO COMPLETO
- **Lectura**: ✅ Sí
- **Crear**: ✅ Sí (puede registrar devoluciones)
- **Editar**: ❌ No (solo ADMIN)
- **Eliminar**: ❌ No (solo ADMIN)
- **Detalles**: Puede registrar devoluciones de clientes

---

### 3. **DESPACHOS** ✅ ACCESO COMPLETO
- **Lectura**: ✅ Sí (puede ver historial de despachos)
- **Crear**: ✅ Sí (puede crear nuevos despachos)
- **Editar**: ❌ No (solo ADMIN)
- **Eliminar**: ❌ No (solo ADMIN)
- **Detalles**: Puede registrar salida de mercancía a clientes y ver historial

---

### 4. **INVENTARIO** ✅ ACCESO COMPLETO (LECTURA)
- **Lectura**: ✅ Sí (puede ver stock disponible)
- **Crear**: ❌ No
- **Editar**: ❌ No
- **Eliminar**: ❌ No
- **Generar Reportes**: ❌ No (solo ADMIN y OBSERVER)
- **Detalles**: Vista de solo lectura del inventario de producto terminado e insumos

---

### 5. **PEDIDOS** ✅ ACCESO COMPLETO (LECTURA)
- **Lectura**: ✅ Sí (puede ver tabla de ventas y producción)
- **Crear**: ❌ No
- **Editar**: ❌ No (solo ADMIN)
- **Eliminar**: ❌ No
- **Guardar Cambios**: ❌ No (solo ADMIN)
- **Detalles**: Vista de solo lectura de ventas, producción, stock, telas

---

### 6. **ASENTAR VENTAS** ✅ ACCESO COMPLETO
- **Lectura**: ✅ Sí
- **Crear**: ✅ Sí (puede registrar ventas)
- **Editar**: ❌ No (solo ADMIN)
- **Eliminar**: ❌ No (solo ADMIN)
- **Detalles**: Puede registrar ventas realizadas

---

### 7. **INFORME DE VENTAS** ✅ ACCESO COMPLETO
- **Lectura**: ✅ Sí (puede ver reportes)
- **Crear**: ❌ No
- **Editar**: ❌ No
- **Eliminar**: ❌ No
- **Generar Reportes**: ✅ Sí (puede generar en PDF y Excel)
- **Detalles**: Reporte de ventas por período con opción de generar informes

---

### 8. **HISTORIAL DE PEDIDOS** ✅ ACCESO COMPLETO (LECTURA)
- **Lectura**: ✅ Sí
- **Crear**: ❌ No
- **Editar**: ❌ No
- **Eliminar**: ❌ No
- **Detalles**: Consulta histórica de pedidos

---

### 9. **CONTROL DE DESPACHOS** ✅ ACCESO COMPLETO
- **Lectura**: ✅ Sí (puede ver despachos)
- **Crear**: ❌ No (no puede crear desde aquí)
- **Editar**: ❌ No
- **Eliminar**: ❌ No
- **Generar Despachos**: ✅ Sí (puede generar despachos desde esta vista)
- **Detalles**: Control y seguimiento de despachos realizados, con capacidad de generar nuevos despachos

---

### 10. **FECHAS DE ENTREGA** ✅ ACCESO COMPLETO
- **Lectura**: ✅ Sí
- **Crear**: ✅ Sí (puede crear/importar fechas)
- **Editar**: ❌ No (solo ADMIN)
- **Eliminar**: ❌ No (solo ADMIN)
- **Detalles**: Gestión de fechas de entrega

---

### 11. **REPORTES GENERALES** ✅ ACCESO COMPLETO (LECTURA)
- **Lectura**: ✅ Sí
- **Crear**: ❌ No
- **Editar**: ❌ No
- **Eliminar**: ❌ No
- **Detalles**: Reportes del sistema

---

### 12. **MAESTROS** ⚠️ ACCESO LIMITADO
- **Lectura**: ✅ Sí (puede ver listados)
- **Crear**: ❌ No
- **Editar**: ❌ No
- **Eliminar**: ❌ No
- **Detalles**: 
  - ❌ NO puede crear/editar/eliminar clientes
  - ❌ NO puede crear/editar/eliminar confeccionistas
  - ❌ NO puede crear/editar/eliminar referencias
  - ❌ NO puede crear/editar/eliminar vendedores
  - ❌ NO puede crear/editar/eliminar correrías
  - ❌ NO puede crear/editar/eliminar usuarios
  - ❌ NO puede importar datos masivos

---

### 13. **COMPRAS** ✅ ACCESO COMPLETO
- **Lectura**: ✅ Sí
- **Crear**: ✅ Sí (puede registrar compras de insumos)
- **Editar**: ❌ No (solo ADMIN)
- **Eliminar**: ❌ No (solo ADMIN)
- **Detalles**: Registro de compras de materias primas

---

### 14. **FICHAS DE DISEÑO** ✅ ACCESO COMPLETO (LECTURA)
- **Lectura**: ✅ Sí (solo lectura)
- **Crear**: ❌ No
- **Editar**: ❌ No
- **Eliminar**: ❌ No
- **Detalles**: Visualización de fichas de diseño

---

### 15. **FICHAS DE COSTO** ✅ ACCESO COMPLETO
- **Lectura**: ✅ Sí
- **Crear**: ✅ Sí (puede gestionar precios y costos)
- **Editar**: ✅ Sí
- **Eliminar**: ❌ No (solo ADMIN)
- **Detalles**: Gestión de precios y costos

---

### 16. **DASHBOARD** ❌ SIN ACCESO
- **Acceso**: ❌ No
- **Razón**: Solo ADMIN y OBSERVER pueden acceder
- **Detalles**: El usuario general no ve el dashboard

---

### 17. **GESTIÓN DE USUARIOS** ❌ SIN ACCESO
- **Acceso**: ❌ No
- **Razón**: Solo ADMIN puede acceder
- **Detalles**: No puede crear, editar o eliminar usuarios

---

## 📊 Resumen de Permisos

| Acción | Permiso |
|--------|---------|
| **Crear** | ✅ Sí (en vistas específicas) |
| **Leer** | ✅ Sí (en casi todas las vistas) |
| **Editar** | ❌ No (excepto fichas de costo) |
| **Eliminar** | ❌ No |
| **Guardar cambios en tablas** | ❌ No |
| **Generar reportes** | ❌ No |
| **Acceder a Maestros** | ⚠️ Solo lectura |
| **Acceder a Dashboard** | ❌ No |

---

## 🎯 Vistas Disponibles para Usuario General

El usuario general puede acceder a estas 15 vistas desde el menú principal:

1. ✅ Recepción de Lotes
2. ✅ Devolución de Mercancía
3. ✅ Despachos (+ ver historial)
4. ✅ Inventario
5. ✅ Pedidos
6. ✅ Asentar Ventas
7. ✅ Informe de Ventas (+ generar reportes)
8. ✅ Historial de Pedidos
9. ✅ Control de Despachos (+ generar despachos)
10. ✅ Fechas de Entrega
11. ✅ Reportes Generales
12. ⚠️ Maestros (solo lectura)
13. ✅ Compras
14. ✅ Fichas de Diseño (solo lectura)
15. ✅ Fichas de Costo

---

## 🔒 Restricciones Clave

### Operaciones Bloqueadas para General:
1. **No puede editar** lotes de recepción después de crearlos
2. **No puede eliminar** despachos
3. **No puede modificar** datos maestros (clientes, referencias, etc.)
4. **No puede guardar cambios** en la tabla de producción (Pedidos)
5. **No puede acceder** al Dashboard
6. **No puede gestionar** usuarios
7. **No puede importar** datos masivos

### Operaciones Permitidas para General:
1. ✅ Crear recepciones
2. ✅ Crear despachos
3. ✅ Crear devoluciones
4. ✅ Registrar ventas
5. ✅ Crear compras
6. ✅ Gestionar fichas de costo
7. ✅ Importar fechas de entrega
8. ✅ Ver inventario
9. ✅ Ver reportes
10. ✅ Generar reportes de ventas (PDF/Excel)
11. ✅ Generar despachos desde Control de Despachos
12. ✅ Ver historial de despachos

---

## 🔄 Comparación con Otros Roles

| Permiso | General | Observer | Diseñadora | Admin |
|---------|---------|----------|-----------|-------|
| Crear | ⚠️ Limitado | ❌ No | ⚠️ Limitado | ✅ Sí |
| Leer | ✅ Sí | ✅ Sí | ⚠️ Limitado | ✅ Sí |
| Editar | ❌ No | ❌ No | ⚠️ Limitado | ✅ Sí |
| Eliminar | ❌ No | ❌ No | ❌ No | ✅ Sí |
| Dashboard | ❌ No | ✅ Sí | ❌ No | ✅ Sí |
| Maestros | ❌ No | ❌ No | ❌ No | ✅ Sí |
| Usuarios | ❌ No | ❌ No | ❌ No | ✅ Sí |

---

## 📝 Notas Importantes

1. **Nivel de Permiso**: El usuario general tiene nivel **"LIMITED"** según la función `getPermissionLevel()`
2. **Funciones de Validación**: 
   - `canEdit(user)` → Retorna `false` para general
   - `canCreate(user)` → Retorna `true` para general
   - `canDelete(user)` → Retorna `false` para general
3. **Backend**: Las restricciones se aplican también en el backend mediante middleware `preventNonAdminEdit`
4. **Acceso a Secciones**: El usuario general NO puede acceder a:
   - Dashboard
   - Maestras (user-management)
   - Maestros-usuarios

---

## 🛠️ Implementación Técnica

### Frontend (permissions.ts):
```typescript
export function canEdit(user: User | null): boolean {
  if (!user) return false;
  return user.role === UserRole.ADMIN;  // Solo ADMIN
}

export function canCreate(user: User | null): boolean {
  if (!user) return false;
  return user.role === UserRole.ADMIN || user.role === UserRole.GENERAL;  // ADMIN y GENERAL
}

export function canDelete(user: User | null): boolean {
  if (!user) return false;
  return user.role === UserRole.ADMIN;  // Solo ADMIN
}

export function getPermissionLevel(user: User | null): 'FULL' | 'READ_ONLY' | 'LIMITED' | 'NONE' {
  if (!user) return 'NONE';
  if (user.role === UserRole.ADMIN) return 'FULL';
  if (user.role === UserRole.OBSERVER) return 'READ_ONLY';
  if (user.role === UserRole.GENERAL) return 'LIMITED';  // ← GENERAL = LIMITED
  if (user.role === UserRole.DISEÑADORA) return 'LIMITED';
}
```

### Backend (permissions.js):
```javascript
function canAccessSection(user, section) {
  const role = user.role.toLowerCase().trim();
  
  // General solo puede acceder a secciones limitadas
  if (role === 'general') {
    return section !== 'dashboard' && 
           section !== 'maestras' && 
           section !== 'user-management' &&
           section !== 'maestras-usuarios';
  }
}

function canEdit(user) {
  const role = user.role.toLowerCase().trim();
  return role === 'admin';  // Solo admin puede editar
}

function canCreate(user) {
  const role = user.role.toLowerCase().trim();
  return role === 'admin' || role === 'general';  // Admin y general pueden crear
}
```

---

**Última actualización**: Marzo 2, 2026
