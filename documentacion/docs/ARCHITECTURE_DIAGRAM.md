# Diagrama de Arquitectura - Sistema de Gestión de Inventario

---

## 🏗️ ARQUITECTURA GENERAL

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO FINAL                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   NAVEGADOR     │
                    │   (React App)   │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        │            ┌───────▼────────┐           │
        │            │  Context API   │           │
        │            │  (Estado Global)           │
        │            └───────┬────────┘           │
        │                    │                    │
    ┌───▼────┐          ┌────▼─────┐         ┌───▼────┐
    │ Hooks  │          │Components│         │Services│
    │ CRUD   │          │(Views)   │         │(API)   │
    └───┬────┘          └────┬─────┘         └───┬────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   HTTP/REST     │
                    │   (JWT Token)   │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
    ┌───▼────────┐   ┌──────▼──────┐   ┌────────▼────┐
    │ Middleware │   │  Routes     │   │ Controllers │
    │ (Auth)     │   │  (Express)  │   │ (Entities)  │
    └───┬────────┘   └──────┬──────┘   └────────┬────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   Services      │
                    │   (Lógica)      │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  SQLite BD      │
                    │  (Datos)        │
                    └─────────────────┘
```

---

## 🎯 FLUJO DE DATOS

### Lectura de Datos (GET)

```
Usuario Abre Vista
    ↓
Hook (useReferences) se ejecuta
    ↓
API Call (GET /api/references)
    ↓
Backend recibe petición
    ↓
Middleware verifica token JWT
    ↓
Controller valida entrada
    ↓
Service obtiene datos de BD
    ↓
BD devuelve registros
    ↓
Service procesa datos
    ↓
Controller formatea respuesta
    ↓
Frontend recibe JSON
    ↓
Hook actualiza estado local
    ↓
Context API actualiza estado global
    ↓
Componentes se re-renderizan
    ↓
Usuario ve datos
```

### Creación de Datos (POST)

```
Usuario llena formulario
    ↓
Componente valida entrada
    ↓
Hook (useCRUD.create) se ejecuta
    ↓
API Call (POST /api/references)
    ↓
Backend recibe petición
    ↓
Middleware verifica token JWT
    ↓
Controller valida entrada
    ↓
Validator verifica reglas
    ↓
Service inicia transacción
    ↓
BD inserta registro
    ↓
BD inserta relaciones
    ↓
Transacción se confirma
    ↓
Service devuelve registro creado
    ↓
Controller formatea respuesta
    ↓
Frontend recibe JSON
    ↓
Hook actualiza estado local
    ↓
Context API actualiza estado global
    ↓
Componentes se re-renderizan
    ↓
Usuario ve confirmación
```

---

## 📁 ESTRUCTURA DE CARPETAS

### Backend

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          ← Conexión a BD
│   │   └── DatabaseConnectionManager.js
│   │
│   ├── controllers/
│   │   ├── entities/
│   │   │   ├── references/
│   │   │   │   ├── referencesController.js
│   │   │   │   ├── referencesService.js
│   │   │   │   └── referencesValidator.js
│   │   │   ├── clients/
│   │   │   ├── confeccionistas/
│   │   │   ├── sellers/
│   │   │   ├── correrias/
│   │   │   └── deliveryDates/
│   │   │
│   │   ├── shared/
│   │   │   ├── errorHandler.js  ← Manejo de errores
│   │   │   ├── logger.js        ← Logging
│   │   │   └── validators.js    ← Validadores comunes
│   │   │
│   │   ├── authController.js
│   │   └── movementsController.js
│   │
│   ├── middleware/
│   │   └── auth.js              ← Verificación JWT
│   │
│   ├── routes/
│   │   └── index.js             ← Definición de rutas
│   │
│   ├── services/
│   │   ├── CacheManager.js      ← Caché en memoria
│   │   ├── DispatchService.js
│   │   ├── PaginationService.js
│   │   ├── ReceptionService.js
│   │   └── ReturnService.js
│   │
│   ├── scripts/
│   │   ├── initDatabase.js      ← Inicializar BD
│   │   ├── createIndexes.js     ← Crear índices
│   │   ├── testEndpoints.js     ← Tests
│   │   └── resetDatabase.js
│   │
│   ├── database/
│   │   └── inventory.db         ← Base de datos SQLite
│   │
│   └── server.js                ← Punto de entrada
│
├── package.json
├── .env
└── .env.example
```

