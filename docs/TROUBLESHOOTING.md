# Guía de Troubleshooting

## Problemas Comunes

### Backend

#### 1. Error: "Cannot find module"

**Síntoma**: `Error: Cannot find module './entities/references/referencesController'`

**Causa**: Ruta de importación incorrecta o archivo no existe

**Solución**:
```javascript
// ❌ Incorrecto
const ref = require('./entities/references/referencesController');

// ✅ Correcto
const ref = require('./entities/references/referencesController.js');
// O
const ref = require('./entities/references/referencesController');
```

#### 2. Error: "Validation failed"

**Síntoma**: `400 Bad Request - Validation failed`

**Causa**: Datos no cumplen con las reglas de validación

**Solución**:
```javascript
// Revisar el error retornado
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "name": "Name is required",
    "price": "Price must be a number"
  }
}

// Asegúrate de enviar datos válidos
POST /api/references
{
  "description": "Valid description",
  "price": 100,
  "designer": "Designer name"
}
```

#### 3. Error: "Entity not found"

**Síntoma**: `404 Not Found - Reference with id ABC not found`

**Causa**: El ID no existe en la base de datos

**Solución**:
```javascript
// Verificar que el ID existe
GET /api/references/ABC

// Si no existe, crear primero
POST /api/references
{
  "description": "New reference",
  "price": 100
}
```

#### 4. Error: "Database error"

**Síntoma**: `500 Internal Server Error - Database error occurred`

**Causa**: Problema con la base de datos

**Solución**:
```javascript
// Revisar logs
LOG: [ERROR] Database error occurred

// Verificar que la BD está disponible
// Verificar que los datos están en formato correcto
// Reiniciar el servidor
```

#### 5. Logging no funciona

**Síntoma**: No ves logs en la consola

**Causa**: Nivel de logging incorrecto

**Solución**:
```bash
# Establecer nivel de logging
export LOG_LEVEL=DEBUG
npm start

# O en .env
LOG_LEVEL=DEBUG
```

### Frontend

#### 1. Hook no actualiza estado

**Síntoma**: `items` siempre está vacío

**Causa**: Componente no está dentro de `AppProvider`

**Solución**:
```typescript
// ❌ Incorrecto
ReactDOM.render(<App />, document.getElementById('root'));

// ✅ Correcto
ReactDOM.render(
  <AppProvider>
    <App />
  </AppProvider>,
  document.getElementById('root')
);
```

#### 2. Error: "useAppContext must be used within AppProvider"

**Síntoma**: Error al usar `useAppContext`

**Causa**: Hook usado fuera de `AppProvider`

**Solución**:
```typescript
// Asegúrate de que el componente está dentro de AppProvider
// En App.tsx o index.tsx
<AppProvider>
  <YourComponent />
</AppProvider>
```

#### 3. Datos no se cargan

**Síntoma**: `items` está vacío después de montar el componente

**Causa**: `useDataLoader` no se ejecutó

**Solución**:
```typescript
// En App.tsx
useEffect(() => {
  const loader = useDataLoader();
  loader.loadAll();
}, []);
```

#### 4. Error: "Cannot read property 'map' of undefined"

**Síntoma**: Error al renderizar lista

**Causa**: `items` es undefined

**Solución**:
```typescript
// ❌ Incorrecto
{items.map(i => <div>{i.name}</div>)}

// ✅ Correcto
{items?.map(i => <div>{i.name}</div>)}
// O
{items && items.map(i => <div>{i.name}</div>)}
```

#### 5. Logging no funciona en frontend

**Síntoma**: No ves logs en la consola del navegador

**Causa**: Nivel de logging incorrecto

**Solución**:
```bash
# Establecer nivel de logging en .env
REACT_APP_LOG_LEVEL=DEBUG
npm start
```

### Sincronización Backend-Frontend

#### 1. Datos no se sincronizan

**Síntoma**: Cambios en backend no aparecen en frontend

**Causa**: Estado global no se actualiza

**Solución**:
```typescript
// Asegúrate de que el hook actualiza el estado global
const { create } = useReferences();

const handleCreate = async (ref) => {
  const newRef = await create(ref);
  // El hook automáticamente actualiza state.references
};
```

#### 2. Cambios se pierden al recargar

**Síntoma**: Datos desaparecen después de F5

**Causa**: Datos solo en memoria, no persistidos

**Solución**:
```typescript
// Asegúrate de que los datos se guardan en backend
const handleCreate = async (ref) => {
  const newRef = await create(ref); // Esto guarda en backend
  // Los datos persisten después de recargar
};
```

## Debugging

### Backend

#### 1. Habilitar logs detallados

```bash
export LOG_LEVEL=DEBUG
npm start
```

#### 2. Usar debugger de Node

```bash
node --inspect app.js
# Luego abrir chrome://inspect
```

#### 3. Revisar logs en archivo

```bash
# Si tienes logging a archivo
tail -f logs/app.log
```

### Frontend

#### 1. Usar React DevTools

```
1. Instalar extensión React DevTools
2. Abrir DevTools (F12)
3. Ir a pestaña "Components"
4. Inspeccionar componentes y estado
```

#### 2. Usar Redux DevTools (si usas Redux)

```
1. Instalar extensión Redux DevTools
2. Abrir DevTools (F12)
3. Ir a pestaña "Redux"
4. Ver acciones y cambios de estado
```

#### 3. Usar console.log

```typescript
const { items } = useReferences();
console.log('References:', items);
console.log('State:', state);
```

#### 4. Usar Network tab

```
1. Abrir DevTools (F12)
2. Ir a pestaña "Network"
3. Hacer operación
4. Ver request/response
```

## Performance

### Backend

#### 1. Queries lentas

**Síntoma**: Endpoint tarda mucho

**Solución**:
```javascript
// Agregar logging de tiempo
const start = Date.now();
const data = getAllReferences();
const duration = Date.now() - start;
logger.info(`Query took ${duration}ms`);
```

#### 2. Memoria alta

**Síntoma**: Proceso usa mucha RAM

**Solución**:
```bash
# Monitorear memoria
node --max-old-space-size=4096 app.js
```

### Frontend

#### 1. Re-renders excesivos

**Síntoma**: Componente se renderiza demasiadas veces

**Solución**:
```typescript
// Usar React.memo
const MyComponent = React.memo(({ items }) => {
  return <div>{items.map(i => <p>{i.name}</p>)}</div>;
});
```

#### 2. Bundle grande

**Síntoma**: Aplicación tarda en cargar

**Solución**:
```bash
# Analizar bundle
npm run build
npm install -g serve
serve -s build
```

## Checklist de Debugging

- [ ] ¿Están los logs habilitados?
- [ ] ¿Está el servidor corriendo?
- [ ] ¿Está el frontend conectado al backend?
- [ ] ¿Son válidos los datos?
- [ ] ¿Está el componente dentro de AppProvider?
- [ ] ¿Está el hook siendo usado correctamente?
- [ ] ¿Hay errores en la consola?
- [ ] ¿Hay errores en Network tab?
- [ ] ¿Está la BD disponible?
- [ ] ¿Están los permisos correctos?

## Recursos

- [Node.js Debugging Guide](https://nodejs.org/en/docs/guides/debugging-getting-started/)
- [React DevTools](https://react-devtools-tutorial.vercel.app/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Express.js Error Handling](https://expressjs.com/en/guide/error-handling.html)

## Contacto

Si tienes problemas que no están en esta guía:

1. Revisar logs completos
2. Reproducir el problema en ambiente limpio
3. Documentar pasos para reproducir
4. Contactar al equipo de desarrollo
