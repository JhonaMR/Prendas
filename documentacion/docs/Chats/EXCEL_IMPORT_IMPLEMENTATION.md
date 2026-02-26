# 📊 IMPLEMENTACIÓN: IMPORTACIÓN DE PEDIDOS DESDE EXCEL

## ✅ Cambios Realizados

### 1. Vista Modificada: `OrderSettleView.tsx`

#### Cambios Principales:

**Importaciones:**
- Agregada librería `xlsx` para leer archivos Excel

**Estados Nuevos:**
- `invalidReferences` - Almacena referencias no encontradas
- `excelLoaded` - Indica si se cargó un Excel

**Función `handleFileUpload` - Completamente Reescrita:**

```typescript
// Ahora lee archivos Excel en lugar de CSV
// Extrae datos de celdas específicas:
// - M4: Número de pedido
// - N9: Código del cliente
// - Filas 20+: Items (B=ref, L=cantidad, M=precio)

// Validaciones:
// 1. Cliente debe existir (si no, muestra error y se detiene)
// 2. Referencias se validan (si no existen, se agregan a avisos)
// 3. Lee hasta encontrar 2 filas vacías seguidas
```

**Cambios en la UI:**

1. **Sección "1. Datos del Pedido":**
   - Cliente: Ahora editable (se lee del Excel pero puede cambiar)
   - Número de pedido: Ahora editable (se lee del Excel pero puede cambiar)
   - Vendedor: Selector (igual que antes)
   - Campaña: Selector (igual que antes)

2. **Sección "2. Adjuntar Pedido":**
   - Cambio de CSV a Excel
   - Texto actualizado con instrucciones
   - Botón "CARGAR ARCHIVO" → "CARGAR EXCEL"
   - Botón descarga ejemplo ahora descarga `.xlsx`

3. **Sección "3. Vista Previa":**
   - Agregada sección de avisos para referencias inválidas
   - Muestra en amarillo las referencias que no se encontraron
   - Tabla solo muestra items válidos
   - Totales calculados solo con items válidos

---

## 📋 Flujo de Funcionamiento

### Paso 1: Cargar Excel
```
Usuario carga archivo .xlsx
        ↓
Sistema lee celdas:
  • M4 = Número de pedido
  • N9 = Código cliente
  • Filas 20+ = Items
```

### Paso 2: Validar Cliente
```
¿Cliente existe?
  ├─ NO → Muestra error y se detiene
  └─ SÍ → Continúa
```

### Paso 3: Leer Items
```
Para cada fila desde 20:
  • Lee referencia (B), cantidad (L), precio (M)
  • ¿Referencia existe?
    ├─ SÍ → Agrega a items válidos
    └─ NO → Agrega a avisos de inválidas
  • ¿Dos filas vacías seguidas?
    └─ SÍ → Detiene lectura
```

### Paso 4: Mostrar Preview
```
Muestra:
  • Cliente (editable)
  • Número pedido (editable)
  • Avisos de referencias inválidas (si hay)
  • Tabla con items válidos
  • Totales
```

### Paso 5: Seleccionar y Guardar
```
Usuario:
  1. Puede cambiar cliente si quiere
  2. Puede cambiar número de pedido si quiere
  3. Selecciona vendedor
  4. Selecciona campaña
  5. Hace clic "ASENTAR VENTA"
```

---

## 🎯 Características Implementadas

✅ **Lectura de Excel:**
- Extrae datos de celdas específicas (M4, N9)
- Lee items desde fila 20 hasta encontrar filas vacías
- Soporta archivos .xlsx y .xls

✅ **Validaciones:**
- Cliente debe existir (si no, error y se detiene)
- Referencias se validan (si no existen, se muestran avisos)
- Cantidades deben ser números enteros
- Precios se leen del Excel (no de la BD)

✅ **Edición:**
- Cliente es editable (se lee del Excel pero puede cambiar)
- Número de pedido es editable (se lee del Excel pero puede cambiar)
- Vendedor y campaña se seleccionan manualmente

✅ **Avisos:**
- Sección separada para referencias no encontradas
- Muestra referencia y razón del error
- No detiene el proceso, solo avisa

✅ **Interfaz:**
- Mantiene el estilo visual actual
- Cambios mínimos en la estructura
- Instrucciones actualizadas

---

## 📁 Archivos Modificados

### `Prendas/src/views/OrderSettleView.tsx`
- Importación de `xlsx`
- Nuevos estados: `invalidReferences`, `excelLoaded`
- Función `handleFileUpload` completamente reescrita
- UI actualizada con avisos de referencias inválidas
- Instrucciones actualizadas

