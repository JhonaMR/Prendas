# 📚 SISTEMA DE FICHAS - GUÍA COMPLETA DE INSTALACIÓN

## 📋 ÍNDICE
1. [Estructura del Sistema](#estructura)
2. [Instalación Backend](#backend)
3. [Instalación Frontend](#frontend)
4. [Permisos y Roles](#permisos)
5. [Flujos de Trabajo](#flujos)
6. [Cálculos y Fórmulas](#calculos)
7. [Tips de Implementación](#tips)

---

## 1. ESTRUCTURA DEL SISTEMA {#estructura}

### ARQUITECTURA GENERAL

```
proyecto/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── disenadorasController.js           (NUEVO)
│   │   │   ├── fichasDisenoController.js          (NUEVO)
│   │   │   ├── fichasCostoController_parte1.js    (NUEVO)
│   │   │   ├── fichasCostoController_parte2.js    (NUEVO)
│   │   │   └── maletasController.js               (NUEVO)
│   │   ├── routes/
│   │   │   └── index.js                           (MODIFICAR - agregar rutas fichas)
│   │   └── config/
│   │       └── database.js                        (USAR PostgreSQL)
│   └── public/
│       └── images/
│           └── references/                        (carpeta para fotos)
├── src/
│   ├── types/
│   │   └── typesFichas.ts                         (NUEVO)
│   ├── services/
│   │   └── apiFichas.ts                           (NUEVO)
│   └── views/
│       ├── FichasDisenoMosaico.tsx                (NUEVO)
│       ├── FichasDisenoDetalle.tsx                (NUEVO)
│       ├── FichasCostoMosaico.tsx                 (NUEVO)
│       ├── FichasCostoDetalle.tsx                 (NUEVO)
│       ├── FichasCorteDetalle.tsx                 (NUEVO)
│       ├── MaletasListado.tsx                     (NUEVO)
│       └── MaletasAsignar.tsx                     (NUEVO)
└── database/
    └── schema_fichas.sql                          (EJECUTAR PRIMERO)
```

---

## 2. INSTALACIÓN BACKEND {#backend}

### PASO 1: Configurar PostgreSQL

```bash
# 1. Conectar a PostgreSQL
psql -U postgres

# 2. Crear base de datos (si no existe)
CREATE DATABASE inventario;

# 3. Conectar a la base de datos
\c inventario

# 4. Ejecutar el schema
\i /ruta/al/archivo/01_database_schema.sql

# Verificar tablas creadas
\dt
```

### PASO 2: Instalar dependencias

```bash
cd backend
npm install multer  # Para subida de fotos
```

### PASO 3: Copiar controllers

Copiar todos los archivos de controllers a `backend/src/controllers/`:

- `02_backend_controller_disenadoras.js` → `disenadorasController.js`
- `03_backend_controller_fichas_diseno.js` → `fichasDisenoController.js`
- `04_backend_controller_fichas_costo_parte1.js` → `fichasCostoController_parte1.js`
- `05_backend_controller_fichas_costo_parte2.js` → `fichasCostoController_parte2.js`
- `06_backend_controller_maletas.js` → `maletasController.js`

### PASO 4: Actualizar rutas

En `backend/src/routes/index.js`, AGREGAR al final (antes del `module.exports`):

```javascript
// ============ IMPORTAR NUEVOS CONTROLLERS ============
const disenadorasController = require('../controllers/disenadorasController');
const fichasDisenoController = require('../controllers/fichasDisenoController');
const fichasCostoController1 = require('../controllers/fichasCostoController_parte1');
const fichasCostoController2 = require('../controllers/fichasCostoController_parte2');
const maletasController = require('../controllers/maletasController');

// ============ AGREGAR RUTAS ============
// (Copiar contenido completo del archivo 07_backend_routes.js)
```

### PASO 5: Crear carpeta de fotos

```bash
mkdir -p backend/public/images/references
```

### PASO 6: Configurar database.js para PostgreSQL

Si aún no lo has hecho, asegúrate de que `backend/src/config/database.js` use PostgreSQL:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'inventario',
  password: process.env.DB_PASSWORD || 'tu_password',
  port: process.env.DB_PORT || 5432,
});

module.exports = pool;
```

---

## 3. INSTALACIÓN FRONTEND {#frontend}

### PASO 1: Copiar types

Copiar `08_frontend_types_fichas.ts` a `src/types/typesFichas.ts`

### PASO 2: Copiar API service

Copiar `09_frontend_api_fichas.ts` a `src/services/apiFichas.ts`

### PASO 3: Actualizar AppState

En `src/types.ts` (tu archivo principal de types), AGREGAR:

```typescript
import { Disenadora, FichaDiseno, FichaCosto, Maleta } from './typesFichas';

export interface AppState {
  // ... tus existentes
  users: User[];
  references: Reference[];
  // ... etc
  
  // NUEVOS
  disenadoras: Disenadora[];
  fichasDiseno: FichaDiseno[];
  fichasCosto: FichaCosto[];
  maletas: Maleta[];
}
```

### PASO 4: Copiar vistas

Los componentes de frontend se entregarán en archivos separados (continúa en siguientes archivos).

### PASO 5: Actualizar App.tsx

En `src/App.tsx`, AGREGAR:

```typescript
// 1. IMPORTS
import FichasDisenoMosaico from './views/FichasDisenoMosaico';
import FichasCostoMosaico from './views/FichasCostoMosaico';
import MaletasListado from './views/MaletasListado';

// 2. En useState inicial
const [state, setState] = useState<AppState>({
  // ... existentes
  disenadoras: [],
  fichasDiseno: [],
  fichasCosto: [],
  maletas: []
});

// 3. En useEffect loadData
const [disenadorasData, fichasDisenoData, fichasCostoData, maletasData] = await Promise.all([
  api.getDisenadoras(),
  api.getFichasDiseno(),
  api.getFichasCosto(),
  api.getMaletas()
]);

setState({
  // ... existentes
  disenadoras: disenadorasData,
  fichasDiseno: fichasDisenoData,
  fichasCosto: fichasCostoData,
  maletas: maletasData
});

// 4. En renderContent
case 'fichasDiseno':
  return <FichasDisenoMosaico state={state} user={user} updateState={updateState} />;
case 'fichasCosto':
  return <FichasCostoMosaico state={state} user={user} updateState={updateState} />;
case 'maletas':
  return <MaletasListado state={state} user={user} updateState={updateState} />;

// 5. En el menú
<div className="my-4 border-t border-slate-100 pt-4">
  <p className="px-6 text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Producción</p>
  <NavItem 
    active={activeTab === 'fichasDiseno'} 
    onClick={() => handleTabChange('fichasDiseno')} 
    icon={<Icons.Masters />} 
    label="Fichas de Diseño" 
  />
  <NavItem 
    active={activeTab === 'fichasCosto'} 
    onClick={() => handleTabChange('fichasCosto')} 
    icon={<Icons.Reports />} 
    label="Fichas de Costo" 
  />
  <NavItem 
    active={activeTab === 'maletas'} 
    onClick={() => handleTabChange('maletas')} 
    icon={<Icons.Inventory />} 
    label="Maletas" 
  />
</div>
```

---

## 4. PERMISOS Y ROLES {#permisos}

### MATRIZ DE PERMISOS

| Acción | ADMIN | GENERAL | DISEÑADORA | OBSERVADOR |
|--------|-------|---------|------------|------------|
| **FICHAS DISEÑO** | | | | |
| Ver fichas | ✅ | ✅ | ✅ | ✅ |
| Crear fichas | ❌ | ❌ | ✅ | ❌ |
| Editar fichas | ❌ | ❌ | ✅ (solo propias) | ❌ |
| Eliminar fichas | ❌ | ❌ | ✅ (solo no importadas) | ❌ |
| Subir fotos | ❌ | ❌ | ✅ | ❌ |
| **FICHAS COSTO** | | | | |
| Ver fichas | ✅ | ✅ | ✅ | ✅ |
| Importar fichas | ✅ | ✅ | ❌ | ❌ |
| Crear fichas | ✅ | ❌ | ❌ | ❌ |
| Editar fichas | ✅ | ❌ | ❌ | ❌ |
| Eliminar fichas | ✅ | ❌ | ❌ | ❌ |
| **CORTES** | | | | |
| Ver cortes | ✅ | ✅ | ✅ | ✅ |
| Asentar cortes | ✅ | ✅ | ❌ | ❌ |
| Editar cortes | ✅ | ✅ | ❌ | ❌ |
| **MALETAS** | | | | |
| Ver maletas | ✅ | ✅ | ✅ | ✅ |
| Crear maletas | ✅ | ✅ | ❌ | ❌ |
| Editar maletas | ✅ | ✅ | ❌ | ❌ |
| Eliminar maletas | ✅ | ✅ | ❌ | ❌ |

### IMPLEMENTAR PERMISOS EN FRONTEND

```typescript
const isAdmin = user.role === 'admin';
const isGeneral = user.role === 'general';
const isDisenadora = user.role === 'disenadora';
const isObservador = user.role === 'observador';

// Ejemplo en componente:
{isDisenadora && (
  <button onClick={handleCreate}>Crear Ficha</button>
)}

{(isAdmin || isGeneral) && (
  <button onClick={handleImport}>Importar</button>
)}

// Inputs read-only para observadores
<input 
  readOnly={isObservador || (!isDisenadora && esFichaDiseno)}
  ...
/>
```

---

## 5. FLUJOS DE TRABAJO {#flujos}

### FLUJO 1: CREAR FICHA DE DISEÑO

```
1. Diseñadora → Click "Fichas de Diseño"
2. Vista Mosaico
3. Click "Crear Ficha Nueva"
4. Modal: Ingresar referencia + seleccionar diseñadora
5. Vista Detalle Vacía
6. Llenar datos:
   - Descripción, Marca, Novedad
   - Subir fotos (10210.jpg, 10210-2.jpg)
   - Agregar conceptos en secciones (Materia Prima, etc.)
   - Observaciones
7. Click "GUARDAR"
8. Sistema:
   - Calcula totales automáticamente
   - Verifica si referencia existe en product_references
   - Si no existe, la crea (sin correría)
9. Vuelve a Mosaico
```

### FLUJO 2: IMPORTAR FICHA A COSTO

```
1. Admin/General → Click "Fichas de Costo"
2. Vista Mosaico
3. Click "Importar Ficha"
4. Modal: Ingresar referencia
5. Sistema verifica:
   - ¿Existe en fichas_diseno? → SÍ
   - ¿Ya importada? → NO
6. Muestra: "Ficha creada por [DISEÑADORA]"
7. Click "Agregar"
8. Sistema:
   - Duplica todo de fichas_diseno
   - Calcula precio de venta (49% rentabilidad default)
   - Calcula descuentos
   - Marca ficha_diseno como importada
9. Muestra Vista Detalle con TODO editable
```

### FLUJO 3: ASENTAR CORTE

```
1. Admin/General → Fichas Costo → Click referencia
2. Vista Detalle (Ficha Inicial visible)
3. Click "CORTE #1" (opaco si no asentado)
4. Modal: "¿Asentar Corte #1?"
   - Ingresar Fecha de Corte
   - Ingresar Cantidad Cortada
5. Click "Asentar"
6. Sistema:
   - Copia TODO de ficha inicial
   - Crea snapshot independiente
   - Botón CORTE #1 se activa
7. Click CORTE #1 → Vista Corte #1
8. Editar valores reales del corte
9. Click "GUARDAR CORTE"
10. Sistema:
    - Calcula utilidad vs proyectado
    - Actualiza cantidad total cortada en ficha inicial
```

### FLUJO 4: CREAR MALETA

```
1. Admin/General → Click "Maletas"
2. Click "Crear Maleta"
3. Modal:
   - Nombre: "Maleta Madres 2026"
   - Correría: [Selector]
4. Click "Crear"
5. Vista Asignación:
   - Referencias SIN correría (checkboxes)
   - Buscador de referencias antiguas
6. Seleccionar referencias
7. Click "GUARDAR MALETA"
8. Sistema:
   - Crea maleta
   - Agrega referencias a maleta
   - Actualiza correria_catalog si hay correría
   - Actualiza product_references
```

---

## 6. CÁLCULOS Y FÓRMULAS {#calculos}

### AJUSTE A 900

```javascript
function ajustarA900(valor) {
  if (valor <= 0) return 0;
  const miles = Math.ceil(valor / 1000);
  return miles * 1000 - 100;
}

// Ejemplos:
// 12549 → 12900
// 19234 → 19900
// 30800 → 30900
```

### PRECIO DE VENTA

```javascript
// Desde rentabilidad
precioVenta = ajustarA900(costoTotal * (1 + rentabilidad/100))

// Ejemplo: 
// costoTotal = 15790, rentabilidad = 49%
// precioVenta = ajustarA900(15790 * 1.49) = ajustarA900(23527) = 23900
```

### RENTABILIDAD

```javascript
rentabilidad = ((precioVenta / costoTotal) - 1) * 100

// Ejemplo:
// precioVenta = 30900, costoTotal = 15790
// rentabilidad = ((30900 / 15790) - 1) * 100 = 95.6%
```

### MARGEN GANANCIA CLIENTE (35%)

```javascript
margenGanancia = ajustarA900(precioVenta * 0.35)

// Ejemplo:
// precioVenta = 30900
// margenGanancia = ajustarA900(10815) = 10900
```

### DESCUENTOS

```javascript
// Para cada descuento (0%, 5%, 10%, 15%)
precioConDesc = ajustarA900(precioVenta * (1 - descuento/100))
rentConDesc = ((precioConDesc / costoTotal) - 1) * 100

// Ejemplo con DESC 10%:
// precioVenta = 30900, costoTotal = 15790
// precioConDesc = ajustarA900(30900 * 0.90) = ajustarA900(27810) = 27900
// rentConDesc = ((27900 / 15790) - 1) * 100 = 76.7%
```

### UTILIDAD CORTE

```javascript
costoProyectado = costoTotal  // De ficha inicial
costoReal = totalCorte        // Del corte específico
diferencia = costoProyectado - costoReal
margenUtilidad = (diferencia / costoReal) * 100

// Ejemplo:
// costoProyectado = 15790 (estimé por arriba)
// costoReal = 15390 (costó realmente)
// diferencia = 400
// margenUtilidad = (400 / 15390) * 100 = 2.6% (utilidad)
```

### COSTO TOTAL vs COSTO CONTABILIZAR

```javascript
costoTotal = SUM(todas las secciones)
costoContabilizar = costoTotal - totalProvisiones

// Las provisiones NO se contabilizan
```

---

## 7. TIPS DE IMPLEMENTACIÓN {#tips}

### TIP 1: Componentes Reutilizables

Crear componentes compartidos:

```typescript
// src/components/SeccionConceptos.tsx
interface SeccionConceptosProps {
  titulo: string;
  color: string;
  conceptos: ConceptoFicha[];
  onChange: (conceptos: ConceptoFicha[]) => void;
  readOnly: boolean;
}

// Usar en FichasDisenoDetalle y FichasCostoDetalle
```

### TIP 2: Hook Personalizado para Cálculos

```typescript
// src/hooks/useFichaCalculations.ts
export const useFichaCalculations = (secciones) => {
  const totales = useMemo(() => {
    // Calcular todos los totales
    return calcularTotales(secciones);
  }, [secciones]);
  
  return totales;
};
```

### TIP 3: Gestión de Estado Local

Para fichas con muchos campos, usar un reducer:

```typescript
const [fichaState, dispatch] = useReducer(fichaReducer, initialState);

// Acciones:
dispatch({ type: 'UPDATE_CONCEPTO', payload: { seccion, index, concepto } });
dispatch({ type: 'ADD_CONCEPTO', payload: { seccion } });
dispatch({ type: 'DELETE_CONCEPTO', payload: { seccion, index } });
```

### TIP 4: Alertas de Cambios sin Guardar

```typescript
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = '';
    }
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [hasUnsavedChanges]);
```

### TIP 5: Subida de Fotos con Preview

```typescript
const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?[0];
  if (!file) return;
  
  // Preview local
  const reader = new FileReader();
  reader.onload = (e) => setPreview(e.target?.result as string);
  reader.readAsDataURL(file);
  
  // Subir al servidor
  const result = await api.uploadFotoFicha(file);
  if (result.success) {
    setFoto1(result.data.path);
  }
};
```

### TIP 6: Validaciones en Frontend

```typescript
const validateFicha = (ficha: FichaFormData): string[] => {
  const errors: string[] = [];
  
  if (!ficha.referencia) errors.push('Referencia es obligatoria');
  if (!ficha.disenadoraId) errors.push('Diseñadora es obligatoria');
  if (ficha.materiaPrima.length === 0) errors.push('Debe agregar al menos un material');
  
  return errors;
};
```

### TIP 7: Optimización de Renders

```typescript
// Memoizar componentes pesados
const ConceptoRow = React.memo(({ concepto, onChange }) => {
  // ...
});

// Usar useCallback para funciones pasadas como props
const handleConceptoChange = useCallback((index, newConcepto) => {
  // ...
}, []);
```

---

## 8. CHECKLIST DE INSTALACIÓN

### Backend ✅
- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos creada
- [ ] Schema ejecutado (01_database_schema.sql)
- [ ] Tablas verificadas (\dt en psql)
- [ ] Multer instalado
- [ ] Controllers copiados
- [ ] Rutas agregadas
- [ ] Carpeta `public/images/references/` creada
- [ ] database.js configurado para PostgreSQL

### Frontend ✅
- [ ] typesFichas.ts copiado
- [ ] apiFichas.ts copiado
- [ ] AppState actualizado
- [ ] Componentes de vistas creados
- [ ] App.tsx actualizado (imports, state, menu)
- [ ] Permisos implementados

### Testing ✅
- [ ] Crear diseñadora desde Postman/UI
- [ ] Crear ficha diseño
- [ ] Subir fotos
- [ ] Importar ficha a costo
- [ ] Editar ficha costo
- [ ] Asentar corte
- [ ] Crear maleta
- [ ] Asignar referencias a maleta

---

## 9. SOLUCIÓN DE PROBLEMAS COMUNES

### Error: "Cannot find module 'pg'"
```bash
cd backend
npm install pg
```

### Error: "Permission denied" en carpeta de fotos
```bash
chmod 755 backend/public/images/references
```

### Error: "Relation does not exist"
```bash
# Verificar que ejecutaste el schema
psql -U postgres -d inventario -f 01_database_schema.sql
```

### Error: "CORS policy"
Agregar en backend/src/server.js:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

---

## 10. PRÓXIMOS PASOS

1. **Implementar validaciones adicionales** en backend
2. **Agregar exportación a Excel** de fichas
3. **Implementar búsqueda avanzada** con filtros
4. **Agregar historial de cambios** en fichas
5. **Crear reportes** de rentabilidad por diseñadora
6. **Implementar backup automático** de fotos

---

**FIN DE LA GUÍA**

Para cualquier duda o problema, revisar los archivos de código proporcionados.
Todos los archivos están listos para integración directa.
