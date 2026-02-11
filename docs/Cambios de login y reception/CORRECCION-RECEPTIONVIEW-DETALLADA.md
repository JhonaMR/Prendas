# CORRECCIÓN ESPECÍFICA PARA ReceptionView.tsx

## 📍 UBICACIÓN: src/views/ReceptionView.tsx

---

## 🔧 CAMBIO 1: Interfaz de Props (Línea 7-13)

**Reemplaza esto:**
```typescript
interface ReceptionViewProps {
  user: User;
  receptions: BatchReception[];
  updateState: (updater: (prev: AppState) => AppState) => void;
  referencesMaster: Reference[];
  confeccionistasMaster?: Confeccionista[];
}
```

**Con esto:**
```typescript
interface ReceptionViewProps {
  user: User;
  receptions: BatchReception[];
  updateState: (updater: (prev: AppState) => AppState) => void;
  referencesMaster: Reference[];
  confeccionistasMaster?: Confeccionista[];
  onAddReception?: (reception: any) => Promise<any>;  // ← LÍNEA NUEVA
}
```

---

## 🔧 CAMBIO 2: Componente (Línea 15)

**Reemplaza esto:**
```typescript
const ReceptionView: React.FC<ReceptionViewProps> = ({ user, receptions, updateState, referencesMaster, confeccionistasMaster = [] }) => {
```

**Con esto:**
```typescript
const ReceptionView: React.FC<ReceptionViewProps> = ({ user, receptions, updateState, referencesMaster, confeccionistasMaster = [], onAddReception }) => {
```

---

## 🔧 CAMBIO 3: Función handleSave (Líneas 89-120)

**Reemplaza TODA la función handleSave (desde línea 89 hasta línea 120):**

**ANTES:**
```typescript
const handleSave = () => {
  if (!confeccionista || !batchCode) {
    alert("Nombre de Confeccionista y Remisión son obligatorios");
    return;
  }
  if (chargeType && chargeUnits <= 0) {
    alert(`Debe especificar unidades para ${chargeType}`);
    return;
  }

  const data: BatchReception = {
    id: editingLot ? editingLot.id : Math.random().toString(36).substr(2, 9),
    batchCode,
    confeccionista,
    hasSeconds,
    chargeType,
    chargeUnits,
    items,
    receivedBy: editingLot ? editingLot.receivedBy : user.name,
    createdAt: editingLot ? editingLot.createdAt : new Date().toLocaleString(),
    editLogs: editingLot ? [...editingLot.editLogs, { user: user.name, date: new Date().toLocaleString() }] : []
  };

  updateState(prev => ({
    ...prev,
    receptions: editingLot 
      ? prev.receptions.map(r => r.id === data.id ? data : r)
      : [data, ...prev.receptions]
  }));

  setIsCounting(false);
};
```

**DESPUÉS:**
```typescript
const handleSave = async () => {  // ← AGREGAR async
  if (!confeccionista || !batchCode) {
    alert("Nombre de Confeccionista y Remisión son obligatorios");
    return;
  }
  if (chargeType && chargeUnits <= 0) {
    alert(`Debe especificar unidades para ${chargeType}`);
    return;
  }

  const data: BatchReception = {
    id: editingLot ? editingLot.id : Math.random().toString(36).substr(2, 9),
    batchCode,
    confeccionista,
    hasSeconds,
    chargeType,
    chargeUnits,
    items,
    receivedBy: editingLot ? editingLot.receivedBy : user.name,
    createdAt: editingLot ? editingLot.createdAt : new Date().toISOString(),  // ← CAMBIAR toLocaleString() a toISOString()
    editLogs: editingLot ? [...editingLot.editLogs, { user: user.name, date: new Date().toISOString() }] : []  // ← CAMBIAR toLocaleString() a toISOString()
  };

  // ========== GUARDAR EN BACKEND ==========
  if (onAddReception) {
    try {
      console.log('📤 Enviando recepción al backend:', data);
      const result = await onAddReception(data);
      
      if (result && result.success) {
        console.log('✅ Recepción guardada en BD exitosamente');
        
        // También actualizar estado local para actualizar la UI inmediatamente
        updateState(prev => ({
          ...prev,
          receptions: editingLot 
            ? prev.receptions.map(r => r.id === data.id ? data : r)
            : [data, ...prev.receptions]
        }));
        
        setIsCounting(false);
      } else {
        console.error('❌ Error al guardar:', result);
        alert('Error al guardar: ' + (result.message || 'Error desconocido'));
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      alert('Error de conexión con el servidor. Verifica que el backend esté corriendo.');
    }
  } else {
    // Fallback: Si no hay función del backend (no debería pasar)
    console.warn('⚠️ onAddReception no está definido. Guardando solo en estado local (se perderá al refrescar)');
    
    updateState(prev => ({
      ...prev,
      receptions: editingLot 
        ? prev.receptions.map(r => r.id === data.id ? data : r)
        : [data, ...prev.receptions]
    }));
    
    setIsCounting(false);
    alert('⚠️ ADVERTENCIA: La recepción se guardó solo en memoria. Se perderá al refrescar.');
  }
};
```

---

## ✅ VERIFICACIÓN

Después de hacer los cambios:

1. **Guarda el archivo** (Ctrl+S)

2. **Verifica que no hay errores de compilación:**
   - El servidor de Vite debería recompilar automáticamente
   - Revisa la terminal, no debe haber errores rojos

3. **Prueba crear una recepción:**
   - Ve a Recepción
   - Click en "Nueva Recepción"
   - Llena los datos
   - Click en "Guardar Recepción"

4. **Verifica en consola del navegador (F12):**
   - Deberías ver: `📤 Enviando recepción al backend:`
   - Luego: `✅ Recepción guardada en BD exitosamente`

5. **Refresca la página (F5):**
   - La recepción debería seguir ahí
   - Si desaparece, el problema está en App.tsx (no pasa onAddReception)

---

## 🚨 SI LA RECEPCIÓN SIGUE DESAPARECIENDO

Verifica en `App.tsx` que el caso 'reception' tenga esto:

```typescript
case 'reception':
  return (
    <ReceptionView 
      user={user} 
      receptions={state.receptions} 
      confeccionistasMaster={state.confeccionistas} 
      updateState={updateState} 
      referencesMaster={state.references}
      onAddReception={addReception}  // ← ESTA LÍNEA DEBE EXISTIR
    />
  );
```

Si falta `onAddReception={addReception}`, agrégala.

---

## 🎯 RESUMEN

**3 cambios necesarios:**
1. ✅ Agregar `onAddReception` a la interfaz
2. ✅ Agregar `onAddReception` al desestructuring de props
3. ✅ Reemplazar función `handleSave` completa

**Resultado esperado:**
- ✅ Recepciones se guardan en BD
- ✅ Persisten al refrescar
- ✅ Logs en consola confirman guardado

---

¿Tienes dudas sobre algún paso?
