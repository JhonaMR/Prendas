# 🔗 GUÍA DE INTEGRACIÓN FRONTEND - Conectar React con Backend

## 📋 Objetivo

Conectar tu frontend React (el que creaste en Google AI Studio) con el backend Node.js que acabas de instalar.

**Tiempo estimado:** 30-45 minutos  
**Nivel:** Principiante (primera vez integrando frontend-backend)

---

## ✅ Pre-requisitos

Antes de empezar, asegúrate de:

- [ ] Backend funcionando (ver [GUIA-INSTALACION-BACKEND.md](GUIA-INSTALACION-BACKEND.md))
- [ ] Servidor corriendo en http://localhost:3000
- [ ] Tests del backend pasando (`npm test` - 9/9)
- [ ] Tu proyecto React funcionando localmente

---

## 📂 PASO 1: Preparar tu Proyecto React

### 1.1 Ubicar tu proyecto frontend

Deberías tener tu proyecto React con esta estructura:

```
mi-proyecto-react/
├── src/
│   ├── App.tsx
│   ├── types.ts
│   ├── views/
│   │   ├── LoginView.tsx
│   │   ├── MastersView.tsx
│   │   ├── ReceptionView.tsx
│   │   └── ...
│   └── store.ts  ← Este ya NO lo necesitarás
├── package.json
└── vite.config.ts
```

### 1.2 Hacer backup (por si acaso)

**Importante:** Haz una copia de seguridad antes de hacer cambios

```bash
# Windows (Explorador)
Clic derecho en la carpeta → Copiar → Pegar
Renombrar a "mi-proyecto-react-BACKUP"

# Linux/Mac (Terminal)
cp -r mi-proyecto-react mi-proyecto-react-BACKUP
```

---

## 📥 PASO 2: Copiar el Servicio de API

### 2.1 Ubicar el archivo api.ts

En la carpeta que descargaste (`inventario-backend-completo`), encontrarás:

```
inventario-backend-completo/
└── frontend-integration/
    └── api.ts  ← Este archivo
```

### 2.2 Copiar a tu proyecto React

1. **Crear carpeta `services/` si no existe:**

   ```bash
   # Ir a tu proyecto React
   cd mi-proyecto-react

   # Crear carpeta
   mkdir src/services
   ```

2. **Copiar el archivo:**

   **Windows (Explorador):**
   - Copia `inventario-backend-completo/frontend-integration/api.ts`
   - Pega en `mi-proyecto-react/src/services/api.ts`

   **Linux/Mac (Terminal):**
   ```bash
   cp /ruta/inventario-backend-completo/frontend-integration/api.ts \
      /ruta/mi-proyecto-react/src/services/api.ts
   ```

### ✅ CHECKPOINT 1: Verificar archivo copiado

```bash
# Windows
dir src\services\api.ts

# Linux/Mac
ls src/services/api.ts
```

**Deberías ver:** El archivo `api.ts` en `src/services/`

---

## ⚙️ PASO 3: Configurar Variable de Entorno del Frontend

### 3.1 Crear archivo .env.local

En la **raíz de tu proyecto React**, crea un archivo llamado `.env.local`

**Contenido:**

```env
# URL del backend
VITE_API_URL=http://localhost:3000/api
```

**Ubicación del archivo:**
```
mi-proyecto-react/
├── .env.local  ← Aquí (mismo nivel que package.json)
├── src/
└── package.json
```

### 3.2 Alternativa: Sin archivo .env.local

Si no quieres crear `.env.local`, puedes editar directamente `api.ts`:

```typescript
// En src/services/api.ts
// Línea 21 aproximadamente

// ANTES:
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// DESPUÉS (solo si NO creaste .env.local):
const API_BASE_URL = 'http://localhost:3000/api';
```

### ✅ CHECKPOINT 2: Verificar configuración

Si creaste `.env.local`, verifica:

```bash
# Windows
type .env.local

# Linux/Mac
cat .env.local
```

**Deberías ver:** `VITE_API_URL=http://localhost:3000/api`

---

## 🗑️ PASO 4: Eliminar store.ts (Ya No Se Necesita)

### 4.1 ¿Qué es store.ts?

Es el archivo que manejaba los datos en `localStorage`. Ya no lo necesitas porque ahora los datos están en el backend (SQLite).

