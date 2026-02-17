# Patrones de Desarrollo

## Backend Patterns

### 1. Crear un Nuevo Controlador

```javascript
// backend/src/controllers/entities/myentity/myentityController.js
const { validateCreateMyEntity } = require('./myentityValidator');
const { createMyEntity, getMyEntity } = require('./myentityService');
const logger = require('../../shared/logger');

const create = (req, res) => {
  try {
    logger.info('Creating new MyEntity', { body: req.body });
    validateCreateMyEntity(req.body);
    
    const entity = createMyEntity(req.body);
    logger.info(`MyEntity created: ${entity.id}`);
    
    return res.status(201).json({
      success: true,
      data: entity
    });
  } catch (error) {
    logger.error('Error creating MyEntity', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating MyEntity'
    });
  }
};

module.exports = { create };
```

### 2. Crear un Validador

```javascript
// backend/src/controllers/entities/myentity/myentityValidator.js
const { validateRequired, validateString } = require('../../shared/validators');
const { ValidationError } = require('../../shared/errorHandler');

const validateCreateMyEntity = (data) => {
  const errors = {};
  
  const nameResult = validateString(data.name, 'Name', 1, 100);
  if (!nameResult.valid) errors.name = nameResult.error;
  
  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }
};

module.exports = { validateCreateMyEntity };
```

### 3. Crear un Servicio

```javascript
// backend/src/controllers/entities/myentity/myentityService.js
const db = require('../../../db');
const logger = require('../../shared/logger');

const createMyEntity = (data) => {
  logger.info('Creating MyEntity in database', { data });
  
  const entity = {
    id: generateId(),
    ...data,
    createdAt: new Date().toISOString()
  };
  
  db.myentities.push(entity);
  logger.info(`MyEntity created in database: ${entity.id}`);
  
  return entity;
};

module.exports = { createMyEntity };
```

## Frontend Patterns

### 1. Crear un Hook Específico

```typescript
// src/hooks/useMyEntity.ts
import { useCRUD } from './useCRUD';
import { myEntityAPI } from '../services/api';

export function useMyEntity() {
  return useCRUD(myEntityAPI, 'MY_ENTITIES', {
    onSuccess: (data) => {
      console.log('MyEntity operation succeeded', data);
    },
    onError: (error) => {
      console.error('MyEntity operation failed', error);
    }
  });
}
```

### 2. Usar Hook en Componente

```typescript
// src/views/MyView.tsx
import React from 'react';
import { useMyEntity } from '../hooks/useMyEntity';

const MyView: React.FC = () => {
  const { items, loading, error, create, update, delete: deleteItem } = useMyEntity();
  
  const handleCreate = async () => {
    try {
      const newItem = await create({ name: 'New Item' });
      console.log('Created:', newItem);
    } catch (err) {
      console.error('Failed to create:', err);
    }
  };
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <button onClick={handleCreate}>Create</button>
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
};

export default MyView;
```

### 3. Usar Context Directamente

```typescript
// Cuando necesitas acceso directo al estado global
import { useAppContext } from '../context/useAppContext';

const MyComponent = () => {
  const { state, dispatch } = useAppContext();
  
  // Acceder a datos
  const references = state.references;
  
  // Actualizar estado
  dispatch({
    type: 'SET_REFERENCES',
    payload: [...references, newReference]
  });
  
  return <div>{references.length} referencias</div>;
};
```

## Patrones Comunes

### 1. Validación en Cascada

```javascript
// Backend
const validateCreateReference = (data) => {
  const errors = {};
  
  // Validar campos requeridos
  if (!data.description) errors.description = 'Required';
  if (!data.price) errors.price = 'Required';
  
  // Validar tipos
  if (typeof data.price !== 'number') errors.price = 'Must be a number';
  
  // Validar rangos
  if (data.price < 0) errors.price = 'Must be positive';
  
  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }
};
```

### 2. Manejo de Errores Consistente

```typescript
// Frontend
const handleOperation = async () => {
  try {
    const result = await operation();
    logger.info('Operation succeeded', result);
    // Mostrar éxito
  } catch (error) {
    logger.error('Operation failed', error);
    // Mostrar error al usuario
    setError(error.message);
  }
};
```

### 3. Logging de Operaciones CRUD

```javascript
// Backend
const create = (req, res) => {
  logger.info('CREATE operation started', { entity: 'Reference', body: req.body });
  
  try {
    const result = createReference(req.body);
    logger.info('CREATE operation succeeded', { entity: 'Reference', id: result.id });
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    logger.error('CREATE operation failed', error, { entity: 'Reference' });
    return res.status(500).json({ success: false, message: 'Error' });
  }
};
```

### 4. Actualización de Estado Global

```typescript
// Frontend
const handleCreate = async (item: Reference) => {
  const newItem = await create(item);
  
  // El hook automáticamente actualiza el estado global
  // Pero si necesitas hacerlo manualmente:
  dispatch({
    type: 'SET_REFERENCES',
    payload: [...state.references, newItem]
  });
};
```

## Mejores Prácticas

### Backend

1. **Siempre validar entrada**: Usar validadores centralizados
2. **Loguear operaciones**: Especialmente errores y cambios importantes
3. **Manejar errores consistentemente**: Usar clases de error estándar
4. **Separar responsabilidades**: Controller → Service → Database
5. **Reutilizar código**: Usar funciones de validación compartidas

### Frontend

1. **Usar hooks para lógica**: No duplicar código en componentes
2. **Mantener estado centralizado**: Usar Context API
3. **Loguear operaciones**: Especialmente en desarrollo
4. **Manejar errores**: Mostrar mensajes claros al usuario
5. **Limpiar recursos**: Cancelar requests pendientes al desmontar

## Ejemplos Completos

### Agregar Nueva Entidad (Backend)

1. Crear directorio: `backend/src/controllers/entities/newentity/`
2. Crear archivos:
   - `newentityValidator.js`
   - `newentityService.js`
   - `newentityController.js`
3. Actualizar `crudController.js` para exportar funciones
4. Agregar rutas en `app.js`

### Agregar Nueva Entidad (Frontend)

1. Crear hook: `src/hooks/useNewEntity.ts`
2. Usar en componentes: `const { items } = useNewEntity()`
3. Actualizar `AppContext.tsx` si es necesario
4. Agregar tipos en `src/types/index.ts`

## Troubleshooting

### Error: "Entity not found"

```javascript
// Backend
if (!entity) {
  logger.warn(`Entity not found: ${id}`);
  throw new NotFoundError('Entity', id);
}
```

### Error: "Validation failed"

```javascript
// Backend
const errors = {};
if (!data.name) errors.name = 'Required';
if (Object.keys(errors).length > 0) {
  logger.warn('Validation failed', { errors });
  throw new ValidationError(errors);
}
```

### Hook no actualiza estado

```typescript
// Frontend
// Asegúrate de que el hook está dentro de AppProvider
// y que estás usando useAppContext correctamente
const { state, dispatch } = useAppContext();
```
