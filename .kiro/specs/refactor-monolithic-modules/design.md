# Design Document: Refactorización de Módulos Monolíticos

## Overview

Este documento describe la arquitectura refactorizada para dividir dos archivos monolíticos en módulos independientes y mantenibles:

**Backend**: Separar `crudController.js` en controladores específicos por entidad (References, Clients, Confeccionistas, Sellers, Correrias)

**Frontend**: Refactorizar `App.tsx` en:
- Context API para estado global
- Hooks personalizados para operaciones CRUD
- Componentes de vista independientes
- Servicios de datos centralizados

La refactorización mantiene compatibilidad con código existente mediante adaptadores y se implementa de forma incremental.

## Architecture

### Backend Architecture

```
backend/src/controllers/
├── entities/
│   ├── references/
│   │   ├── referencesController.js
│   │   ├── referencesValidator.js
│   │   └── referencesService.js
│   ├── clients/
│   │   ├── clientsController.js
│   │   ├── clientsValidator.js
│   │   └── clientsService.js
│   ├── confeccionistas/
│   │   ├── confeccionistasController.js
│   │   ├── confeccionistasValidator.js
│   │   └── confeccionistasService.js
│   ├── sellers/
│   │   ├── sellersController.js
│   │   ├── sellersValidator.js
│   │   └── sellersService.js
│   └── correrias/
│       ├── correriasController.js
│       ├── correriasValidator.js
│       └── correriasService.js
├── shared/
│   ├── errorHandler.js
│   ├── logger.js
│   └── validators.js
└── crudController.js (adaptador de compatibilidad)
```

**Patrón por Entidad**:
- `Controller`: Maneja rutas HTTP y validación de entrada
- `Service`: Lógica de negocio y operaciones de BD
- `Validator`: Reglas de validación centralizadas

### Frontend Architecture

```
src/
├── context/
│   ├── AppContext.tsx
│   ├── AppProvider.tsx
│   └── useAppContext.ts
├── hooks/
│   ├── useCRUD.ts
│   ├── useReferences.ts
│   ├── useClients.ts
│   ├── useConfeccionistas.ts
│   ├── useSellers.ts
│   ├── useCorrerias.ts
│   └── useDataLoader.ts
├── services/
│   ├── dataService.ts
│   ├── entityService.ts
│   └── api.ts (existente, mejorado)
├── views/
│   ├── App.tsx (refactorizado)
│   ├── ReceptionView.tsx
│   ├── DispatchView.tsx
│   ├── InventoryView.tsx
│   ├── OrdersView.tsx
│   ├── MastersView.tsx
│   └── ... (otras vistas)
└── types/
    └── index.ts (tipos compartidos)
```

**Patrón por Hook**:
- `useCRUD`: Hook genérico para operaciones CRUD
- `useReferences`, `useClients`, etc.: Hooks específicos por entidad
- `useDataLoader`: Hook para carga inicial de datos

## Components and Interfaces

### Backend - Entity Controller Pattern

```typescript
// Interfaz estándar para todos los controladores
interface EntityController {
  list(req, res): void;
  create(req, res): void;
  read(req, res): void;
  update(req, res): void;
  delete(req, res): void;
}

// Respuesta estándar
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Validador estándar
interface EntityValidator {
  validateCreate(data: any): ValidationResult;
  validateUpdate(data: any): ValidationResult;
  validateDelete(id: string): ValidationResult;
}

interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}
```

### Frontend - Hook Pattern

```typescript
// Hook genérico CRUD
interface UseCRUD<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  create(item: T): Promise<T>;
  read(id: string): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  list(): Promise<T[]>;
}

// Hook específico de entidad
interface UseEntity<T> extends UseCRUD<T> {
  refresh(): Promise<void>;
  clearError(): void;
}

// Context de estado global
interface AppContextType {
  state: AppState;
  dispatch: (action: AppAction) => void;
  loading: boolean;
  error: string | null;
}

interface AppState {
  users: User[];
  references: Reference[];
  clients: Client[];
  confeccionistas: Confeccionista[];
  sellers: Seller[];
  correrias: Correria[];
  receptions: Reception[];
  returnReceptions: ReturnReception[];
  dispatches: Dispatch[];
  orders: Order[];
  productionTracking: ProductionTracking[];
}

interface AppAction {
  type: 'SET_USERS' | 'SET_REFERENCES' | 'SET_CLIENTS' | ...;
  payload: any;
}
```

### Logging System

```typescript
interface Logger {
  debug(message: string, context?: any): void;
  info(message: string, context?: any): void;
  warn(message: string, context?: any): void;
  error(message: string, error?: Error, context?: any): void;
}

// Niveles de logging
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}
```