### 4.2 Eliminar o renombrar

**Opción 1: Eliminarlo (recomendado)**

```bash
# Windows
del src\store.ts

# Linux/Mac
rm src/store.ts
```

**Opción 2: Renombrarlo (por si acaso)**

```bash
# Windows
ren src\store.ts store.ts.backup

# Linux/Mac
mv src/store.ts src/store.ts.backup
```

### ✅ CHECKPOINT 3: Verificar eliminación

```bash
# Windows
dir src\store.ts

# Linux/Mac
ls src/store.ts
```

**Deberías ver:** "No se encuentra el archivo" o similar

---

## ✏️ PASO 5: Actualizar LoginView.tsx

### 5.1 Abrir LoginView.tsx

Busca el archivo `src/views/LoginView.tsx` y ábrelo con tu editor.

### 5.2 Agregar import del servicio API

**ANTES** (primeras líneas):
```typescript
import React, { useState } from 'react';
import type { User } from '../types';
```

**DESPUÉS:**
```typescript
import React, { useState } from 'react';
import type { User } from '../types';
import { api } from '../services/api';  // ← NUEVO
```

### 5.3 Actualizar la función handleSubmit

**ANTES** (función completa de ejemplo):
```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  if (isRegister) {
    // Crear nuevo usuario
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      loginCode: code.toUpperCase(),
      role: UserRole.GENERAL
    };
    onRegister(newUser);
    onLogin(newUser);
  } else {
    // Login
    const u = users.find(x => 
      x.loginCode.toUpperCase() === code.toUpperCase() && 
      x.pin === pin
    );
    if (u) {
      onLogin(u);
    } else {
      setError('Credenciales inválidas');
    }
  }
};
```

**DESPUÉS** (nueva función completa):
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);  // Agregar estado de loading si no existe

  try {
    if (isRegister) {
      // ========== REGISTRO ==========
      
      // Validar formato de loginCode (3 letras)
      if (code.length !== 3 || !/^[A-Za-z]{3}$/.test(code)) {
        setError('El código debe tener exactamente 3 letras');
        setLoading(false);
        return;
      }

      // Validar formato de PIN (4 dígitos)
      if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        setError('El PIN debe tener exactamente 4 números');
        setLoading(false);
        return;
      }

      // Validar nombre
      if (!name || name.length < 3) {
        setError('El nombre debe tener al menos 3 caracteres');
        setLoading(false);
        return;
      }

      // Llamar al backend para registrar
      const response = await api.register(name, code, pin);

      if (response.success && response.data) {
        // Registro exitoso, el api.register ya hizo login automático
        onLogin(response.data.user);
      } else {
        setError(response.message || 'Error al registrar usuario');
      }

    } else {
      // ========== LOGIN ==========

      // Validar formato de loginCode
      if (code.length !== 3) {
        setError('El código debe tener 3 letras');
        setLoading(false);
        return;
      }

      // Validar formato de PIN
      if (pin.length !== 4) {
        setError('El PIN debe tener 4 números');
        setLoading(false);
        return;
      }

      // Llamar al backend para login
      const response = await api.login(code, pin);

      if (response.success && response.data) {
        // Login exitoso
        onLogin(response.data.user);
      } else {
        setError(response.message || 'Credenciales inválidas');
      }
    }

  } catch (error) {
    console.error('Error en autenticación:', error);
    setError('Error de conexión con el servidor. Verifica que el backend esté corriendo.');
  } finally {
    setLoading(false);
  }
};
```

### 5.4 Agregar estado de loading (si no existe)

**Busca** al inicio del componente:
```typescript
const [error, setError] = useState('');
```

**Agrega debajo:**
```typescript
const [loading, setLoading] = useState(false);
```

### 5.5 Actualizar el botón (mostrar loading)

**ANTES:**
```typescript
<button type="submit" className="...">
  {isRegister ? 'Registrar' : 'Ingresar'}
</button>
```

**DESPUÉS:**
```typescript
<button 
  type="submit" 
  className="..." 
  disabled={loading}
>
  {loading ? 'Procesando...' : (isRegister ? 'Registrar' : 'Ingresar')}
