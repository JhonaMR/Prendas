# 📝 GUÍA PASO A PASO - Refactorizar MastersView.tsx

## 🎯 Objetivo

Cambiar `MastersView.tsx` para que use las funciones del backend (`onAddClient`, `onUpdateClient`, etc.) en lugar de `updateState()` directamente.

**Resultado esperado:**
- ✅ Los datos se guardan en la base de datos
- ✅ Los datos persisten al recargar la página
- ✅ Otros usuarios ven los cambios inmediatamente

---

## 📋 PASO 1: Actualizar la interfaz MastersViewProps

### Ubicación
Línea ~6 en `src/views/MastersView.tsx`

### ANTES
```typescript
interface MastersViewProps {
  user: User;
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}
```

### DESPUÉS
```typescript
interface MastersViewProps {
  user: User;
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  // ← AGREGAR ESTAS NUEVAS PROPS
  onAddReference: (ref: any) => Promise<{ success: boolean }>;
  onUpdateReference: (id: string, ref: any) => Promise<{ success: boolean }>;
  onDeleteReference: (id: string) => Promise<{ success: boolean }>;
  onAddClient: (client: any) => Promise<{ success: boolean }>;
  onUpdateClient: (id: string, client: any) => Promise<{ success: boolean }>;
  onDeleteClient: (id: string) => Promise<{ success: boolean }>;
  onAddConfeccionista: (conf: any) => Promise<{ success: boolean }>;
  onUpdateConfeccionista: (id: string, conf: any) => Promise<{ success: boolean }>;
  onDeleteConfeccionista: (id: string) => Promise<{ success: boolean }>;
  onAddSeller: (seller: any) => Promise<{ success: boolean }>;
  onAddCorreria: (correria: any) => Promise<{ success: boolean }>;
}
```

### ✅ Verificación
- [ ] Agregaste todas las props
- [ ] No hay errores de compilación

---

## 📋 PASO 2: Destructurar las nuevas props

### Ubicación
Línea ~12 en `src/views/MastersView.tsx`

### ANTES
```typescript
const MastersView: React.FC<MastersViewProps> = ({ user, state, updateState }) => {
```

### DESPUÉS
```typescript
const MastersView: React.FC<MastersViewProps> = ({ 
  user, 
  state, 
  updateState,
  // ← AGREGAR ESTAS PROPS
  onAddReference,
  onUpdateReference,
  onDeleteReference,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  onAddConfeccionista,
  onUpdateConfeccionista,
  onDeleteConfeccionista,
  onAddSeller,
  onAddCorreria
}) => {
```

### ✅ Verificación
- [ ] Todas las props están destructuradas
- [ ] No hay errores de compilación

---

## 📋 PASO 3: Agregar estado de loading

### Ubicación
Después de `const [editingId, setEditingId] = useState<string | null>(null);` (línea ~48)

### AGREGAR
```typescript
const [isLoading, setIsLoading] = useState(false);
```

### ✅ Verificación
- [ ] Estado `isLoading` agregado
- [ ] No hay errores de compilación

---

## 📋 PASO 4: Cambiar handleSaveClient

### Ubicación
Línea ~130 en `src/views/MastersView.tsx`

### ANTES
```typescript
const handleSaveClient = () => {
  if (!id || !name) return alert("ID y Nombre son obligatorios");
  const newItem: Client = { id, name, address, city, seller };
  updateState(prev => {
    const exists = prev.clients.some(c => c.id === id);
    if (exists && !editingId) { alert("ID ya existe"); return prev; }
    return { ...prev, clients: editingId ? prev.clients.map(c => c.id === editingId ? newItem : c) : [...prev.clients, newItem] };
  });
  resetForms();
};
```

### DESPUÉS
```typescript
const handleSaveClient = async () => {
  if (!id || !name) return alert("ID y Nombre son obligatorios");
  const newItem: Client = { id, name, address, city, seller };
  
  setIsLoading(true);
  try {
    let result;
    
    if (editingId) {
      // Actualizar cliente existente
      result = await onUpdateClient(editingId, newItem);
    } else {
      // Crear nuevo cliente
      result = await onAddClient(newItem);
    }
    
    if (result.success) {
      resetForms();
      alert('Cliente guardado correctamente');
    } else {
      alert('Error al guardar cliente');
    }
  } catch (error) {
    console.error('Error guardando cliente:', error);
    alert('Error de conexión al guardar cliente');
  } finally {
    setIsLoading(false);
  }
};
```

### 🔑 Cambios clave
- ✅ Función es `async`
- ✅ Usa `await onAddClient()` o `await onUpdateClient()`
- ✅ Tiene `try/catch`
- ✅ Usa `setIsLoading(true/false)`
- ✅ Solo llama a `resetForms()` si es exitoso

