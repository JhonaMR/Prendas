# 📊 Actualizar Lógica de Cálculo de Inventario

## 🎯 Objetivo

Hacer que el cálculo de inventario **solo cuente recepciones donde `affectsInventory = true`**.

---

## 🔍 Dónde Está la Lógica de Inventario

La lógica de cálculo de inventario probablemente está en:

### Opción 1: `ReportsView.tsx` (Más probable)
Archivo: `Prendas/src/views/ReportsView.tsx`
Línea: ~29 (en la función `kardexData`)

### Opción 2: Servicio de Inventario
Si existe un servicio dedicado, busca archivos con nombres como:
- `InventoryService.js`
- `KardexService.js`
- `StockService.js`

---

## 🔧 Cómo Actualizar

### Paso 1: Localizar el Código

Busca en `ReportsView.tsx` algo como:

```javascript
const kardexData = useMemo(() => {
  const data: Record<string, { in: number, out: number, av: number, lots: number }> = {};
  state.receptions.forEach(r => {
    // ... código que suma recepciones
  });
  // ...
}, [state.receptions, state.dispatches]);
```

### Paso 2: Agregar el Filtro

Cambia:
```javascript
state.receptions.forEach(r => {
```

Por:
```javascript
state.receptions
  .filter(r => r.affectsInventory !== false)  // ← AGREGAR ESTA LÍNEA
  .forEach(r => {
```

### Paso 3: Buscar Otros Lugares

Busca en todo el proyecto por "state.receptions" para encontrar otros lugares donde se calcula inventario:

```bash
# En la terminal, desde Prendas/
grep -r "state\.receptions" src/ --include="*.tsx" --include="*.ts"
```

Lugares comunes:
- Cálculo de totales
- Reportes
- Kardex
- Dashboards
- Gráficos

---

## 📝 Ejemplo Completo

### ANTES (Sin filtro):
```javascript
const kardexData = useMemo(() => {
  const data: Record<string, { in: number, out: number, av: number, lots: number }> = {};
  
  state.receptions.forEach(r => {
    const uniqueRefsInThisBatch = new Set<string>();
    r.items.forEach(i => {
      if (!data[i.reference]) {
        data[i.reference] = { in: 0, out: 0, av: 0, lots: 0 };
      }
      data[i.reference].in += i.quantity;
      uniqueRefsInThisBatch.add(i.reference);
    });
    uniqueRefsInThisBatch.forEach(ref => {
      data[ref].lots += 1;
    });
  });
  
  return data;
}, [state.receptions, state.dispatches]);
```

### DESPUÉS (Con filtro):
```javascript
const kardexData = useMemo(() => {
  const data: Record<string, { in: number, out: number, av: number, lots: number }> = {};
  
  state.receptions
    .filter(r => r.affectsInventory !== false)  // ← AGREGAR ESTA LÍNEA
    .forEach(r => {
      const uniqueRefsInThisBatch = new Set<string>();
      r.items.forEach(i => {
        if (!data[i.reference]) {
          data[i.reference] = { in: 0, out: 0, av: 0, lots: 0 };
        }
        data[i.reference].in += i.quantity;
        uniqueRefsInThisBatch.add(i.reference);
      });
      uniqueRefsInThisBatch.forEach(ref => {
        data[ref].lots += 1;
      });
    });
  
  return data;
}, [state.receptions, state.dispatches]);
```

---

## 🔎 Búsqueda Avanzada

Si necesitas encontrar todos los lugares donde se usa `state.receptions`:

### En Windows (PowerShell):
```powershell
Get-ChildItem -Path "Prendas/src" -Recurse -Include "*.tsx", "*.ts" | 
  Select-String "state\.receptions" | 
  Select-Object Path, LineNumber, Line
```

### En Mac/Linux:
```bash
grep -rn "state\.receptions" Prendas/src/ --include="*.tsx" --include="*.ts"
```

---

## ✅ Verificación

Después de hacer los cambios:

1. **Crea 3 recepciones de prueba**:
   - Recepción A: 100 unidades, `affectsInventory = true`
   - Recepción B: 100 unidades, `affectsInventory = false`
   - Recepción C: 100 unidades, `affectsInventory = true`

2. **Verifica el inventario**:
   - Debe mostrar 200 unidades (A + C)
   - NO debe contar B (100 unidades)

3. **Edita Recepción B**:
   - Cambia `affectsInventory` a `true`
   - Verifica que el inventario ahora muestre 300 unidades

---

## 🚨 Casos Especiales

### Caso 1: Múltiples Lugares de Cálculo

Si hay múltiples funciones que calculan inventario, necesitas actualizar TODAS:

```javascript
// Buscar por:
// - "receptions.forEach"
// - "receptions.map"
// - "receptions.reduce"
// - "receptions.filter"
// - "receptions.some"
// - "receptions.every"
```

### Caso 2: Cálculo en Backend

Si el cálculo se hace en el backend (menos probable), busca en:
- `Prendas/backend/src/services/`
- `Prendas/backend/src/controllers/`

Y aplica el mismo filtro en JavaScript/Node.js:
```javascript
receptions.filter(r => r.affects_inventory !== false)
```

---

## 📋 Checklist

- [ ] Localicé el código de cálculo de inventario
- [ ] Agregué el filtro `.filter(r => r.affectsInventory !== false)`
- [ ] Busqué otros lugares donde se usa `state.receptions`
- [ ] Actualicé todos los lugares encontrados
- [ ] Probé con recepciones de prueba
- [ ] Verifiqué que el inventario es correcto

---

## 💡 Tip

Si tienes dudas sobre dónde está el cálculo, busca por:
- "kardex"
- "inventory"
- "stock"
- "cantidad"
- "total"

En archivos `.tsx` y `.ts`.

---

**Necesitas ayuda?** Revisa `TOGGLE_AFFECTS_INVENTORY_SETUP.md` para más contexto.
