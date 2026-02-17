# Contextos Especializados

Este directorio contiene 7 contextos especializados que dividen el estado global de la aplicación para mejorar el rendimiento y la mantenibilidad.

## Contextos Disponibles

### 1. AuthContext
Gestiona la autenticación y autorización del usuario.

**Características:**
- Usuario actual
- Permisos del usuario
- Estado de autenticación
- Métodos: login, logout, hasPermission

**Uso:**
```typescript
import { useAuth } from './context';

const MyComponent = () => {
  const { user, isAuthenticated, hasPermission, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }
  
  return <div>Welcome {user?.name}</div>;
};
```

### 2. MastersContext
Gestiona datos maestros: Clientes, Vendedores y Confeccionistas.

**Características:**
- Lista de clientes, vendedores y confeccionistas
- Métodos CRUD para cada entidad
- Estado de carga y errores
- Integración con caché

**Uso:**
```typescript
import { useMasters } from './context';

const ClientsComponent = () => {
  const { clients, loading, createClient, updateClient, deleteClient } = useMasters();
  
  return (
    <div>
      {loading ? <div>Loading...</div> : (
        <ul>
          {clients.map(client => (
            <li key={client.id}>{client.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

### 3. OrdersContext
Gestiona órdenes y sus estados.

**Características:**
- Lista de órdenes
- Órdenes agrupadas por estado
- Métodos CRUD para órdenes
- Estado de carga y errores

**Uso:**
```typescript
import { useOrders } from './context';

const OrdersComponent = () => {
  const { orders, createOrder, updateOrder, deleteOrder } = useOrders();
  
  return (
    <div>
      {orders.map(order => (
        <div key={order.id}>{order.id}</div>
      ))}
    </div>
  );
};
```

### 4. DeliveryDatesContext
Gestiona fechas de entrega.

**Características:**
- Lista de fechas de entrega
- Métodos CRUD para fechas de entrega
- Paginación
- Estado de carga y errores

**Uso:**
```typescript
import { useDeliveryDates } from './context';

const DeliveryDatesComponent = () => {
  const { deliveryDates, fetchDeliveryDates, createDeliveryDate } = useDeliveryDates();
  
  return (
    <div>
      {deliveryDates.map(date => (
        <div key={date.id}>{date.expectedDate}</div>
      ))}
    </div>
  );
};
```

### 5. ReferencesContext
Gestiona referencias de productos.

**Características:**
- Lista de referencias
- Métodos CRUD para referencias
- Paginación
- Estado de carga y errores

**Uso:**
```typescript
import { useReferences } from './context';

const ReferencesComponent = () => {
  const { references, fetchReferences, createReference } = useReferences();
  
  return (
    <div>
      {references.map(ref => (
        <div key={ref.id}>{ref.description}</div>
      ))}
    </div>
  );
};
```

### 6. UIContext
Gestiona estado de UI: modales, notificaciones y filtros.

**Características:**
- Control de modales (abrir, cerrar, toggle)
- Notificaciones (agregar, remover)
- Filtros (establecer, limpiar)
- Auto-cierre de notificaciones

**Uso:**
```typescript
import { useUI } from './context';

const UIComponent = () => {
  const { 
    modals, 
    openModal, 
    closeModal, 
    addNotification, 
    setFilter 
  } = useUI();
  
  return (
    <div>
      <button onClick={() => openModal('myModal')}>Open Modal</button>
      <button onClick={() => addNotification({
        message: 'Success!',
        type: 'success',
        duration: 3000
      })}>
        Show Notification
      </button>
    </div>
  );
};
```

### 7. CacheContext
Gestiona el estado y control del sistema de caché.

**Características:**
- Estadísticas de caché (tamaño, hits, misses)
- Habilitar/deshabilitar caché
- Limpiar caché
- Invalidar patrones de caché

**Uso:**
```typescript
import { useCache } from './context';

const CacheComponent = () => {
  const { 
    cacheStats, 
    isCacheEnabled, 
    enableCache, 
    disableCache, 
    clearCache 
  } = useCache();
  
  return (
    <div>
      <p>Cache Size: {cacheStats.size}</p>
      <p>Cache Hits: {cacheStats.hits}</p>
      <p>Cache Misses: {cacheStats.misses}</p>
      <button onClick={clearCache}>Clear Cache</button>
    </div>
  );
};
```

## Ventajas de los Contextos Especializados

1. **Mejor Rendimiento**: Cada contexto es independiente, evitando re-renders innecesarios
2. **Mejor Mantenibilidad**: Código más organizado y fácil de entender
3. **Reutilización**: Cada contexto puede usarse en diferentes componentes
4. **Escalabilidad**: Fácil agregar nuevos contextos sin afectar los existentes
5. **Testabilidad**: Cada contexto puede testearse independientemente

## Optimizaciones Implementadas

- **useMemo**: Memorizamos el valor del contexto para evitar re-renders
- **useCallback**: Memorizamos las funciones para evitar recrearlas en cada render
- **useReducer**: Usamos reducer para manejar estado complejo de forma eficiente

## Estructura de Archivos

```
src/context/
├── AuthContext.tsx              # Contexto de autenticación
├── MastersContext.tsx           # Contexto de datos maestros
├── OrdersContext.tsx            # Contexto de órdenes
├── DeliveryDatesContext.tsx     # Contexto de fechas de entrega
├── ReferencesContext.tsx        # Contexto de referencias
├── UIContext.tsx                # Contexto de UI
├── CacheContext.tsx             # Contexto de caché
├── useContexts.ts               # Hooks personalizados
├── index.ts                     # Exportaciones
├── AuthContext.test.tsx         # Tests para AuthContext
├── MastersContext.test.tsx      # Tests para MastersContext
├── OrdersContext.test.tsx       # Tests para OrdersContext
├── DeliveryDatesContext.test.tsx # Tests para DeliveryDatesContext
├── ReferencesContext.test.tsx   # Tests para ReferencesContext
├── UIContext.test.tsx           # Tests para UIContext
├── CacheContext.test.tsx        # Tests para CacheContext
└── README.md                    # Este archivo
```

## Próximos Pasos

1. Integrar los contextos en el App.tsx como providers
2. Conectar los contextos con los endpoints del backend
3. Implementar paginación en los contextos
4. Agregar property-based tests para validar propiedades universales
5. Integrar con el sistema de caché del backend