## Data Models

### Backend Data Models

```typescript
// Reference (Producto/Prenda)
interface Reference {
  id: string;
  description: string;
  price: number;
  designer: string;
  cloth1?: string;
  avgCloth1?: number;
  cloth2?: string;
  avgCloth2?: number;
  correrias: string[]; // Array de IDs de correrías
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Client
interface Client {
  id: string;
  name: string;
  nit: string;
  address: string;
  city: string;
  seller: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Confeccionista
interface Confeccionista {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  score: 'A' | 'AA' | 'AAA' | 'NA';
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Seller
interface Seller {
  id: string;
  name: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Correria
interface Correria {
  id: string;
  name: string;
  year: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Frontend Data Models

Los modelos frontend son idénticos a los del backend, con tipos TypeScript adicionales para UI:

```typescript
interface UIState {
  activeTab: string;
  isNavOpen: boolean;
  isLoading: boolean;
  selectedEntity?: string;
  filters?: Record<string, any>;
}
```

## Error Handling

### Backend Error Handling

```typescript
// Errores estándar
class ValidationError extends Error {
  constructor(public errors: Record<string, string>) {
    super('Validation failed');
  }
}

class NotFoundError extends Error {
  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} not found`);
  }
}

class DatabaseError extends Error {
  constructor(message: string, public originalError: Error) {
    super(message);
  }
}

// Middleware de manejo de errores
function errorHandler(err: Error, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors
    });
  }
  
  if (err instanceof NotFoundError) {
    return res.status(404).json({
      success: false,
      message: err.message
    });
  }
  
  // Error genérico
  logger.error('Unhandled error', err);
  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
}
```

### Frontend Error Handling

```typescript
// Hook para manejo de errores
function useErrorHandler() {
  const [error, setError] = useState<string | null>(null);
  
  const handleError = (err: Error) => {
    logger.error('Operation failed', err);
    setError(err.message);
  };
  
  const clearError = () => setError(null);
  
  return { error, handleError, clearError };
}

// Retry logic para operaciones fallidas
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

## Testing Strategy

### Unit Testing

**Backend**:
- Validadores: Probar reglas de validación con datos válidos e inválidos
- Servicios: Probar lógica de negocio sin BD (mocks)
- Controladores: Probar respuestas HTTP y manejo de errores

**Frontend**:
- Hooks: Probar lógica de estado y efectos
- Componentes: Probar renderizado y interacciones
- Servicios: Probar llamadas a API (mocks)

### Property-Based Testing

**Backend**:
- Validación round-trip: Validar → Guardar → Recuperar → Validar
- Invariantes: Datos siempre cumplen reglas de negocio
- Idempotencia: Operaciones repetidas producen mismo resultado

**Frontend**:
- Estado consistency: Cambios de estado son consistentes
- Hook behavior: Hooks siempre retornan estado válido
- UI updates: Cambios de estado reflejan en UI

### Integration Testing

- Flujos completos: Crear → Leer → Actualizar → Eliminar
- Sincronización: Estado global y componentes sincronizados
- Compatibilidad: Código antiguo funciona con nueva arquitectura

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Backend Properties

**Property 1: CRUD Round Trip Consistency**
*For any* valid entity data, creating it, reading it back, and comparing should produce equivalent data (allowing for system-generated fields like timestamps)
**Validates: Requirements 1.1, 1.2, 1.4**

**Property 2: Validation Consistency**
*For any* invalid input, the validator should reject it consistently regardless of how many times it's called
**Validates: Requirements 1.3, 8.1**

**Property 3: Error Response Format**
*For any* error condition, the API should return a response with structure {success: false, message: string, error?: string}
**Validates: Requirements 1.5, 9.1**

**Property 4: Data Integrity After Update**
*For any* entity, updating a field should not affect other fields or related entities
**Validates: Requirements 1.2, 8.2**

**Property 5: Deletion Idempotence**
*For any* entity, deleting it twice should produce the same result (first succeeds, second returns 404)
**Validates: Requirements 1.1, 6.1**

### Frontend Properties

**Property 6: State Consistency**
*For any* state update, all components subscribed to that state should receive the same data
**Validates: Requirements 2.2, 2.4**

**Property 7: Hook Data Freshness**
*For any* hook operation (create, update, delete), the returned data should match what's in the backend
**Validates: Requirements 3.1, 3.2**

**Property 8: UI Reflects State**
*For any* state change, the UI should reflect that change within 100ms
**Validates: Requirements 2.2, 4.4**

**Property 9: Hook Cleanup**
*For any* component using a hook, unmounting should cancel pending requests and clean up resources
**Validates: Requirements 3.5**

**Property 10: Backward Compatibility**
*For any* existing code calling the old API, it should work identically with the new architecture
**Validates: Requirements 5.1, 5.2, 5.3**

## Implementation Approach

### Phase 1: Backend Refactoring (Weeks 1-2)

1. Crear estructura de directorios para entidades
2. Implementar validadores centralizados
3. Crear servicios por entidad
4. Crear controladores por entidad
5. Crear adaptador de compatibilidad en crudController.js
6. Tests de integración para validar compatibilidad

### Phase 2: Frontend State Management (Weeks 2-3)

1. Crear AppContext y AppProvider
2. Migrar estado global a Context
3. Crear hooks genéricos (useCRUD)
4. Crear hooks específicos por entidad
5. Actualizar App.tsx para usar Context
6. Tests de estado y sincronización

### Phase 3: Frontend Component Refactoring (Weeks 3-4)

1. Extraer lógica de vistas a componentes independientes
2. Actualizar vistas para usar hooks
3. Remover callbacks inline
4. Implementar manejo de errores consistente
5. Tests de componentes y integración

### Phase 4: Logging y Debugging (Week 4)

1. Implementar sistema de logging centralizado
2. Agregar logs a operaciones CRUD
3. Agregar logs a cambios de estado
4. Configurar niveles de logging por ambiente
5. Tests de logging

### Phase 5: Documentación (Week 5)

1. Documentar arquitectura
2. Crear guías de uso para hooks
3. Crear checklist para agregar nuevas entidades
4. Documentar patrones comunes
5. Crear guías de troubleshooting

## Migration Strategy

### Backward Compatibility Layer

El archivo `crudController.js` se convierte en un adaptador que:
1. Importa funciones de los nuevos controladores
2. Expone la misma interfaz pública
3. Traduce entre formatos antiguo y nuevo si es necesario
4. Permite que código antiguo funcione sin cambios

```javascript
// crudController.js (adaptador)
const referencesController = require('./entities/references/referencesController');
const clientsController = require('./entities/clients/clientsController');
// ... etc

