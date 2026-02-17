# Guía: Agregar Nuevas Entidades

## Checklist Backend

### 1. Crear Estructura de Directorios

```bash
mkdir -p backend/src/controllers/entities/myentity
```

### 2. Crear Validador

Archivo: `backend/src/controllers/entities/myentity/myentityValidator.js`

```javascript
const { validateRequired, validateString, validateNumber } = require('../../shared/validators');
const { ValidationError } = require('../../shared/errorHandler');

const validateCreateMyEntity = (data) => {
  const errors = {};
  
  // Validar campos requeridos
  const nameResult = validateString(data.name, 'Name', 1, 100);
  if (!nameResult.valid) errors.name = nameResult.error;
  
  // Validar campos opcionales
  if (data.description) {
    const descResult = validateString(data.description, 'Description', 0, 500);
    if (!descResult.valid) errors.description = descResult.error;
  }
  
  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }
};

const validateUpdateMyEntity = (data) => {
  // Similar a validateCreate pero para actualizaciones
  validateCreateMyEntity(data);
};

const validateMyEntityId = (id) => {
  const result = validateRequired(id, 'ID');
  if (!result.valid) throw new ValidationError({ id: result.error });
};

module.exports = {
  validateCreateMyEntity,
  validateUpdateMyEntity,
  validateMyEntityId
};
```

### 3. Crear Servicio

Archivo: `backend/src/controllers/entities/myentity/myentityService.js`

```javascript
const db = require('../../../db');
const logger = require('../../shared/logger');
const { NotFoundError } = require('../../shared/errorHandler');

const getAllMyEntities = () => {
  logger.debug('Fetching all MyEntities');
  return db.myentities || [];
};

const getMyEntityById = (id) => {
  logger.debug(`Fetching MyEntity: ${id}`);
  const entity = (db.myentities || []).find(e => e.id === id);
  
  if (!entity) {
    throw new NotFoundError('MyEntity', id);
  }
  
  return entity;
};

const createMyEntity = (data) => {
  logger.info('Creating new MyEntity', { data });
  
  const entity = {
    id: Math.random().toString(36).substr(2, 9),
    ...data,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  if (!db.myentities) db.myentities = [];
  db.myentities.push(entity);
  
  logger.info(`MyEntity created: ${entity.id}`);
  return entity;
};

const updateMyEntity = (id, data) => {
  logger.info(`Updating MyEntity: ${id}`, { data });
  
  const entity = getMyEntityById(id);
  const updated = {
    ...entity,
    ...data,
    id: entity.id, // No cambiar ID
    createdAt: entity.createdAt, // No cambiar fecha de creación
    updatedAt: new Date().toISOString()
  };
  
  const index = db.myentities.findIndex(e => e.id === id);
  db.myentities[index] = updated;
  
  logger.info(`MyEntity updated: ${id}`);
  return updated;
};

const deleteMyEntity = (id) => {
  logger.info(`Deleting MyEntity: ${id}`);
  
  getMyEntityById(id); // Validar que existe
  
  db.myentities = db.myentities.filter(e => e.id !== id);
  
  logger.info(`MyEntity deleted: ${id}`);
};

module.exports = {
  getAllMyEntities,
  getMyEntityById,
  createMyEntity,
  updateMyEntity,
  deleteMyEntity
};
```

### 4. Crear Controlador

Archivo: `backend/src/controllers/entities/myentity/myentityController.js`

