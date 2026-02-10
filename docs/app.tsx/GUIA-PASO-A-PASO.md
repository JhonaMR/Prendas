# 📋 GUÍA PASO A PASO - Aplicar Cambios

## 🎯 Objetivo
Aplicar los cambios de migración a `src/App.tsx` de forma ordenada y segura.

---

## ⚠️ ANTES DE EMPEZAR

1. **Haz backup:**
   ```bash
   # Windows
   copy src\App.tsx src\App.tsx.backup
   
   # Linux/Mac
   cp src/App.tsx src/App.tsx.backup
   ```

2. **Abre los archivos de referencia:**
   - `src/App.refactor.tsx` - Código completo refactorizado
   - `src/CAMBIOS-MIGRACION.md` - Cambios específicos
   - `src/COMPARATIVO-ANTES-DESPUES.md` - Comparación

3. **Asegúrate de que el backend esté corriendo:**
   ```bash
   cd backend
   npm start
   ```

---

## 📝 PASO 1: ACTUALIZAR IMPORTS

### Ubicación
Líneas 1-10 de `src/App.tsx`

### Cambios

**1.1 Agregar import de API**

Busca:
```typescript
import React, { useState, useEffect } from 'react';
import { AppState, User, UserRole } from './types';
```

Cambia a:
```typescript
import React, { useState, useEffect } from 'react';
import { AppState, User, UserRole } from './types';
import { api } from './services/api';  // ← AGREGAR ESTA LÍNEA
```

**1.2 Eliminar import de store**

Busca:
```typescript
import { getAppData, saveAppData } from './store';
```

Elimina esa línea completamente.

### ✅ Verificación
- [ ] Agregaste `import { api } from './services/api';`
- [ ] Eliminaste `import { getAppData, saveAppData } from './store';`

---

## 📝 PASO 2: ACTUALIZAR ESTADO INICIAL

### Ubicación
Línea ~20 (dentro de `const App: React.FC = () => {`)

### Cambios

**2.1 Cambiar inicialización de state**

Busca:
```typescript
const [state, setState] = useState<AppState>(getAppData());
```

Cambia a:
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

### ✅ Verificación
- [ ] El estado inicial es un objeto vacío
- [ ] Tiene todas las propiedades listadas

---

## 📝 PASO 3: AGREGAR NUEVOS ESTADOS

### Ubicación
Después de `const [isNavOpen, setIsNavOpen] = useState(false);`

### Cambios

**3.1 Agregar estados de loading y error**

Busca:
```typescript
const [isNavOpen, setIsNavOpen] = useState(false);
```

Agrega después:
```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### ✅ Verificación
- [ ] Agregaste `const [isLoading, setIsLoading] = useState(false);`
- [ ] Agregaste `const [error, setError] = useState<string | null>(null);`

---

## 📝 PASO 4: ELIMINAR useEffect DE GUARDADO

### Ubicación
Busca el `useEffect` que contiene `saveAppData`

### Cambios

**4.1 Eliminar el useEffect completo**

Busca:
```typescript
useEffect(() => {
  saveAppData(state);
}, [state]);
```

Elimina esas líneas completamente.

### ✅ Verificación
- [ ] Eliminaste el `useEffect` que contenía `saveAppData`

---

## 📝 PASO 5: AGREGAR useEffect DE CARGA DEL BACKEND

### Ubicación
Donde eliminaste el anterior (después de los estados)

### Cambios

**5.1 Agregar nuevo useEffect**

Agrega:
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
}, [user]);
```

### ✅ Verificación
- [ ] Agregaste el `useEffect` completo
- [ ] Tiene `[user]` como dependencia
- [ ] Llama a `Promise.all()` con todos los endpoints

---

## 📝 PASO 6: ACTUALIZAR handleLogout

### Ubicación
Busca `const handleLogout = () => {`

### Cambios

**6.1 Actualizar función**

Busca:
```typescript
const handleLogout = () => {
  setUser(null);
  setIsNavOpen(false);
};
```