### ✅ Verificación
- [ ] Función es `async`
- [ ] Usa `onAddClient()` o `onUpdateClient()`
- [ ] Tiene `try/catch`
- [ ] No hay errores de compilación

---

## 📋 PASO 5: Cambiar handleSaveReference

### Ubicación
Línea ~145 en `src/views/MastersView.tsx`

### ANTES
```typescript
const handleSaveReference = () => {
  if (!id || !desc) return alert("Referencia y Descripción son obligatorias");
  const newItem: Reference = { id, description: desc, price, designer, cloth1, avgCloth1, cloth2, avgCloth2 };
  updateState(prev => {
    const exists = prev.references.some(r => r.id === id);
    if (exists && !editingId) { alert("Referencia ya existe"); return prev; }
    return { ...prev, references: editingId ? prev.references.map(r => r.id === editingId ? newItem : r) : [...prev.references, newItem] };
  });
  resetForms();
};
```

### DESPUÉS
```typescript
const handleSaveReference = async () => {
  if (!id || !desc) return alert("Referencia y Descripción son obligatorias");
  const newItem: Reference = { id, description: desc, price, designer, cloth1, avgCloth1, cloth2, avgCloth2 };
  
  setIsLoading(true);
  try {
    let result;
    
    if (editingId) {
      // Actualizar referencia existente
      result = await onUpdateReference(editingId, newItem);
    } else {
      // Crear nueva referencia
      result = await onAddReference(newItem);
    }
    
    if (result.success) {
      resetForms();
      alert('Referencia guardada correctamente');
    } else {
      alert('Error al guardar referencia');
    }
  } catch (error) {
    console.error('Error guardando referencia:', error);
    alert('Error de conexión al guardar referencia');
  } finally {
    setIsLoading(false);
  }
};
```

### ✅ Verificación
- [ ] Función es `async`
- [ ] Usa `onAddReference()` o `onUpdateReference()`
- [ ] Tiene `try/catch`
- [ ] No hay errores de compilación

---

## 📋 PASO 6: Cambiar handleSaveConfeccionista

### Ubicación
Línea ~160 en `src/views/MastersView.tsx`

### ANTES
```typescript
const handleSaveConfeccionista = () => {
  if (!id || !name) return alert("Cédula y Nombre son obligatorios");
  const newItem: Confeccionista = { id, name, address, city, phone, score, active: isActive };
  updateState(prev => {
    const exists = prev.confeccionistas?.some(c => c.id === id);
    if (exists && !editingId) { alert("Esta cédula ya existe"); return prev; }
    const currentList = prev.confeccionistas || [];
    return { 
      ...prev, 
      confeccionistas: editingId ? currentList.map(c => c.id === editingId ? newItem : c) : [...currentList, newItem] 
    };
  });
  resetForms();
};
```

### DESPUÉS
```typescript
const handleSaveConfeccionista = async () => {
  if (!id || !name) return alert("Cédula y Nombre son obligatorios");
  const newItem: Confeccionista = { id, name, address, city, phone, score, active: isActive };
  
  setIsLoading(true);
  try {
    let result;
    
    if (editingId) {
      // Actualizar confeccionista existente
      result = await onUpdateConfeccionista(editingId, newItem);
    } else {
      // Crear nuevo confeccionista
      result = await onAddConfeccionista(newItem);
    }
    
    if (result.success) {
      resetForms();
      alert('Confeccionista guardado correctamente');
    } else {
      alert('Error al guardar confeccionista');
    }
  } catch (error) {
    console.error('Error guardando confeccionista:', error);
    alert('Error de conexión al guardar confeccionista');
  } finally {
    setIsLoading(false);
  }
};
```

### ✅ Verificación
- [ ] Función es `async`
- [ ] Usa `onAddConfeccionista()` o `onUpdateConfeccionista()`
- [ ] Tiene `try/catch`
- [ ] No hay errores de compilación

---

## 📋 PASO 7: Cambiar handleSaveSeller

### Ubicación
Línea ~175 en `src/views/MastersView.tsx`

### ANTES
```typescript
const handleSaveSeller = () => {
  if (!isAdmin) return;
  if (!name) return alert("Nombre obligatorio");
  const newItem: Seller = { id: editingId || Math.random().toString(36).substr(2, 9), name };
  updateState(prev => ({
    ...prev,
    sellers: editingId ? prev.sellers.map(s => s.id === editingId ? newItem : s) : [...prev.sellers, newItem]
  }));
  resetForms();
};
```