module.exports = {
  // Referencias
  getReferences: referencesController.list,
  createReference: referencesController.create,
  updateReference: referencesController.update,
  deleteReference: referencesController.delete,
  getCorreriaReferences: referencesController.getCorreriaReferences,
  
  // Clientes
  getClients: clientsController.list,
  createClient: clientsController.create,
  updateClient: clientsController.update,
  deleteClient: clientsController.delete,
  
  // ... etc
};
```

### Incremental Migration

1. **Paso 1**: Crear nuevos módulos sin eliminar código antiguo
2. **Paso 2**: Actualizar rutas para usar nuevos módulos
3. **Paso 3**: Mantener adaptador de compatibilidad
4. **Paso 4**: Migrar componentes frontend gradualmente
5. **Paso 5**: Eliminar código antiguo cuando todo esté migrado

### Testing During Migration

- Tests de integración validan que comportamiento es idéntico
- Tests de compatibilidad verifican que código antiguo funciona
- Tests de propiedades validan correctness de nueva arquitectura
- Ejecución de tests después de cada cambio

## Documentation Structure

```
docs/
├── ARCHITECTURE.md
│   ├── Backend structure
│   ├── Frontend structure
│   └── Data flow
├── PATTERNS.md
│   ├── Backend patterns
│   ├── Frontend hooks
│   └── Common operations
├── ADDING_ENTITIES.md
│   ├── Backend checklist
│   ├── Frontend checklist
│   └── Testing checklist
├── TROUBLESHOOTING.md
│   ├── Common issues
│   ├── Debugging tips
│   └── Performance tips
└── API_REFERENCE.md
    ├── Endpoints
    ├── Request/Response formats
    └── Error codes
```

## Performance Considerations

1. **Lazy Loading**: Cargar datos solo cuando se necesitan
2. **Memoization**: Cachear resultados de operaciones costosas
3. **Batch Operations**: Agrupar múltiples operaciones en una sola llamada
4. **Debouncing**: Debounce en búsquedas y filtros
5. **Connection Pooling**: Reutilizar conexiones a BD

## Security Considerations

1. **Input Validation**: Validar todos los inputs en backend
2. **SQL Injection Prevention**: Usar prepared statements
3. **CORS**: Configurar CORS correctamente
4. **Authentication**: Validar autenticación en cada endpoint
5. **Authorization**: Validar permisos por rol
6. **Error Messages**: No exponer detalles internos en errores