### Frontend

```
src/
├── context/
│   ├── AppContext.tsx           ← Contexto global
│   ├── AppProvider.tsx          ← Proveedor
│   └── useAppContext.ts         ← Hook para usar contexto
│
├── hooks/
│   ├── useCRUD.ts               ← Hook genérico CRUD
│   ├── useReferences.ts         ← Hook específico
│   ├── useClients.ts
│   ├── useConfeccionistas.ts
│   ├── useSellers.ts
│   ├── useCorrerias.ts
│   └── useDataLoader.ts
│
├── services/
│   ├── api.ts                   ← Llamadas HTTP
│   └── logger.ts                ← Logging
│
├── views/
│   ├── App.tsx                  ← Componente raíz
│   ├── LoginView.tsx
│   ├── HomeView.tsx
│   ├── ReceptionView.tsx
│   ├── DispatchView.tsx
│   ├── MastersView.tsx
│   ├── OrdersView.tsx
│   ├── ReportsView.tsx
│   └── ... (otras vistas)
│
├── components/
│   ├── HomeView/
│   ├── ... (componentes por vista)
│
├── types/
│   └── index.ts                 ← Tipos TypeScript
│
└── App.tsx
```

---

## 🔄 PATRÓN POR ENTIDAD

Cada entidad (References, Clients, etc.) sigue el mismo patrón:

```
┌─────────────────────────────────────────────────────┐
│              ENTIDAD (ej: References)               │
└─────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
    ┌───▼────────┐  ┌───▼────────┐  ┌──▼──────────┐
    │ Controller │  │  Service   │  │ Validator   │
    │            │  │            │  │             │
    │ - list()   │  │ - getAll() │  │ - validate  │
    │ - create() │  │ - create() │  │   Create()  │
    │ - update() │  │ - update() │  │ - validate  │
    │ - delete() │  │ - delete() │  │   Update()  │
    └───┬────────┘  └───┬────────┘  └──┬──────────┘
        │               │               │
        └───────────────┼───────────────┘
                        │
                ┌───────▼────────┐
                │   Database     │
                │   (SQLite)     │
                └────────────────┘
```

### Ejemplo: References

```javascript
// referencesController.js
const list = (req, res) => {
  const references = getAllReferences();
  return res.json({ success: true, data: references });
};

// referencesService.js
function getAllReferences() {
  const db = getDatabase();
  return db.prepare('SELECT * FROM product_references').all();
}

// referencesValidator.js
function validateCreateReference(data) {
  validateRequired(data.description, 'Description');
  validateNumber(data.price, 'Price');
}
```

---

## 🔐 FLUJO DE AUTENTICACIÓN

```
┌──────────────────────────────────────────────────────┐
│                   LOGIN FLOW                         │
└──────────────────────────────────────────────────────┘

Usuario ingresa credenciales
    ↓
POST /api/auth/login
    ↓
Backend verifica credenciales
    ↓
Credenciales válidas?
    ├─ NO → Devuelve 401 Unauthorized
    │
    └─ SÍ → Genera JWT Token
            ↓
            Devuelve token al frontend
            ↓
            Frontend almacena token
            ↓
            Frontend agrega token a headers
            ↓
            Authorization: Bearer <token>

┌──────────────────────────────────────────────────────┐
│              PETICIÓN PROTEGIDA FLOW                 │
└──────────────────────────────────────────────────────┘

Frontend envía petición con token
    ↓
GET /api/references
Authorization: Bearer <token>
    ↓
Middleware verifyToken
    ↓
Token válido?
    ├─ NO → Devuelve 401 Unauthorized
    │
    └─ SÍ → Continúa a controller
            ↓
            Controller procesa petición
            ↓
            Devuelve datos
```

---

## 📊 ESTADO GLOBAL (Context API)

```typescript
interface AppState {
  // Usuarios
  users: User[];
  
  // Maestros (datos estáticos)
  references: Reference[];
  clients: Client[];
  confeccionistas: Confeccionista[];
  sellers: Seller[];
  correrias: Correria[];
  
  // Movimientos (datos dinámicos)
  receptions: Reception[];
  returnReceptions: ReturnReception[];
  dispatches: Dispatch[];
  orders: Order[];
  productionTracking: ProductionTracking[];
  deliveryDates: DeliveryDate[];
  
  // Estado de UI
  loading: boolean;
  error: string | null;
}
```