</button>
```

### ✅ CHECKPOINT 4: Verificar cambios en LoginView

Asegúrate de que:
- [ ] Importaste `api` de `'../services/api'`
- [ ] Cambiaste `handleSubmit` a `async`
- [ ] Agregaste `await api.login()` y `await api.register()`
- [ ] Agregaste `try/catch`
- [ ] Agregaste estado `loading`

---

## 🎨 PASO 6: Actualizar App.tsx

### 6.1 Abrir App.tsx

Busca el archivo `src/App.tsx`

### 6.2 Importar el servicio API

**ANTES:**
```typescript
import React, { useState, useEffect } from 'react';
import type { User, Reference, Client, ... } from './types';
```

**DESPUÉS:**
```typescript
import React, { useState, useEffect } from 'react';
import type { User, Reference, Client, ... } from './types';
import { api } from './services/api';  // ← NUEVO
```

### 6.3 Eliminar imports de store.ts

**ANTES:**
```typescript
import { getAppData, saveAppData } from './store';
```

**DESPUÉS:**
```typescript
// YA NO se importa store.ts
```

### 6.4 Actualizar la carga inicial de datos

**ANTES** (ejemplo):
```typescript
useEffect(() => {
  // Cargar datos de localStorage
  const data = getAppData();
  setReferences(data.references);
  setClients(data.clients);
  setConfeccionistas(data.confeccionistas);
  setSellers(data.sellers);
  setCorrerias(data.correrias);
  setReceptions(data.receptions);
  setDispatches(data.dispatches);
  setOrders(data.orders);
}, []);
```

**DESPUÉS:**
```typescript
useEffect(() => {
  // Cargar datos del backend
  const loadData = async () => {
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

      // Actualizar estados
      setReferences(referencesData);
      setClients(clientsData);
      setConfeccionistas(confeccionistasData);
      setSellers(sellersData);
      setCorrerias(correriasData);
      setReceptions(receptionsData);
      setDispatches(dispatchesData);
      setOrders(ordersData);
      setProductionTracking(productionData);

      console.log('✅ Datos cargados del backend');

    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      // Aquí puedes mostrar un mensaje de error al usuario
    }
  };

  // Solo cargar si el usuario está autenticado
  if (currentUser) {
    loadData();
  }
}, [currentUser]);
```

### 6.5 Actualizar funciones de creación (ejemplo con Referencias)

**ANTES:**
```typescript
const addReference = (ref: Reference) => {
  const newRefs = [...references, ref];
  setReferences(newRefs);
  saveAppData({ ...appState, references: newRefs });
};
```

**DESPUÉS:**
```typescript
const addReference = async (ref: Reference) => {
  try {
    const response = await api.createReference(ref);
    
    if (response.success && response.data) {
      // Agregar la nueva referencia al estado
      setReferences([...references, response.data]);
      console.log('✅ Referencia creada');
    } else {
      console.error('❌ Error:', response.message);
      // Mostrar error al usuario
      alert(response.message || 'Error al crear referencia');
    }
  } catch (error) {
    console.error('❌ Error creando referencia:', error);
    alert('Error de conexión con el servidor');
  }
};
```

### 6.6 Aplicar el mismo patrón para todas las entidades

Necesitas actualizar las funciones de:

- `addClient` → `api.createClient()`
- `addConfeccionista` → `api.createConfeccionista()`
- `addSeller` → `api.createSeller()`
- `addCorreria` → `api.createCorreria()`
- `addReception` → `api.createReception()`
- `addDispatch` → `api.createDispatch()`
- `addOrder` → `api.createOrder()`

**Patrón general:**

```typescript
const add[Entidad] = async (data: [Tipo]) => {
  try {
    const response = await api.create[Entidad](data);
    
    if (response.success && response.data) {
      set[Entidades]([...[entidades], response.data]);
      console.log('✅ [Entidad] creada');
    } else {
      alert(response.message || 'Error al crear [entidad]');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    alert('Error de conexión con el servidor');
  }
};
```

### ✅ CHECKPOINT 5: Verificar cambios en App.tsx

Asegúrate de que:
- [ ] Importaste `api` de `'./services/api'`
- [ ] Eliminaste imports de `store.ts`
- [ ] Cambiaste `useEffect` para cargar datos del backend
- [ ] Actualizaste al menos una función de creación (ej: `addReference`)

---

## 🧪 PASO 7: Probar la Integración

### 7.1 Asegurarte de que el backend esté corriendo

En una terminal:

```bash
cd backend
npm start
```

**Debes ver:** "SERVIDOR BACKEND INICIADO"

### 7.2 Iniciar el frontend

En **otra terminal** (nueva):

```bash
cd mi-proyecto-react
npm install  # Por si acaso
npm run dev
```

**Deberías ver:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 7.3 Abrir en navegador

1. Abre tu navegador
2. Ve a: `http://localhost:5173`
3. Abre las DevTools (F12)
4. Ve a la pestaña "Console"

### ✅ CHECKPOINT 6: Primera prueba de login

1. **En la pantalla de login, ingresa:**
   - Login Code: `ADM`
   - PIN: `0000`

2. **Presiona "Ingresar"**

3. **¿Qué debería pasar?**
   - ✅ El botón muestra "Procesando..."
   - ✅ Después de 1-2 segundos, entras al sistema
   - ✅ En la consola (F12) ves: "✅ Datos cargados del backend"

4. **En la consola del backend (terminal) deberías ver:**
   ```
   [2024-02-09T...] POST /api/auth/login
   [2024-02-09T...] GET /api/references
   [2024-02-09T...] GET /api/clients
   [2024-02-09T...] GET /api/confeccionistas
   ...
   ```

**❌ Si algo falla:**
- Revisa la consola del navegador (F12)
- Revisa los logs del backend (terminal)
- Ver sección "Problemas Comunes" abajo

---

## 🎯 PASO 8: Probar CRUD Completo

### 8.1 Probar lectura de datos

1. En tu aplicación, ve a la sección de "Referencias" (o Maestros)
2. Deberías ver las 3 referencias de prueba:
   - 10210 - blusa dama
   - 12877 - blusa dama
   - 12871 - buso dama

3. **En la consola del navegador (F12) deberías ver:**
   ```
   ✅ Datos cargados del backend
   ```

4. **En la consola del backend deberías ver:**
   ```
   [2024-02-09T...] GET /api/references
   ```

### 8.2 Probar creación de datos

1. En la sección de Referencias, crea una nueva:
   - ID: `TEST1`
   - Descripción: `Prueba de integración`
   - Precio: `50000`
   - Diseñador: `Test Designer`

2. **Presiona guardar**

3. **¿Qué debería pasar?**
   - ✅ La referencia se crea
   - ✅ Aparece en la lista
   - ✅ En consola del navegador: "✅ Referencia creada"
   - ✅ En consola del backend: `POST /api/references`

### 8.3 Probar persistencia

1. **Recarga la página** (F5)
2. Vuelve a hacer login (ADM / 0000)
3. Ve a Referencias
4. **Deberías ver:** La referencia TEST1 que creaste aún está ahí

**✅ Esto confirma que los datos se guardan en la base de datos**

### 8.4 Probar desde otro navegador (opcional)

1. Abre otro navegador diferente (ej: si usaste Chrome, abre Firefox)
2. Ve a `http://localhost:5173`
3. Login con JAM / 1234
4. Ve a Referencias
5. **Deberías ver:** Las mismas referencias, incluyendo TEST1

**✅ Esto confirma que varios usuarios acceden a los mismos datos**

### ✅ CHECKPOINT 7: Verificar CRUD completo

- [ ] Puedes hacer login
- [ ] Cargan las referencias de prueba
- [ ] Puedes crear una nueva referencia
- [ ] La referencia persiste al recargar
- [ ] Otros usuarios ven los mismos datos

---

## 🚨 Problemas Comunes

### Error: "Failed to fetch" o "Network Error"

**Síntoma:** En la consola del navegador ves errores de red

**Causas posibles:**
1. El backend no está corriendo
2. La URL del backend es incorrecta
3. CORS no está configurado

**Soluciones:**

1. **Verificar que el backend esté corriendo:**
   ```bash
   # En otra terminal
   curl http://localhost:3000/api/health
   ```

   Deberías ver: `{"success":true,...}`

2. **Verificar la URL en .env.local:**
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

   **Importante:** Debe ser `http://` (no `https://`)

3. **Verificar CORS en backend/.env:**
   ```env
   CORS_ORIGIN=http://localhost:5173,http://localhost:3000
   ```

   Reinicia el backend después de cambiar esto.

### Error: "401 Unauthorized" en todas las peticiones

**Síntoma:** Después de login, todas las peticiones fallan con 401

**Causa:** El token JWT no se está enviando correctamente

**Solución:**

1. Verifica en la consola del navegador → Application → Local Storage
2. Debes ver una key llamada `auth_token` con un valor largo
3. Si no existe, el login no está funcionando correctamente

### Error: Datos no se cargan después de login

**Síntoma:** Entras al sistema pero no ves referencias, clientes, etc.

**Causas posibles:**
1. Las funciones de carga no están siendo llamadas
2. Error en el código de `useEffect`

**Solución:**

1. Abre la consola del navegador (F12)
2. Busca errores en rojo
3. Verifica que `useEffect` se ejecute cuando `currentUser` cambia

### El botón se queda en "Procesando..."

**Síntoma:** Haces click en login y nunca responde

**Causas:**
1. El backend no está respondiendo
2. Error en el código de `handleSubmit`

**Solución:**

1. Abre la consola del navegador
2. Busca errores
3. Verifica que el `try/catch` tenga `finally { setLoading(false); }`

---

## 📝 Cambios Resumidos

### Archivos que AGREGASTE:

```
src/services/api.ts          ← Nuevo
.env.local                   ← Nuevo (opcional)
```

### Archivos que MODIFICASTE:

```
src/views/LoginView.tsx      ← Cambiaste handleSubmit
src/App.tsx                  ← Cambiaste useEffect y funciones add*
```

### Archivos que ELIMINASTE:

```
src/store.ts                 ← Ya no se usa
```

---

## ✅ Checklist Final

Antes de considerar la integración completa:

- [ ] Archivo `api.ts` copiado en `src/services/`
- [ ] Archivo `.env.local` creado (o API_BASE_URL hardcoded)
- [ ] `store.ts` eliminado o renombrado
- [ ] `LoginView.tsx` actualizado con `async/await`
- [ ] `App.tsx` actualizado para cargar datos del backend
- [ ] Al menos una función de creación actualizada (ej: `addReference`)
- [ ] Backend corriendo en terminal
- [ ] Frontend corriendo en otra terminal
- [ ] Login funciona (ADM / 0000)
- [ ] Datos se cargan del backend
- [ ] Puedes crear nuevos registros
- [ ] Los datos persisten al recargar

**✅ Si marcaste todas:** ¡Integración completa exitosa!

---

## 🎯 Siguientes Pasos (Opcional)

### Actualizar todas las funciones restantes

Si solo actualizaste `addReference`, ahora deberías actualizar:

- `updateReference` → `api.updateReference(id, data)`
- `deleteReference` → `api.deleteReference(id)`
- Y lo mismo para clientes, confeccionistas, etc.

### Agregar manejo de errores global

Considera agregar un componente de notificaciones/toasts para mostrar errores de forma amigable en lugar de `alert()`

### Agregar loading states

Agrega spinners o skeletons mientras se cargan los datos

---

## 📖 Siguiente Paso

**[GUIA-DESPLIEGUE.md](GUIA-DESPLIEGUE.md)** - Desplegar en red local para que otros PCs accedan

---

## 💡 Consejos Finales

1. **Usa `console.log`** liberalmente durante desarrollo
2. **Revisa la consola del navegador (F12)** siempre que algo falle
3. **Revisa los logs del backend** en la terminal
4. **Usa las DevTools → Network** para ver las peticiones HTTP
5. **No cierres las terminales** del backend y frontend mientras trabajas

---

## 🆘 ¿Necesitas Ayuda?

Si algo no funciona:

1. ✅ Verifica que backend esté corriendo (`npm start`)
2. ✅ Verifica que frontend esté corriendo (`npm run dev`)
3. ✅ Abre DevTools (F12) y busca errores
4. ✅ Revisa los logs del backend
5. ✅ Consulta [SOLUCION-PROBLEMAS.md](SOLUCION-PROBLEMAS.md)

¡Persevera! La integración frontend-backend siempre tiene un poco de trial and error la primera vez. 🚀
