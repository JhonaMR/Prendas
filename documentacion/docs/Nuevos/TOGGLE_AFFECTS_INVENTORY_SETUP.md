# Toggle "Afecta Inventario" - Guía de Implementación

## 📋 Resumen de Cambios

Se ha implementado un toggle que permite controlar si una recepción impacta o no el inventario. Esto es útil cuando tienes prendas que se dividen en múltiples recepciones (ej: un trío donde cada parte va a un confeccionista diferente).

## 🔧 Cambios Realizados

### 1. **Base de Datos**
- Nueva columna `affects_inventory` en tabla `receptions`
- Tipo: BOOLEAN
- Valor por defecto: TRUE (todas las recepciones existentes seguirán afectando inventario)

### 2. **Backend**
- `ReceptionService.js`: Actualizado para manejar el nuevo campo
- `movementsController.js`: Actualizado para recibir y enviar `affectsInventory`

### 3. **Frontend**
- `types.ts`: Agregado campo `affectsInventory?: boolean` a `BatchReception`
- `ReceptionView.tsx`: 
  - Nuevo checkbox para controlar el toggle
  - Indicador visual en la tabla de recepciones
  - Editable después de crear la recepción

## 🚀 Pasos para Aplicar

### Paso 1: Ejecutar la Migración de Base de Datos

Ejecuta el script de migración para agregar la columna a tu base de datos:

```bash
cd Prendas/backend
node scripts/migrate-affects-inventory.js
```

**Alternativa manual (si prefieres SQL directo):**
```sql
ALTER TABLE public.receptions
ADD COLUMN affects_inventory BOOLEAN DEFAULT TRUE;
```

### Paso 2: Reiniciar el Backend

```bash
# Si usas PM2
pm2 restart all

# O si ejecutas manualmente
npm start
```

### Paso 3: Actualizar el Frontend

El frontend ya está actualizado. Solo necesitas recargar la aplicación en el navegador.

## 📖 Cómo Usar

### Crear una Recepción

1. Haz clic en "INICIAR CONTEO"
2. Completa los datos normales (confeccionista, remisión, items, etc.)
3. **NUEVO**: Verás una sección "Impacto en Inventario" con un checkbox
   - ✅ Activado (por defecto): La recepción carga al inventario
   - ❌ Desactivado: La recepción NO carga al inventario

### Editar una Recepción

1. Haz clic en el botón "Editar" en la recepción
2. Puedes cambiar el estado del toggle en cualquier momento
3. Guarda los cambios

### Ver el Estado

En la tabla de recepciones, verás un indicador naranja si la recepción NO afecta inventario:
- 🟠 "No Afecta Inv." - Esta recepción no impacta el inventario

## 💡 Caso de Uso Ejemplo

**Escenario**: Tienes un trío (blusa, top, falda) que es UNA referencia pero se envía a 3 confeccionistas diferentes.

**Solución**:
1. Recepción 1 (Blusa - 100 ud): ✅ Afecta Inventario
2. Recepción 2 (Top - 100 ud): ❌ NO Afecta Inventario
3. Recepción 3 (Falda - 100 ud): ❌ NO Afecta Inventario

**Resultado**: El inventario solo suma 100 unidades (de la recepción 1), no 300.

## 🔍 Verificación

Para verificar que todo funciona correctamente:

1. Crea una recepción con `affectsInventory = true`
2. Crea otra recepción con `affectsInventory = false`
3. Verifica en la tabla que se muestre el indicador "No Afecta Inv." en la segunda

## 📝 Notas Técnicas

- El campo `affects_inventory` es **editable** después de crear la recepción
- Todas las recepciones existentes tendrán `affects_inventory = TRUE` por defecto
- El toggle se guarda en la base de datos y persiste entre sesiones
- La lógica de cálculo de inventario debe implementarse en el módulo de reportes/kardex

## ⚠️ Próximos Pasos

Para que el toggle tenga efecto real en el inventario, necesitas:

1. **Actualizar la lógica de cálculo de inventario** en el módulo de reportes
   - Filtrar solo recepciones donde `affects_inventory = true`
   - Esto probablemente está en `ReportsView.tsx` o un servicio de inventario

2. **Ejemplo de filtrado** (pseudocódigo):
```javascript
const inventoryByReference = {};
state.receptions
  .filter(r => r.affectsInventory !== false)  // ← Agregar este filtro
  .forEach(r => {
    r.items.forEach(item => {
      inventoryByReference[item.reference] = 
        (inventoryByReference[item.reference] || 0) + item.quantity;
    });
  });
```

## 🆘 Troubleshooting

**P: La columna no se agregó a la base de datos**
R: Ejecuta manualmente el SQL en tu cliente PostgreSQL

**P: El toggle no aparece en la UI**
R: Limpia el caché del navegador (Ctrl+Shift+Delete) y recarga

**P: Las recepciones antiguas no tienen el campo**
R: Todas las recepciones existentes tendrán `affects_inventory = TRUE` por defecto

---

¿Necesitas ayuda con la implementación de la lógica de inventario?
