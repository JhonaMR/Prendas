# 📋 RESUMEN DE CAMBIOS - Migración a Backend

## 🎯 Objetivo
Migrar `App.tsx` de usar `localStorage` (store.ts) a usar el backend con API REST.

---

## 📝 CAMBIOS ESPECÍFICOS EN App.tsx

### 1️⃣ IMPORTS - Agregar y Eliminar

**AGREGAR:**
```typescript
import { api } from './services/api';  // ← NUEVO
```

**ELIMINAR:**
```typescript
// import { getAppData, saveAppData } from './store'; ← ELIMINAR ESTA LÍNEA
```

---

### 2️⃣ ESTADO INICIAL - Cambiar inicialización

**ANTES:**
```typescript
const [state, setState] = useState<AppState>(getAppData());
```

**DESPUÉS:**
```typescript
const [state, setState] = useState<AppState>({
  references: [],
  clients: [],
  confeccionistas: [],
  sellers: [],
  correrias: [],
  receptions: [],
  dispatches: [],
  orders: [],
  productionTracking: [],
  users: []
});
```

**Por qué:** Ya no cargamos de localStorage, iniciamos vacío y cargamos del backend.

---

### 3️⃣ AGREGAR NUEVOS ESTADOS

**Agregar después de `isNavOpen`:**
```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**Por qué:** Para manejar estados de carga y errores.

---

### 4️⃣ ELIMINAR useEffect DE GUARDADO

**ELIMINAR COMPLETAMENTE:**
```typescript
useEffect(() => {
  saveAppData(state);
}, [state]);
```

**Por qué:** Ya no guardamos en localStorage, el backend lo hace.

---

### 5️⃣ AGREGAR useEffect DE CARGA DEL BACKEND

**Agregar después de eliminar el anterior:**
```typescript
useEffect(() => {
  const loadData = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Cargar todos los datos en paralelo
      const [
        referencesData,
        clientsData,
        confeccionistasData,
        sellersData,
        correriasData,
        receptionsData,
        dispatchesData,
        ordersData,
        productionData
      ] = await Promise.all([
        api.getReferences(),
        api.getClients(),
        api.getConfeccionistas(),
        api.getSellers(),
        api.getCorrerias(),
        api.getReceptions(),
        api.getDispatches(),
        api.getOrders(),
        api.getProductionTracking()
      ]);

      // Actualizar estado con todos los datos
      setState(prev => ({
        ...prev,
        references: referencesData,
        clients: clientsData,
        confeccionistas: confeccionistasData,
        sellers: sellersData,
        correrias: correriasData,
        receptions: receptionsData,
        dispatches: dispatchesData,
        orders: ordersData,
        productionTracking: productionData
      }));

      console.log('✅ Datos cargados del backend');

    } catch (err) {
      console.error('❌ Error cargando datos:', err);
      setError('Error al cargar datos del servidor');
    } finally {
      setIsLoading(false);
    }
  };

  loadData();
}, [user]); // Se ejecuta cuando user cambia
```

**Por qué:** Carga todos los datos del backend cuando el usuario se autentica.

---

### 6️⃣ ACTUALIZAR handleLogout

**ANTES:**
```typescript
const handleLogout = () => {
  setUser(null);
  setIsNavOpen(false);
};
```

**DESPUÉS:**
```typescript
const handleLogout = () => {
  api.logout();  // ← NUEVO: Limpiar token
  setUser(null);
  setIsNavOpen(false);
  setState({    // ← NUEVO: Limpiar estado
    references: [],
    clients: [],
    confeccionistas: [],
    sellers: [],
    correrias: [],
    receptions: [],
    dispatches: [],
    orders: [],
    productionTracking: [],
    users: []
  });
};
```

**Por qué:** Limpiar el token y el estado cuando se cierra sesión.

---

### 7️⃣ AGREGAR FUNCIONES DE CRUD ASYNC

**Agregar todas estas funciones (antes de renderContent):**

#### addReference
```typescript
const addReference = async (ref: any) => {
  try {
    const response = await api.createReference(ref);

    if (response.success && response.data) {
      setState(prev => ({
        ...prev,
        references: [...prev.references, response.data]
      }));
      console.log('✅ Referencia creada');
    } else {
      alert(response.message || 'Error al crear referencia');
    }
  } catch (error) {
    console.error('❌ Error creando referencia:', error);
    alert('Error de conexión con el servidor');
  }
};
```

#### addClient
```typescript
const addClient = async (client: any) => {
  try {
    const response = await api.createClient(client);

    if (response.success && response.data) {
      setState(prev => ({
        ...prev,
        clients: [...prev.clients, response.data]
      }));
      console.log('✅ Cliente creado');
    } else {
      alert(response.message || 'Error al crear cliente');
    }
  } catch (error) {
    console.error('❌ Error creando cliente:', error);
    alert('Error de conexión con el servidor');
  }
};
```

#### addConfeccionista
```typescript
const addConfeccionista = async (conf: any) => {
  try {
    const response = await api.createConfeccionista(conf);

    if (response.success && response.data) {
      setState(prev => ({
        ...prev,
        confeccionistas: [...prev.confeccionistas, response.data]
      }));
      console.log('✅ Confeccionista creado');
    } else {
      alert(response.message || 'Error al crear confeccionista');
    }
  } catch (error) {
    console.error('❌ Error creando confeccionista:', error);
    alert('Error de conexión con el servidor');
  }
};
```

#### addSeller
```typescript
const addSeller = async (seller: any) => {
  try {
    const response = await api.createSeller(seller);

    if (response.success && response.data) {
      setState(prev => ({
        ...prev,
        sellers: [...prev.sellers, response.data]
      }));
      console.log('✅ Vendedor creado');
    } else {
      alert(response.message || 'Error al crear vendedor');
    }
  } catch (error) {
    console.error('❌ Error creando vendedor:', error);
    alert('Error de conexión con el servidor');
  }
};
```

#### addCorreria
```typescript
const addCorreria = async (correria: any) => {
  try {
    const response = await api.createCorreria(correria);

    if (response.success && response.data) {
      setState(prev => ({
        ...prev,
        correrias: [...prev.correrias, response.data]
      }));
      console.log('✅ Correría creada');
    } else {
      alert(response.message || 'Error al crear correría');
    }
  } catch (error) {
    console.error('❌ Error creando correría:', error);
    alert('Error de conexión con el servidor');
  }
};
```

#### addReception
```typescript
const addReception = async (reception: any) => {
  try {
    const response = await api.createReception(reception);

    if (response.success && response.data) {
      setState(prev => ({
        ...prev,
        receptions: [...prev.receptions, response.data]
      }));
      console.log('✅ Recepción creada');
    } else {
      alert(response.message || 'Error al crear recepción');
    }
  } catch (error) {
    console.error('❌ Error creando recepción:', error);
    alert('Error de conexión con el servidor');
  }
};
```

#### addDispatch
```typescript
const addDispatch = async (dispatch: any) => {
  try {
    const response = await api.createDispatch(dispatch);

    if (response.success && response.data) {
      setState(prev => ({
        ...prev,
        dispatches: [...prev.dispatches, response.data]
      }));
      console.log('✅ Despacho creado');
    } else {
      alert(response.message || 'Error al crear despacho');
    }
  } catch (error) {
    console.error('❌ Error creando despacho:', error);
    alert('Error de conexión con el servidor');
  }
};
```

#### addOrder
```typescript
const addOrder = async (order: any) => {
  try {
    const response = await api.createOrder(order);

    if (response.success && response.data) {
      setState(prev => ({
        ...prev,
        orders: [...prev.orders, response.data]
      }));
      console.log('✅ Pedido creado');
    } else {
      alert(response.message || 'Error al crear pedido');
    }
  } catch (error) {
    console.error('❌ Error creando pedido:', error);
    alert('Error de conexión con el servidor');
  }
};
```

**Por qué:** Todas las funciones siguen el mismo patrón:
1. Llamar `api.create*()`
2. Si éxito, actualizar estado
3. Si error, mostrar alerta
4. Usar try/catch para errores de red

---

### 8️⃣ ACTUALIZAR renderContent

**Agregar al inicio:**
```typescript
if (isLoading) {
  return <div className="text-center py-10">Cargando datos...</div>;
}