Cambia a:
```typescript
const handleLogout = () => {
  api.logout();  // ← AGREGAR
  setUser(null);
  setIsNavOpen(false);
  setState({     // ← AGREGAR
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

### ✅ Verificación
- [ ] Agregaste `api.logout();`
- [ ] Agregaste `setState({...})` para limpiar estado

---

## 📝 PASO 7: AGREGAR FUNCIONES DE CRUD

### Ubicación
Antes de `const renderContent = () => {`

### Cambios

**7.1 Agregar addReference**

Agrega:
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

**7.2 Agregar addClient**

Agrega:
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

**7.3 Agregar addConfeccionista**

Agrega:
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

**7.4 Agregar addSeller**

Agrega:
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

**7.5 Agregar addCorreria**

Agrega:
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

**7.6 Agregar addReception**

Agrega:
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

**7.7 Agregar addDispatch**

Agrega:
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

**7.8 Agregar addOrder**

Agrega:
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

### ✅ Verificación
- [ ] Agregaste todas las 8 funciones `add*`
- [ ] Todas son `async`
- [ ] Todas tienen `try/catch`
- [ ] Todas llaman a `api.create*()`

---

## 📝 PASO 8: ACTUALIZAR renderContent

### Ubicación
Dentro de `const renderContent = () => {`

### Cambios

**8.1 Agregar verificaciones de loading y error**

Al inicio de la función, agrega:
```typescript
if (isLoading) {
  return <div className="text-center py-10">Cargando datos...</div>;
}

if (error) {
  return <div className="text-center py-10 text-red-500">{error}</div>;
}
```

**8.2 Actualizar casos de switch**

Para cada caso, pasa las funciones como props. Ejemplo:

Busca:
```typescript
case 'masters':
  return <MastersView user={user} state={state} updateState={updateState} />;
```

Cambia a:
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

Haz lo mismo para otros casos que necesiten funciones.

### ✅ Verificación
- [ ] Agregaste verificaciones de `isLoading` y `error`
- [ ] Pasas funciones `add*` como props a los componentes

---

## 🧪 PASO 9: PROBAR CAMBIOS

### 9.1 Verificar que no hay errores de compilación

```bash
# En la terminal del frontend
npm run dev
```

Deberías ver:
```
✓ built in XXXms
```

Si hay errores, revisa la consola.

### 9.2 Probar login

1. Abre `http://localhost:5173`
2. Ingresa: ADM / 0000
3. Presiona "Ingresar"

**Deberías ver:**
- Botón muestra "Procesando..."
- Después de 1-2 segundos, entras al sistema
- En la consola (F12): "✅ Datos cargados del backend"

### 9.3 Probar creación de datos

1. Ve a Maestros → Referencias
2. Crea una nueva referencia
3. Presiona guardar

**Deberías ver:**
- La referencia aparece en la lista
- En la consola: "✅ Referencia creada"

### 9.4 Probar persistencia

1. Recarga la página (F5)
2. Vuelve a hacer login
3. Ve a Referencias

**Deberías ver:**
- La referencia que creaste sigue ahí

### ✅ Verificación
- [ ] Login funciona
- [ ] Datos se cargan del backend
- [ ] Puedes crear referencias
- [ ] Los datos persisten

---

## 🐛 PASO 10: DEBUGGEAR SI ALGO FALLA

### 10.1 Abre DevTools (F12)

1. Presiona F12
2. Ve a la pestaña "Console"
3. Busca errores en rojo

### 10.2 Revisa los logs del backend

En la terminal donde corre el backend, deberías ver:
```
[2024-02-09T...] POST /api/auth/login
[2024-02-09T...] GET /api/references
[2024-02-09T...] GET /api/clients
...
```

### 10.3 Errores comunes

**Error: "Cannot find module './store'"**
- Solución: Eliminaste el import de store pero aún hay referencias
- Busca `getAppData` o `saveAppData` en el archivo

**Error: "api is not defined"**
- Solución: No importaste `api` correctamente
- Verifica: `import { api } from './services/api';`

**Error: "Failed to fetch"**
- Solución: El backend no está corriendo
- Verifica: `npm start` en la carpeta backend

**Error: "Cannot read property 'success' of undefined"**
- Solución: La respuesta del API no es lo esperado
- Agrega `console.log(response)` para debuggear

---

## ✅ CHECKLIST FINAL

- [ ] Paso 1: Imports actualizados
- [ ] Paso 2: Estado inicial cambiado
- [ ] Paso 3: Nuevos estados agregados
- [ ] Paso 4: useEffect de guardado eliminado
- [ ] Paso 5: useEffect de carga agregado
- [ ] Paso 6: handleLogout actualizado
- [ ] Paso 7: Funciones add* agregadas
- [ ] Paso 8: renderContent actualizado
- [ ] Paso 9: Cambios probados
- [ ] Paso 10: Debuggeo completado

---

## 🎉 ¡LISTO!

Si completaste todos los pasos y las pruebas pasaron, ¡la migración está completa!

### Próximos pasos:
1. Actualizar otros componentes para recibir funciones como props
2. Agregar más funciones (update, delete)
3. Agregar manejo de errores global
4. Agregar loading states en componentes

---

## 📞 AYUDA

Si algo no funciona:
1. Revisa `src/App.refactor.tsx` para ver el código completo
2. Revisa `src/CAMBIOS-MIGRACION.md` para cambios específicos
3. Revisa `src/COMPARATIVO-ANTES-DESPUES.md` para comparación
4. Abre DevTools (F12) y busca errores
5. Revisa los logs del backend