---

## 🚀 DESPLIEGUE

```
┌─────────────────────────────────────────────────────┐
│              ARQUITECTURA DE DESPLIEGUE             │
└─────────────────────────────────────────────────────┘

Internet
    ↓
┌─────────────────────────────────────────────────────┐
│              HTTPS / SSL Certificate               │
└─────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────┐
│              Servidor (Node.js)                     │
│  ┌───────────────────────────────────────────────┐  │
│  │  Express Server (Puerto 3000)                 │  │
│  │  ├─ Frontend (dist/)                          │  │
│  │  ├─ API Routes (/api/*)                       │  │
│  │  ├─ Middleware (Auth, CORS, etc.)             │  │
│  │  └─ Error Handler                             │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │  SQLite Database                              │  │
│  │  └─ database/inventory.db                     │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────┐
│              Backup & Monitoring                    │
│  ├─ Backups diarios de BD                          │
│  ├─ Logs centralizados                             │
│  ├─ Alertas de errores                             │
│  └─ Métricas de performance                        │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 CICLO DE VIDA DE UNA PETICIÓN

```
1. FRONTEND
   ├─ Usuario interactúa con componente
   ├─ Hook (useCRUD) se ejecuta
   ├─ API call se realiza
   └─ Token JWT se agrega a headers

2. RED
   ├─ Petición HTTP viaja al servidor
   ├─ HTTPS encripta datos
   └─ Servidor recibe petición

3. BACKEND - MIDDLEWARE
   ├─ CORS middleware valida origen
   ├─ Auth middleware verifica token
   ├─ Body parser procesa JSON
   └─ Logger registra petición

4. BACKEND - ROUTING
   ├─ Express router encuentra ruta
   ├─ Controller se ejecuta
   └─ Parámetros se extraen

5. BACKEND - LÓGICA
   ├─ Validator verifica entrada
   ├─ Service ejecuta lógica
   ├─ BD se consulta/modifica
   └─ Transacción se confirma

6. BACKEND - RESPUESTA
   ├─ Datos se formatean
   ├─ Status code se asigna
   ├─ Headers se configuran
   └─ JSON se serializa

7. RED
   ├─ Respuesta viaja al cliente
   ├─ HTTPS desencripta datos
   └─ Frontend recibe respuesta

8. FRONTEND - ACTUALIZACIÓN
   ├─ Hook procesa respuesta
   ├─ Estado local se actualiza
   ├─ Context API se actualiza
   ├─ Componentes se re-renderizan
   └─ Usuario ve cambios
```

---

## 📈 ESCALABILIDAD FUTURA

### Fase 1: Actual (Hasta 500 usuarios)
```
┌─────────────────────────────────────────────────────┐
│              Un Servidor                            │
│  ├─ Node.js + Express                              │
│  ├─ SQLite                                          │
│  └─ Caché en memoria                               │
└─────────────────────────────────────────────────────┘
```

### Fase 2: Crecimiento (500-2000 usuarios)
```
┌─────────────────────────────────────────────────────┐
│              Load Balancer (Nginx)                  │
└─────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────┐
│  Backend 1  │  Backend 2  │  Backend 3              │
│  Node.js    │  Node.js    │  Node.js                │
└─────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────┐
│              PostgreSQL (con replicación)           │
└─────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────┐
│              Redis (Caché distribuido)              │
└─────────────────────────────────────────────────────┘
```

### Fase 3: Escala Masiva (2000+ usuarios)
```
┌─────────────────────────────────────────────────────┐
│              CDN (Cloudflare)                       │
└─────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────┐
│              Load Balancer (Nginx)                  │
└─────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────┐
│  Kubernetes Cluster                                 │
│  ├─ Microservicio: Auth                             │
│  ├─ Microservicio: Masters                          │
│  ├─ Microservicio: Movements                        │
│  └─ Microservicio: Orders                           │
└─────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────┐
│  PostgreSQL (Replicación + Sharding)                │
│  Redis (Cluster)                                    │
│  Elasticsearch (Búsqueda)                           │
│  RabbitMQ (Message Queue)                           │
└─────────────────────────────────────────────────────┘
```

---

**Diagrama Generado**: Febrero 17, 2026  
**Versión**: 1.0  
**Estado**: ✅ ACTUALIZADO