### DESPUÉS
```typescript
const handleSaveSeller = async () => {
  if (!isAdmin) return;
  if (!name) return alert("Nombre obligatorio");
  const newItem: Seller = { id: editingId || Math.random().toString(36).substr(2, 9), name };
  
  setIsLoading(true);
  try {
    const result = await onAddSeller(newItem);
    
    if (result.success) {
      resetForms();
      alert('Vendedor guardado correctamente');
    } else {
      alert('Error al guardar vendedor');
    }
  } catch (error) {
    console.error('Error guardando vendedor:', error);
    alert('Error de conexión al guardar vendedor');
  } finally {
    setIsLoading(false);
  }
};
```

### ✅ Verificación
- [ ] Función es `async`
- [ ] Usa `onAddSeller()`
- [ ] Tiene `try/catch`
- [ ] No hay errores de compilación

---

## 📋 PASO 8: Cambiar handleSaveCorreria

### Ubicación
Línea ~188 en `src/views/MastersView.tsx`

### ANTES
```typescript
const handleSaveCorreria = () => {
  if (!name || !year) return alert("Nombre y Año obligatorios");
  const newItem: Correria = { id: editingId || Math.random().toString(36).substr(2, 9), name, year };
  updateState(prev => ({
    ...prev,
    correrias: editingId ? prev.correrias.map(c => c.id === editingId ? newItem : c) : [...prev.correrias, newItem]
  }));
  resetForms();
};
```

### DESPUÉS
```typescript
const handleSaveCorreria = async () => {
  if (!name || !year) return alert("Nombre y Año obligatorios");
  const newItem: Correria = { id: editingId || Math.random().toString(36).substr(2, 9), name, year };
  
  setIsLoading(true);
  try {
    const result = await onAddCorreria(newItem);
    
    if (result.success) {
      resetForms();
      alert('Correría guardada correctamente');
    } else {
      alert('Error al guardar correría');
    }
  } catch (error) {
    console.error('Error guardando correría:', error);
    alert('Error de conexión al guardar correría');
  } finally {
    setIsLoading(false);
  }
};
```

### ✅ Verificación
- [ ] Función es `async`
- [ ] Usa `onAddCorreria()`
- [ ] Tiene `try/catch`
- [ ] No hay errores de compilación

---

## 📋 PASO 9: Cambiar handleDelete

### Ubicación
Línea ~210 en `src/views/MastersView.tsx`

### ANTES
```typescript
const handleDelete = (type: string, targetId: string) => {
  if (!isAdmin && (type === 'user' || type === 'seller' || type === 'confeccionista')) return;
  if (!confirm("¿Seguro que desea eliminar este registro?")) return;
  updateState(prev => {
    const newState = { ...prev };
    if (type === 'client') newState.clients = prev.clients.filter(x => x.id !== targetId);
    if (type === 'confeccionista') newState.confeccionistas = (prev.confeccionistas || []).filter(x => x.id !== targetId);
    if (type === 'reference') newState.references = prev.references.filter(x => x.id !== targetId);
    if (type === 'seller') newState.sellers = prev.sellers.filter(x => x.id !== targetId);
    if (type === 'correria') newState.correrias = prev.correrias.filter(x => x.id !== targetId);
    if (type === 'user') {
      if (targetId === user.id) { alert("No puedes eliminar tu propio usuario"); return prev; }
      newState.users = prev.users.filter(x => x.id !== targetId);
    }
    return newState;
  });
};
```

### DESPUÉS
```typescript
const handleDelete = async (type: string, targetId: string) => {
  if (!isAdmin && (type === 'user' || type === 'seller' || type === 'confeccionista')) return;
  if (!confirm("¿Seguro que desea eliminar este registro?")) return;
  
  setIsLoading(true);
  try {
    let result;
    
    if (type === 'client') {
      // Eliminar cliente del backend
      result = await onDeleteClient(targetId);
    } else if (type === 'confeccionista') {
      // Eliminar confeccionista del backend
      result = await onDeleteConfeccionista(targetId);
    } else if (type === 'reference') {
      // Eliminar referencia del backend
      result = await onDeleteReference(targetId);
    } else if (type === 'seller') {
      // Los vendedores se eliminan localmente (no hay endpoint de delete)
      updateState(prev => ({
        ...prev,
        sellers: prev.sellers.filter(x => x.id !== targetId)
      }));
      alert('Vendedor eliminado');
      return;
    } else if (type === 'correria') {
      // Las correrías se eliminan localmente (no hay endpoint de delete)
      updateState(prev => ({
        ...prev,
        correrias: prev.correrias.filter(x => x.id !== targetId)
      }));
      alert('Correría eliminada');
      return;
    } else if (type === 'user') {
      // Los usuarios se eliminan localmente (no hay endpoint de delete)
      if (targetId === user.id) {
        alert("No puedes eliminar tu propio usuario");
        return;
      }
      updateState(prev => ({
        ...prev,
        users: prev.users.filter(x => x.id !== targetId)
      }));
      alert('Usuario eliminado');
      return;
    }
    
    if (result?.success) {
      alert('Registro eliminado correctamente');
    } else {
      alert('Error al eliminar el registro');
    }
  } catch (error) {
    console.error('Error eliminando:', error);
    alert('Error de conexión al eliminar');
  } finally {
    setIsLoading(false);
  }
};
```