```javascript
const {
  validateCreateMyEntity,
  validateUpdateMyEntity,
  validateMyEntityId
} = require('./myentityValidator');
const {
  getAllMyEntities,
  getMyEntityById,
  createMyEntity,
  updateMyEntity,
  deleteMyEntity
} = require('./myentityService');
const logger = require('../../shared/logger');

const list = (req, res) => {
  try {
    logger.info('Listing all MyEntities');
    const entities = getAllMyEntities();
    return res.json({
      success: true,
      data: entities
    });
  } catch (error) {
    logger.error('Error listing MyEntities', error);
    return res.status(500).json({
      success: false,
      message: 'Error listing MyEntities'
    });
  }
};

const read = (req, res) => {
  try {
    const { id } = req.params;
    validateMyEntityId(id);
    
    const entity = getMyEntityById(id);
    return res.json({
      success: true,
      data: entity
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    logger.error('Error reading MyEntity', error);
    return res.status(500).json({
      success: false,
      message: 'Error reading MyEntity'
    });
  }
};

const create = (req, res) => {
  try {
    validateCreateMyEntity(req.body);
    
    const entity = createMyEntity(req.body);
    return res.status(201).json({
      success: true,
      data: entity,
      message: 'MyEntity created successfully'
    });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
        errors: error.errors
      });
    }
    logger.error('Error creating MyEntity', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating MyEntity'
    });
  }
};

const update = (req, res) => {
  try {
    const { id } = req.params;
    validateMyEntityId(id);
    validateUpdateMyEntity(req.body);
    
    const entity = updateMyEntity(id, req.body);
    return res.json({
      success: true,
      data: entity,
      message: 'MyEntity updated successfully'
    });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
        errors: error.errors
      });
    }
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    logger.error('Error updating MyEntity', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating MyEntity'
    });
  }
};

const delete_ = (req, res) => {
  try {
    const { id } = req.params;
    validateMyEntityId(id);
    
    deleteMyEntity(id);
    return res.json({
      success: true,
      message: 'MyEntity deleted successfully'
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    logger.error('Error deleting MyEntity', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting MyEntity'
    });
  }
};

module.exports = {
  list,
  read,
  create,
  update,
  delete: delete_
};
```

### 5. Actualizar crudController.js

```javascript
// Agregar al inicio
const myentityController = require('./entities/myentity/myentityController');

// Agregar exportaciones
const getMyEntities = myentityController.list;
const createMyEntity = myentityController.create;
const updateMyEntity = myentityController.update;
const deleteMyEntity = myentityController.delete;

// Agregar a module.exports
module.exports = {
  // ... existentes
  getMyEntities,
  createMyEntity,
  updateMyEntity,
  deleteMyEntity
};
```

### 6. Agregar Rutas en app.js

```javascript
const myentityController = require('./controllers/entities/myentity/myentityController');

// Rutas CRUD
app.get('/api/myentities', myentityController.list);
app.get('/api/myentities/:id', myentityController.read);
app.post('/api/myentities', myentityController.create);
app.put('/api/myentities/:id', myentityController.update);
app.delete('/api/myentities/:id', myentityController.delete);
```

## Checklist Frontend

### 1. Agregar Tipo

Archivo: `src/types/index.ts`

```typescript
export interface MyEntity {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### 2. Crear Hook

Archivo: `src/hooks/useMyEntity.ts`

```typescript
import { useCRUD } from './useCRUD';
import { myEntityAPI } from '../services/api';

export function useMyEntity() {
  return useCRUD(myEntityAPI, 'MY_ENTITIES');
}
```

### 3. Actualizar Context

Archivo: `src/context/AppContext.tsx`

```typescript
export interface AppState {
  // ... existentes
  myEntities: MyEntity[];
}

export type AppAction = 
  | { type: 'SET_MY_ENTITIES'; payload: MyEntity[] }
  // ... existentes
```

### 4. Actualizar Reducer

```typescript
const reducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_MY_ENTITIES':
      return { ...state, myEntities: action.payload };
    // ... existentes
    default:
      return state;
  }
};
```

### 5. Usar en Componentes

```typescript
import { useMyEntity } from '../hooks/useMyEntity';

const MyComponent = () => {
  const { items, create, update, delete: deleteItem } = useMyEntity();
  
  return (
    <div>
      {items.map(entity => (
        <div key={entity.id}>{entity.name}</div>
      ))}
    </div>
  );
};
```

## Verificación

### Backend

```bash
# Probar endpoints
curl http://localhost:3001/api/myentities
curl -X POST http://localhost:3001/api/myentities \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'
```

### Frontend

```typescript
// En consola del navegador
const { items } = useMyEntity();
console.log(items); // Debe mostrar datos
```

## Troubleshooting

### Error: "Cannot find module"

- Verificar que los archivos están en la ubicación correcta
- Verificar que los imports usan rutas relativas correctas

### Error: "Validation failed"

- Revisar que los datos cumplen con las reglas de validación
- Verificar que los campos requeridos están presentes

### Hook no funciona

- Asegúrate de que el componente está dentro de `AppProvider`
- Verificar que el tipo está agregado a `AppState`
- Verificar que el reducer maneja la acción

## Próximos Pasos

1. Agregar tests unitarios
2. Agregar tests de integración
3. Documentar endpoints en Swagger
4. Agregar validaciones adicionales si es necesario
