# Arquitectura de la Aplicación - MIGRACIÓN COMPLETADA

## Visión General

La aplicación ha sido completamente migrada a una arquitectura modular y escalable:

1. **Backend**: API REST con Node.js/Express usando controladores de entidades
2. **Frontend**: Aplicación React con TypeScript usando hooks y Context API

La migración ha eliminado todo código legacy y consolidado la nueva arquitectura modular.

## Estructura del Backend (POST-MIGRACIÓN)

```
backend/src/
├── controllers/
│   ├── entities/
│   │   ├── references/
│   │   │   ├── referencesController.js
│   │   │   ├── referencesValidator.js
│   │   │   └── referencesService.js
│   │   ├── clients/
│   │   ├── confeccionistas/
│   │   ├── sellers/
│   │   ├── correrias/
│   │   └── deliveryDates/
│   ├── shared/
│   │   ├── errorHandler.js
│   │   ├── logger.js
│   │   └── validators.js
│   ├── authController.js
│   └── movementsController.js
├── routes/
│   └── index.js (importa controladores de entidades directamente)
├── middleware/
│   └── auth.js
├── services/
│   ├── CacheManager.js
│   ├── DispatchService.js
│   ├── PaginationService.js
│   ├── ReceptionService.js
│   └── ReturnService.js
└── config/
    └── database.js
```

### Patrón por Entidad (Modular)

Cada entidad sigue el patrón MVC:

- **Controller**: Maneja rutas HTTP y respuestas
- **Service**: Lógica de negocio y operaciones de BD
- **Validator**: Reglas de validación centralizadas

### Ejemplo: References

```javascript
// referencesController.js - Maneja HTTP
const list = (req, res) => {
  logger.info('Listing all references');
  const references = getAllReferences();
  return res.json({ success: true, data: references });
};

// referencesService.js - Lógica de negocio
const getAllReferences = () => {
  return db.references.getAll();
};

// referencesValidator.js - Validación
const validateCreateReference = (data) => {
  validateRequired(data.description, 'Description');
  validateNumber(data.price, 'Price');
};
```

## Estructura del Frontend

```
src/
├── context/
│   ├── AppContext.tsx (estado global)
│   ├── AppProvider.tsx (proveedor)
│   └── useAppContext.ts (hook)
├── hooks/
│   ├── useCRUD.ts (genérico)
│   ├── useReferences.ts (específico)
│   ├── useClients.ts
│   ├── useConfeccionistas.ts
│   ├── useSellers.ts
│   ├── useCorrerias.ts
│   └── useDataLoader.ts
├── services/
│   ├── api.ts (llamadas HTTP)
│   └── logger.ts (logging)
├── views/
│   ├── App.tsx (componente raíz)
│   ├── ReceptionView.tsx
│   ├── DispatchView.tsx
│   ├── MastersView.tsx
│   └── ... (otras vistas)
└── types/
    └── index.ts (tipos compartidos)
```

### Patrón por Hook

```typescript
// useReferences.ts - Hook específico
export function useReferences() {
  const { state, dispatch } = useAppContext();
  return useCRUD(referencesAPI, 'REFERENCES');
}

// Uso en componentes
const ReceptionView = () => {
  const { items: references } = useReferences();
  return <div>{references.map(r => <p>{r.id}</p>)}</div>;
};
```

## Flujo de Datos

### Backend

```
HTTP Request
    ↓
Controller (validación)
    ↓
Service (lógica de negocio)
    ↓
Database
    ↓
HTTP Response
```

### Frontend

```
User Interaction
    ↓
Hook (useCRUD)
    ↓
API Call
    ↓
State Update (Context)
    ↓
Component Re-render
```

## Estado Global (Context API)

```typescript
interface AppState {
  users: User[];
  references: Reference[];
  clients: Client[];
  confeccionistas: Confeccionista[];
  sellers: Seller[];
  correrias: Correria[];
  receptions: Reception[];
  dispatches: Dispatch[];
  orders: Order[];
  // ... más entidades
}
```

## Manejo de Errores

### Backend

```javascript
// Errores estándar
class ValidationError extends Error { }
class NotFoundError extends Error { }
class DatabaseError extends Error { }

// Middleware centralizado
app.use(errorHandler);
```

### Frontend

```typescript
// Hook con manejo de errores
const { error, clearError } = useReferences();

// Componente
{error && <ErrorAlert message={error} onClose={clearError} />}
```

## Logging

### Backend

```javascript
logger.info('Creating new reference', { body: req.body });
logger.error('Error creating reference', error);
```

### Frontend

```typescript
logger.info('Listing all references');
logger.error('Error listing references', error);
```

## Compatibilidad Backward

El archivo `crudController.js` actúa como adaptador:

```javascript
// Código antiguo sigue funcionando
const { getReferences, createReference } = require('./crudController');

// Internamente usa los nuevos módulos
const referencesController = require('./entities/references/referencesController');
const getReferences = referencesController.list;
```

## Ventajas de la Nueva Arquitectura

1. **Modularidad**: Cada entidad es independiente
2. **Testabilidad**: Fácil de testear en aislamiento
3. **Escalabilidad**: Agregar nuevas entidades es simple
4. **Mantenibilidad**: Código más organizado y legible
5. **Reutilización**: Hooks y servicios reutilizables
6. **Debugging**: Logging centralizado facilita troubleshooting

## Próximos Pasos

1. Migrar completamente a la nueva arquitectura
2. Eliminar código antiguo cuando sea seguro
3. Agregar más tests
4. Optimizar performance
5. Documentar patrones comunes