### 🔑 Cambios clave
- ✅ Función es `async`
- ✅ Usa `onDeleteClient()`, `onDeleteReference()`, `onDeleteConfeccionista()`
- ✅ Para Seller, Correria, User usa `updateState()` (no hay endpoints de delete)
- ✅ Tiene `try/catch`

### ✅ Verificación
- [ ] Función es `async`
- [ ] Usa las funciones de delete del backend
- [ ] Tiene `try/catch`
- [ ] No hay errores de compilación

---

## 📋 PASO 10: Actualizar botones para mostrar loading

### Ubicación
En los botones "GUARDAR" (busca `onClick={handleSaveClient}`, etc.)

### CAMBIO
Agrega `disabled={isLoading}` a todos los botones de guardar:

```typescript
// ANTES
<button onClick={handleSaveClient} className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:scale-105 transition-transform">GUARDAR CLIENTE</button>

// DESPUÉS
<button 
  onClick={handleSaveClient} 
  disabled={isLoading}
  className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isLoading ? 'GUARDANDO...' : 'GUARDAR CLIENTE'}
</button>
```

### Ubicaciones a cambiar
- [ ] Botón "GUARDAR CLIENTE" (línea ~550)
- [ ] Botón "GUARDAR CONFECCIONISTA" (línea ~650)
- [ ] Botón "GUARDAR REFERENCIA" (línea ~750)
- [ ] Botón "GUARDAR" en Vendedores (línea ~850)
- [ ] Botón "GUARDAR" en Correrías (línea ~920)
- [ ] Botón "GUARDAR USUARIO" (línea ~1000)

### ✅ Verificación
- [ ] Todos los botones tienen `disabled={isLoading}`
- [ ] Todos muestran "GUARDANDO..." cuando `isLoading` es true
- [ ] No hay errores de compilación

---

## ✅ CHECKLIST FINAL

- [ ] Paso 1: Interfaz `MastersViewProps` actualizada
- [ ] Paso 2: Props destructuradas en el componente
- [ ] Paso 3: Estado `isLoading` agregado
- [ ] Paso 4: `handleSaveClient` cambiado a `async`
- [ ] Paso 5: `handleSaveReference` cambiado a `async`
- [ ] Paso 6: `handleSaveConfeccionista` cambiado a `async`
- [ ] Paso 7: `handleSaveSeller` cambiado a `async`
- [ ] Paso 8: `handleSaveCorreria` cambiado a `async`
- [ ] Paso 9: `handleDelete` cambiado a `async`
- [ ] Paso 10: Botones actualizados con `disabled={isLoading}`
- [ ] No hay errores de compilación
- [ ] Probaste crear un cliente
- [ ] El cliente se guardó en la BD
- [ ] Recargaste la página y el cliente sigue ahí

---

## 🧪 PRUEBAS

### Prueba 1: Crear cliente
1. Abre la aplicación
2. Ve a Maestros → Clientes
3. Llena el formulario
4. Presiona "GUARDAR CLIENTE"
5. Verifica que el botón muestra "GUARDANDO..."
6. Verifica que el cliente aparece en la lista
7. Abre DevTools (F12) → Network
8. Verifica que hay una petición POST al backend

### Prueba 2: Persistencia
1. Recarga la página (F5)
2. Vuelve a hacer login
3. Ve a Maestros → Clientes
4. Verifica que el cliente que creaste sigue ahí

### Prueba 3: Actualizar cliente
1. Haz clic en el botón de editar de un cliente
2. Cambia el nombre
3. Presiona "GUARDAR CLIENTE"
4. Verifica que el nombre se actualizó

### Prueba 4: Eliminar cliente
1. Haz clic en el botón de eliminar de un cliente
2. Confirma la eliminación
3. Verifica que el cliente desaparece de la lista
4. Recarga la página
5. Verifica que el cliente no está en la BD

---

## 🎉 RESULTADO ESPERADO

Después de completar todos los pasos:
- ✅ Los datos se guardan en la base de datos
- ✅ Los datos persisten al recargar la página
- ✅ Otros usuarios ven los cambios inmediatamente
- ✅ Los botones muestran "GUARDANDO..." mientras se procesa
- ✅ No hay errores en la consola

---

## 📞 AYUDA

Si algo no funciona:
1. Verifica que todas las props están en `MastersViewProps`
2. Verifica que todas las funciones son `async`
3. Verifica que todas tienen `try/catch`
4. Abre DevTools (F12) y busca errores
5. Revisa los logs del backend

---

**¡Buena suerte! 🚀**