if (error) {
  return <div className="text-center py-10 text-red-500">{error}</div>;
}
```

**Pasar funciones a los componentes:**

Ejemplo para `MastersView`:
```typescript
case 'masters':
  return (
    <MastersView 
      user={user} 
      state={state} 
      updateState={updateState}
      onAddReference={addReference}
      onAddClient={addClient}
      onAddConfeccionista={addConfeccionista}
      onAddSeller={addSeller}
      onAddCorreria={addCorreria}
    />
  );
```

**Por qué:** Los componentes necesitan las funciones async para crear datos.

---

## 📂 ARCHIVOS A MODIFICAR

### 1. `src/App.tsx` ← PRINCIPAL
Aplicar todos los cambios anteriores

### 2. `src/views/LoginView.tsx` ← SECUNDARIO
Ya debería estar actualizado con `api.login()` y `api.register()`

### 3. `src/views/MastersView.tsx` ← SECUNDARIO
Recibir `onAddReference`, `onAddClient`, etc. como props y usarlas

### 4. `src/views/ReceptionView.tsx` ← SECUNDARIO
Recibir `onAddReception` como prop

### 5. `src/views/DispatchView.tsx` ← SECUNDARIO
Recibir `onAddDispatch` como prop

### 6. `src/views/OrdersView.tsx` ← SECUNDARIO
Recibir `onAddOrder` como prop

---

## ✅ CHECKLIST DE CAMBIOS

- [ ] Importar `api` desde `'./services/api'`
- [ ] Eliminar import de `store.ts`
- [ ] Cambiar estado inicial a objeto vacío
- [ ] Agregar estados `isLoading` y `error`
- [ ] Eliminar `useEffect` de guardado en localStorage
- [ ] Agregar `useEffect` de carga del backend
- [ ] Actualizar `handleLogout` para limpiar token
- [ ] Agregar todas las funciones `add*` async
- [ ] Actualizar `renderContent` para mostrar loading/error
- [ ] Pasar funciones `add*` a los componentes como props
- [ ] Actualizar componentes para recibir y usar las funciones

---

## 🧪 PRUEBAS DESPUÉS DE CAMBIOS

1. **Login:** ADM / 0000
2. **Verificar carga:** Deberías ver "Cargando datos..." y luego los datos
3. **Crear referencia:** Ir a Maestros → Referencias → Crear
4. **Verificar persistencia:** Recargar página (F5) y verificar que la referencia sigue ahí
5. **Verificar en otro navegador:** Abre otro navegador y verifica que ves los mismos datos

---

## 📌 NOTAS IMPORTANTES

- **No elimines store.ts aún:** Mantenlo como backup por si algo falla
- **Usa console.log:** Agrega logs para debuggear
- **Revisa DevTools:** F12 → Console para ver errores
- **Revisa logs del backend:** Terminal donde corre el backend
- **Paciencia:** La integración siempre tiene pequeños detalles

---

## 🔗 REFERENCIAS

- Archivo de referencia: `src/App.refactor.tsx`
- Guía completa: `backend/docs/GUIA-INTEGRACION-FRONTEND.md`
- API service: `src/services/api.ts`
