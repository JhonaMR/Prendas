# 🔌 OFFLINE-FIRST: IMPLEMENTACIÓN TÉCNICA

## 📋 ÍNDICE
1. [Conceptos Clave](#conceptos-clave)
2. [IndexedDB](#indexeddb)
3. [Service Worker](#service-worker)
4. [Detección de Conexión](#detección-de-conexión)
5. [Sincronización](#sincronización)
6. [Manejo de Errores](#manejo-de-errores)

---

## 🎯 CONCEPTOS CLAVE

### ¿Qué es Offline-First?

```
Offline-First = Guardar primero, sincronizar después

Flujo tradicional (Online-First):
  Usuario llena formulario
    ↓
  Envía a servidor
    ↓
  Espera respuesta
    ↓
  Muestra confirmación
  
  ❌ Si no hay internet → Pierde datos

Flujo Offline-First:
  Usuario llena formulario
    ↓
  Guarda en navegador (IndexedDB)
    ↓
  Muestra confirmación INMEDIATA
    ↓
  Cuando hay internet → Sincroniza
  
  ✅ Si no hay internet → Datos seguros
```

### Tecnologías involucradas

```
1. IndexedDB
   - Base de datos en el navegador
   - Almacena pedidos locales
   - Persiste aunque cierres navegador

2. Service Worker
   - Script que corre en background
   - Detecta conexión
   - Sincroniza automáticamente
   - Cachea archivos

3. LocalStorage
   - Almacenamiento simple (respaldo)
   - Guarda tokens, preferencias

4. Fetch API
   - Realiza requests HTTP
   - Maneja errores de conexión
```

---

## 💾 INDEXEDDB

### ¿Qué es IndexedDB?

```
Es una base de datos real en el navegador:

LocalStorage:
  - Límite: 5-10 MB
  - Acceso lento
  - Solo strings
  - Síncrono

IndexedDB:
  - Límite: 50+ MB
  - Acceso rápido
  - Objetos complejos
  - Asíncrono
  - Índices para búsquedas
  - Transacciones
```

### Estructura de datos

```javascript
// Tabla: pedidos
{
  keyPath: 'id',  // Clave primaria
  indexes: [
    { name: 'sincronizado', keyPath: 'sincronizado' },
    { name: 'createdAt', keyPath: 'createdAt' }
  ]
}

// Documento ejemplo:
{
  id: 'uuid-1234',
  vendedorId: 'vendedor_001',
  clienteId: 'cliente_123',
  correriaId: 'correria_456',
  items: [
    {
      referencia: '10210',
      cantidad: 50,
      precio: 30900
    }
  ],
  total: 1545000,
  fechaInicioDespacho: '2024-03-15',
  fechaFinDespacho: '2024-03-20',
  observaciones: 'Urgente',
  sincronizado: false,
  createdAt: '2024-03-02T10:00:00Z',
  sincronizadoEn: null
}
```

### Operaciones básicas

```javascript
// 1. ABRIR BASE DE DATOS
const openDB = (dbName = 'prendas-pwa', version = 1) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Crear tabla si no existe
      if (!db.objectStoreNames.contains('pedidos')) {
        const store = db.createObjectStore('pedidos', { keyPath: 'id' });
        store.createIndex('sincronizado', 'sincronizado', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
};

// 2. GUARDAR PEDIDO
const guardarPedido = async (pedido) => {
  const db = await openDB();
  const transaction = db.transaction(['pedidos'], 'readwrite');
  const store = transaction.objectStore('pedidos');
  
  return new Promise((resolve, reject) => {
    const request = store.add({
      ...pedido,
      id: generateUUID(),
      sincronizado: false,
      createdAt: new Date().toISOString()
    });
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

// 3. OBTENER PEDIDOS NO SINCRONIZADOS
const obtenerPedidosPendientes = async () => {
  const db = await openDB();
  const transaction = db.transaction(['pedidos'], 'readonly');
  const store = transaction.objectStore('pedidos');
  const index = store.index('sincronizado');
  
  return new Promise((resolve, reject) => {
    const request = index.getAll(false);  // false = no sincronizados
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

// 4. MARCAR COMO SINCRONIZADO
const marcarSincronizado = async (pedidoId) => {
  const db = await openDB();
  const transaction = db.transaction(['pedidos'], 'readwrite');
  const store = transaction.objectStore('pedidos');
  
  return new Promise((resolve, reject) => {
    const getRequest = store.get(pedidoId);
    
    getRequest.onsuccess = () => {
      const pedido = getRequest.result;
      pedido.sincronizado = true;
      pedido.sincronizadoEn = new Date().toISOString();
      
      const updateRequest = store.put(pedido);
      updateRequest.onerror = () => reject(updateRequest.error);
      updateRequest.onsuccess = () => resolve(pedido);
    };
    
    getRequest.onerror = () => reject(getRequest.error);
  });
};

// 5. OBTENER TODOS LOS PEDIDOS
const obtenerTodosPedidos = async () => {
  const db = await openDB();
  const transaction = db.transaction(['pedidos'], 'readonly');
  const store = transaction.objectStore('pedidos');
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

// 6. ELIMINAR PEDIDO
const eliminarPedido = async (pedidoId) => {
  const db = await openDB();
  const transaction = db.transaction(['pedidos'], 'readwrite');
  const store = transaction.objectStore('pedidos');
  
  return new Promise((resolve, reject) => {
    const request = store.delete(pedidoId);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(true);
  });
};
```

---

## 🔧 SERVICE WORKER

### ¿Qué es un Service Worker?

```
Es un script que corre en background:

Características:
- Corre independiente de la página
- Persiste aunque cierres navegador
- Puede hacer requests en background
- Puede cachear archivos
- Puede sincronizar datos
- Puede mostrar notificaciones

Ciclo de vida:
1. Instalación (install event)
2. Activación (activate event)
3. Escucha de eventos (fetch, sync, etc.)
```

### Estructura básica

```javascript
// sw.js - Service Worker

// 1. INSTALACIÓN
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/styles.css',
        '/app.js',
        '/manifest.json'
      ]);
    })
  );
  
  // Forzar activación inmediata
  self.skipWaiting();
});

// 2. ACTIVACIÓN
self.addEventListener('activate', (event) => {
  console.log('Service Worker activado');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== 'v1') {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Tomar control de clientes inmediatamente
  self.clients.claim();
});

// 3. INTERCEPTAR REQUESTS
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Solo cachear GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Estrategia: Cache first, network fallback
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;  // Devolver del cache
      }
      
      return fetch(request).then((response) => {
        // Cachear respuesta exitosa
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open('v1').then((cache) => {
            cache.put(request, responseClone);
          });
        }
        
        return response;
      }).catch(() => {
        // Si falla, devolver página offline
        return caches.match('/offline.html');
      });
    })
  );
});

// 4. SINCRONIZACIÓN EN BACKGROUND
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pedidos') {
    event.waitUntil(sincronizarPedidos());
  }
});

// 5. NOTIFICACIONES
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.message,
    icon: '/icon.png',
    badge: '/badge.png'
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
```

### Sincronización en Service Worker

```javascript
// Función de sincronización
const sincronizarPedidos = async () => {
  try {
    // 1. Obtener pedidos no sincronizados
    const db = await openDB();
    const pedidosPendientes = await obtenerPedidosPendientes();
    
    if (pedidosPendientes.length === 0) {
      console.log('No hay pedidos para sincronizar');
      return;
    }
    
    // 2. Preparar batch
    const batch = {
      pedidos: pedidosPendientes.map(p => ({
        clienteId: p.clienteId,
        correriaId: p.correriaId,
        items: p.items,
        fechaInicioDespacho: p.fechaInicioDespacho,
        fechaFinDespacho: p.fechaFinDespacho,
        observaciones: p.observaciones
      }))
    };
    
    // 3. Obtener token
    const token = localStorage.getItem('token');
    
    // 4. Enviar a servidor
    const response = await fetch(
      'https://pedidos.tudominio.com/api/pedidos-pendientes/batch',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(batch)
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    // 5. Marcar como sincronizados
    for (const id of result.ids) {
      await marcarSincronizado(id);
    }
    
    // 6. Notificar a clientes
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_SUCCESS',
        count: result.ids.length,
        timestamp: new Date().toISOString()
      });
    });
    
    console.log(`✅ ${result.ids.length} pedidos sincronizados`);
    
  } catch (error) {
    console.error('Error sincronizando:', error);
    
    // Notificar error a clientes
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_ERROR',
        error: error.message
      });
    });
    
    // Reintentar en 30 segundos
    setTimeout(() => {
      self.registration.sync.register('sync-pedidos');
    }, 30000);
  }
};
```

---

## 🌐 DETECCIÓN DE CONEXIÓN

### Método 1: Evento online/offline

```javascript
// Detectar cambios de conexión
window.addEventListener('online', () => {
  console.log('✅ Conexión restaurada');
  sincronizarPedidos();
});

window.addEventListener('offline', () => {
  console.log('⚠️ Sin conexión');
  mostrarModoOffline();
});

// Verificar estado actual
const estaOnline = () => navigator.onLine;
```

### Método 2: Verificación periódica

```javascript
// Verificar cada 10 segundos
const verificarConexion = setInterval(() => {
  fetch('https://pedidos.tudominio.com/api/health', {
    method: 'HEAD',
    cache: 'no-store'
  })
    .then(() => {
      if (!estaOnline) {
        console.log('✅ Conexión restaurada');
        estaOnline = true;
        sincronizarPedidos();
      }
    })
    .catch(() => {
      if (estaOnline) {
        console.log('⚠️ Sin conexión');
        estaOnline = false;
      }
    });
}, 10000);
```

### Hook React para detección

```typescript
// hooks/useOnlineStatus.ts
import { useState, useEffect } from 'react';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => {
      console.log('✅ Online');
      setIsOnline(true);
    };
    
    const handleOffline = () => {
      console.log('⚠️ Offline');
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
};

// Uso en componente
const TomarPedidoView = () => {
  const isOnline = useOnlineStatus();
  
  return (
    <div>
      {isOnline ? (
        <span className="badge-online">✅ Conectado</span>
      ) : (
        <span className="badge-offline">⚠️ Sin conexión</span>
      )}
    </div>
  );
};
```

---

## 🔄 SINCRONIZACIÓN

### Flujo de sincronización

```
1. DETECTAR CONEXIÓN
   window.addEventListener('online', sincronizar)
   
2. OBTENER PEDIDOS LOCALES
   const pedidos = await obtenerPedidosPendientes()
   
3. PREPARAR BATCH
   const batch = { pedidos: [...] }
   
4. ENVIAR A SERVIDOR
   POST /api/pedidos-pendientes/batch
   
5. PROCESAR RESPUESTA
   if (success) {
     - Marcar como sincronizados
     - Mostrar confirmación
   } else {
     - Reintentar
     - Mostrar error
   }
```

### Sincronización automática

```javascript
// Sincronizar cuando detecta internet
window.addEventListener('online', async () => {
  console.log('Sincronizando...');
  
  try {
    const result = await sincronizarPedidos();
    
    if (result.success) {
      mostrarNotificacion(
        `✅ ${result.enviados} pedidos sincronizados`
      );
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarError('Error sincronizando pedidos');
  }
});

// Sincronización periódica (cada 5 minutos si hay internet)
setInterval(async () => {
  if (navigator.onLine) {
    await sincronizarPedidos();
  }
}, 5 * 60 * 1000);
```

### Sincronización manual

```javascript
// Botón en UI
const handleSincronizar = async () => {
  setLoading(true);
  
  try {
    const result = await sincronizarPedidos();
    
    if (result.success) {
      mostrarNotificacion(
        `✅ ${result.enviados} pedidos sincronizados`
      );
      actualizarUI();
    } else {
      mostrarError(result.error);
    }
  } finally {
    setLoading(false);
  }
};
```

---

## ⚠️ MANEJO DE ERRORES

### Errores de conexión

```javascript
const sincronizarPedidos = async () => {
  const maxReintentos = 5;
  let intento = 0;
  
  while (intento < maxReintentos) {
    try {
      const response = await fetch(
        'https://pedidos.tudominio.com/api/pedidos-pendientes/batch',
        {
          method: 'POST',
          headers: { ... },
          body: JSON.stringify(batch),
          timeout: 10000  // 10 segundos
        }
      );
      
      if (response.ok) {
        return await response.json();
      } else if (response.status === 401) {
        // Token expirado
        throw new Error('Token expirado. Por favor, inicia sesión de nuevo');
      } else if (response.status === 400) {
        // Datos inválidos
        const error = await response.json();
        throw new Error(`Datos inválidos: ${error.message}`);
      } else {
        throw new Error(`Error del servidor: ${response.status}`);
      }
      
    } catch (error) {
      intento++;
      
      if (intento < maxReintentos) {
        // Esperar antes de reintentar (backoff exponencial)
        const espera = Math.pow(2, intento) * 1000;  // 2s, 4s, 8s, 16s
        console.log(`Reintentando en ${espera}ms...`);
        await new Promise(resolve => setTimeout(resolve, espera));
      } else {
        // Máximo de reintentos alcanzado
        console.error('Máximo de reintentos alcanzado');
        throw error;
      }
    }
  }
};
```

### Validación de datos

```javascript
const validarPedido = (pedido) => {
  const errores = [];
  
  if (!pedido.clienteId) {
    errores.push('Cliente es requerido');
  }
  
  if (!pedido.items || pedido.items.length === 0) {
    errores.push('Debe agregar al menos una referencia');
  }
  
  pedido.items?.forEach((item, index) => {
    if (!item.referencia) {
      errores.push(`Item ${index + 1}: Referencia requerida`);
    }
    if (item.cantidad <= 0) {
      errores.push(`Item ${index + 1}: Cantidad debe ser mayor a 0`);
    }
    if (item.precio <= 0) {
      errores.push(`Item ${index + 1}: Precio debe ser mayor a 0`);
    }
  });
  
  if (!pedido.fechaInicioDespacho) {
    errores.push('Fecha inicio despacho es requerida');
  }
  
  if (!pedido.fechaFinDespacho) {
    errores.push('Fecha fin despacho es requerida');
  }
  
  return {
    valido: errores.length === 0,
    errores
  };
};

// Uso
const { valido, errores } = validarPedido(formData);

if (!valido) {
  mostrarErrores(errores);
  return;
}
```

### Recuperación de fallos

```javascript
// Si falla la sincronización, guardar en IndexedDB
const guardarPedidoConRespaldo = async (pedido) => {
  try {
    // Intentar guardar en servidor
    const response = await fetch(
      'https://pedidos.tudominio.com/api/pedidos-pendientes',
      {
        method: 'POST',
        headers: { ... },
        body: JSON.stringify(pedido)
      }
    );
    
    if (response.ok) {
      return { success: true, location: 'servidor' };
    }
  } catch (error) {
    console.log('No se pudo guardar en servidor, guardando localmente');
  }
  
  // Fallback: guardar en IndexedDB
  try {
    const id = await guardarPedido(pedido);
    return { success: true, location: 'local', id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
```

---

## 📊 MONITOREO

### Logging

```javascript
// Crear log de sincronización
const registrarSincronizacion = async (resultado) => {
  const log = {
    timestamp: new Date().toISOString(),
    tipo: resultado.success ? 'exitosa' : 'fallida',
    pedidosEnviados: resultado.enviados || 0,
    error: resultado.error || null
  };
  
  // Guardar en IndexedDB
  const db = await openDB();
  const transaction = db.transaction(['logs'], 'readwrite');
  const store = transaction.objectStore('logs');
  store.add(log);
};

// Obtener historial de sincronización
const obtenerHistorialSincronizacion = async () => {
  const db = await openDB();
  const transaction = db.transaction(['logs'], 'readonly');
  const store = transaction.objectStore('logs');
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};
```

### Estadísticas

```javascript
// Obtener estadísticas
const obtenerEstadisticas = async () => {
  const pedidos = await obtenerTodosPedidos();
  const sincronizados = pedidos.filter(p => p.sincronizado);
  const pendientes = pedidos.filter(p => !p.sincronizado);
  
  return {
    total: pedidos.length,
    sincronizados: sincronizados.length,
    pendientes: pendientes.length,
    porcentajeSincronizacion: (sincronizados.length / pedidos.length * 100).toFixed(2)
  };
};
```

¿Preguntas sobre la implementación offline-first?