### `Prendas/public/ejemplo_pedidos.xlsx` (Nuevo)
- Archivo Excel de ejemplo
- Contiene estructura correcta
- Datos de ejemplo para pruebas
- Descargable desde la vista

---

## 🧪 Cómo Probar

### 1. Descargar Ejemplo
- Hacer clic en "DESCARGAR EJEMPLO"
- Se descarga `ejemplo_pedidos.xlsx`

### 2. Cargar Excel
- Hacer clic en "CARGAR EXCEL"
- Seleccionar el archivo descargado

### 3. Verificar Lectura
- Sistema debe mostrar:
  - Cliente: "081 - MODATEXTIL DEL CARIBE S.A.S."
  - Número de pedido: "9"
  - 5 items en la tabla
  - Totales correctos

### 4. Editar (Opcional)
- Cambiar cliente si quiere
- Cambiar número de pedido si quiere

### 5. Completar Pedido
- Seleccionar vendedor
- Seleccionar campaña
- Hacer clic "ASENTAR VENTA"

---

## ⚠️ Casos de Error

### Cliente no existe
```
❌ Cliente 999 no existe en la base de datos.
Verifique el código o ingrese el nuevo cliente.
```
→ Se detiene la lectura

### Referencia no existe
```
⚠️ REFERENCIAS NO ENCONTRADAS
• 12999 (No existe en la base de datos)
```
→ Se muestra aviso pero continúa

### Archivo inválido
```
❌ Error al leer el archivo Excel. 
Verifique que sea un archivo válido.
```
→ Se muestra error

---

## 📊 Estructura del Excel Esperado

```
Celda M4: Número de pedido (ej: 9)
Celda N9: Código cliente (ej: 081)

Fila 20+:
  Columna B: Referencia (ej: 12366)
  Columna L: Cantidad (ej: 24)
  Columna M: Precio (ej: 19900)

Lectura se detiene cuando encuentra 2 filas vacías seguidas
```

---

## 🔄 Cambios Visuales

### Antes
```
┌─────────────────────────────────┐
│ 1. Datos del Pedido             │
│ Buscador Cliente (manual)       │
│ Número de Pedido (manual)       │
│ Vendedor (selector)             │
│ Campaña (selector)              │
│                                 │
│ 2. Adjuntar Pedido              │
│ Formato CSV                     │
│ [CARGAR ARCHIVO]                │
└─────────────────────────────────┘
```

### Después
```
┌─────────────────────────────────┐
│ 1. Datos del Pedido             │
│ Buscador Cliente (leído Excel)  │ ← Editable
│ Número de Pedido (leído Excel)  │ ← Editable
│ Vendedor (selector)             │
│ Campaña (selector)              │
│                                 │
│ 2. Adjuntar Pedido              │
│ Formato Excel                   │
│ [CARGAR EXCEL]                  │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Vista Previa                    │
│ ⚠️ Referencias No Encontradas   │ ← Nuevo
│ • 12999 (no existe)             │
│                                 │
│ Tabla de Items                  │
│ ...                             │
└─────────────────────────────────┘
```

---

## 🚀 Próximos Pasos (Opcional)

1. **Crear plantilla Excel mejorada:**
   - Con más información
   - Con validaciones
   - Con formato profesional

2. **Agregar más validaciones:**
   - Validar que cantidades sean positivas
   - Validar que precios sean positivos
   - Validar formato de celdas

3. **Mejorar avisos:**
   - Mostrar más detalles del error
   - Permitir descargar reporte de errores
   - Sugerir correcciones

4. **Agregar historial:**
   - Guardar archivos cargados (opcional)
   - Mostrar historial de importaciones
   - Permitir recargar importaciones anteriores

---

## 📝 Notas Técnicas

- **Librería:** `xlsx` (ya instalada)
- **Formato:** Soporta .xlsx y .xls
- **Lectura:** Basada en celdas específicas (no en posición de filas)
- **Validación:** Cliente es obligatorio, referencias son opcionales
- **Performance:** Lectura rápida incluso con muchos items

---

## ✅ Checklist de Verificación

- [x] Vista modificada correctamente
- [x] Lectura de Excel implementada
- [x] Validación de cliente implementada
- [x] Avisos de referencias inválidas implementados
- [x] Campos editables funcionan
- [x] Archivo de ejemplo creado
- [x] Instrucciones actualizadas
- [x] Sin errores de compilación
- [x] Interfaz mantiene estilo visual

---

**Implementación completada:** 25 de Febrero de 2026  
**Estado:** ✅ Listo para usar
