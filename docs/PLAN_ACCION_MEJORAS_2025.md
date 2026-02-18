# 📋 PLAN DE ACCIÓN - MEJORAS Y ESCALABILIDAD 2025

**Fecha**: Febrero 2025  
**Objetivo**: Optimizar arquitectura, rendimiento y preparar para múltiples proyectos paralelos

---

## 🎯 FASE 1: OPTIMIZACIONES INMEDIATAS (2-3 semanas)

### 1. Implementar Sistema de Caché
**Prioridad**: 🔴 CRÍTICA  
**Tiempo estimado**: 3-4 días

**Objetivo**: Reducir consultas a BD y mejorar rendimiento

**Implementación**:
- Crear `CacheManager.js` mejorado con TTL configurable
- Caché para:
  - Listados de Masters (Clientes, Vendedores, Confeccionistas)
  - Órdenes por estado
  - Fechas de entrega
  - Referencias
- Invalidación automática al crear/actualizar/eliminar
- Estrategia: LRU (Least Recently Used) con límite de 500 items

**Beneficios**:
- ⚡ Reducir tiempo de carga 60-70%
- 📉 Disminuir carga en BD
- 🚀 Mejor experiencia de usuario

**Archivos a crear/modificar**:
```
backend/src/services/CacheManager.js (mejorar)
backend/src/middleware/cacheMiddleware.js (nuevo)
```

---

### 2. Dividir Context API en Contextos Especializados
**Prioridad**: 🟠 ALTA  
**Tiempo estimado**: 4-5 días

**Objetivo**: Evitar re-renders innecesarios y mejorar mantenibilidad

**Estructura actual**: Un solo contexto global  
**Estructura nueva**:

```
src/context/
├── AuthContext.js          (Usuario, permisos, sesión)
├── MastersContext.js       (Clientes, Vendedores, Confeccionistas)
├── OrdersContext.js        (Órdenes, estados)
├── DeliveryDatesContext.js (Fechas de entrega)
├── ReferencesContext.js    (Referencias de productos)
├── UIContext.js            (Modales, notificaciones, filtros)
└── CacheContext.js         (Estado de caché)
```

**Beneficios**:
- ✅ Cambios en Orders NO re-renderizan Masters
- ✅ Cambios en UI NO re-renderizan datos
- ✅ Mejor performance
- ✅ Código más mantenible

**Archivos a crear**:
```
src/context/AuthContext.js
src/context/MastersContext.js
src/context/OrdersContext.js
src/context/DeliveryDatesContext.js
src/context/ReferencesContext.js
src/context/UIContext.js
src/context/CacheContext.js
src/hooks/useContexts.js (hook personalizado)
```

---

### 3. Agregar Paginación (Excepto Orders)
**Prioridad**: 🟠 ALTA  
**Tiempo estimado**: 5-6 días

**Objetivo**: Manejar grandes volúmenes de datos eficientemente

**Implementación por vista**:

| Vista | Registros/Página | Implementar |
|-------|------------------|-------------|
| Clientes | 25 | ✅ Sí |
| Vendedores | 25 | ✅ Sí |
| Confeccionistas | 25 | ✅ Sí |
| Referencias | 50 | ✅ Sí |
| Fechas de Entrega | 30 | ✅ Sí |
| Órdenes | - | ❌ No (mantener actual) |
| Recepciones | 20 | ✅ Sí |
| Despachos | 20 | ✅ Sí |

**Mejoras a `PaginationService.js`**:
- Soporte para múltiples campos de ordenamiento
- Búsqueda con paginación
- Filtros con paginación
- Caché de resultados paginados

**Archivos a modificar**:
```
backend/src/services/PaginationService.js (mejorar)
backend/src/controllers/entities/*/[entity]Controller.js (agregar paginación)
src/components/*/[Entity]View.tsx (agregar UI de paginación)
```

---

### 4. Dividir MastersView en Submódulos
**Prioridad**: 🟠 ALTA  
**Tiempo estimado**: 4-5 días

**Objetivo**: Mejorar mantenibilidad y rendimiento

**Estructura actual**: Un archivo monolítico  
**Estructura nueva**:

```
src/components/MastersView/
├── MastersView.tsx              (contenedor principal)
├── ClientsModule/
│   ├── ClientsTable.tsx
│   ├── ClientsForm.tsx
│   ├── ClientsFilters.tsx
│   └── useClientsModule.ts
├── SellersModule/
│   ├── SellersTable.tsx
│   ├── SellersForm.tsx
│   ├── SellersFilters.tsx
│   └── useSellersModule.ts
├── ConfeccionistasModule/
│   ├── ConfeccionistasTable.tsx
│   ├── ConfeccionistasForm.tsx
│   ├── ConfeccionistasFilters.tsx
│   └── useConfeccionistasModule.ts
├── ReferencesModule/
│   ├── ReferencesTable.tsx
│   ├── ReferencesForm.tsx
│   ├── ReferencesFilters.tsx
│   └── useReferencesModule.ts
└── shared/
    ├── TableHeader.tsx
    ├── FormModal.tsx
    └── FilterBar.tsx
```

**Beneficios**:
- 📦 Componentes reutilizables
- 🔧 Fácil de mantener
- ⚡ Lazy loading posible
- 🧪 Más fácil de testear

---

### 5. Agregar Índices en Base de Datos
**Prioridad**: 🔴 CRÍTICA  
**Tiempo estimado**: 1-2 días

**Objetivo**: Optimizar velocidad de consultas

**Índices a crear**:

```sql
-- Clientes
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_active ON clients(active);

-- Vendedores
CREATE INDEX idx_sellers_name ON sellers(name);
CREATE INDEX idx_sellers_active ON sellers(active);

-- Confeccionistas
CREATE INDEX idx_confeccionistas_name ON confeccionistas(name);
CREATE INDEX idx_confeccionistas_active ON confeccionistas(active);

-- Órdenes
CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_delivery_date ON orders(delivery_date);

-- Recepciones
CREATE INDEX idx_receptions_order_id ON receptions(order_id);
CREATE INDEX idx_receptions_created_at ON receptions(created_at);

-- Despachos
CREATE INDEX idx_dispatches_order_id ON dispatches(order_id);
CREATE INDEX idx_dispatches_created_at ON dispatches(created_at);

-- Referencias
CREATE INDEX idx_references_name ON references(name);
CREATE INDEX idx_references_code ON references(code);

-- Fechas de Entrega
CREATE INDEX idx_delivery_dates_order_id ON delivery_dates(order_id);
CREATE INDEX idx_delivery_dates_date ON delivery_dates(date);

-- Auditoría (para búsquedas rápidas)
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX idx_audit_log_entity_id ON audit_log(entity_id);
```

**Archivo a crear**:
```
backend/src/scripts/createOptimizedIndexes.js
```

---

### 6. Agregar Tabla de Auditoría (Histórico de Cambios)
**Prioridad**: 🔴 CRÍTICA  
**Tiempo estimado**: 3-4 días

**Objetivo**: Registrar quién cambió qué y cuándo

**Tabla `audit_log`**:

```sql
CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,        -- 'clients', 'orders', 'sellers', etc.
  entity_id INTEGER NOT NULL,       -- ID del registro modificado
  user_id INTEGER,                  -- ID del usuario que hizo el cambio
  user_name TEXT,                   -- Nombre del usuario
  action TEXT NOT NULL,             -- 'CREATE', 'UPDATE', 'DELETE'
  old_values JSON,                  -- Valores anteriores (para UPDATE)
  new_values JSON,                  -- Valores nuevos
  changes JSON,                      -- Solo los campos que cambiaron
  ip_address TEXT,                  -- IP del usuario
  user_agent TEXT,                  -- Navegador/cliente
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_date ON audit_log(created_at);
```

**Implementación**:

```javascript
// backend/src/services/AuditService.js
class AuditService {
  async logChange(entityType, entityId, action, oldValues, newValues, userId, req) {
    // Registrar cambio en audit_log
  }
  
  async getHistory(entityType, entityId) {
    // Obtener histórico de cambios
  }
  
  async getUserActivity(userId, startDate, endDate) {
    // Obtener actividad de usuario
  }
}
```

**Middleware para capturar cambios**:

```javascript
// backend/src/middleware/auditMiddleware.js
// Interceptar todas las operaciones CRUD
```

**Archivos a crear**:
```
backend/src/services/AuditService.js
backend/src/middleware/auditMiddleware.js
backend/src/scripts/createAuditTable.js
backend/src/controllers/auditController.js
```

**Vistas para auditoría**:
```
src/components/AuditView/
├── AuditView.tsx
├── AuditLog.tsx
├── UserActivity.tsx
└── EntityHistory.tsx
```

---

### 7. Revisar y Optimizar Todos los Endpoints
**Prioridad**: 🟠 ALTA  
**Tiempo estimado**: 3-4 días

**Checklist de revisión**:

- [ ] **Validación de entrada**: Todos los endpoints validan datos
- [ ] **Manejo de errores**: Respuestas consistentes
- [ ] **Autenticación**: Todos los endpoints protegidos
- [ ] **Autorización**: Verificar permisos por rol
- [ ] **Rate limiting**: Protección contra abuso
- [ ] **Paginación**: Implementada donde corresponde
- [ ] **Filtros**: Búsqueda y filtrado funcional
- [ ] **Ordenamiento**: Múltiples campos de orden
- [ ] **Caché**: Implementado para GET
- [ ] **Documentación**: Cada endpoint documentado

**Endpoints a revisar**:

```
GET    /api/clients              ✅ Paginación, caché
POST   /api/clients              ✅ Validación, auditoría
GET    /api/clients/:id          ✅ Caché
PUT    /api/clients/:id          ✅ Validación, auditoría
DELETE /api/clients/:id          ✅ Auditoría

GET    /api/orders               ✅ Filtros, ordenamiento
POST   /api/orders               ✅ Validación completa
GET    /api/orders/:id           ✅ Caché
PUT    /api/orders/:id           ✅ Validación, auditoría
DELETE /api/orders/:id           ✅ Auditoría

GET    /api/receptions           ✅ Paginación
POST   /api/receptions           ✅ Validación
GET    /api/dispatches           ✅ Paginación
POST   /api/dispatches           ✅ Validación

... (todos los demás)
```

**Archivo de documentación**:
```
docs/API_ENDPOINTS.md (crear/actualizar)
```

---

## 🎯 FASE 2: PREPARACIÓN PARA MÚLTIPLES PROYECTOS (1-2 semanas)

---

## 📊 ANÁLISIS: DOS PROYECTOS PARALELOS EN UN SERVIDOR FÍSICO

### 🎯 ESCENARIO PROPUESTO

**Requisitos**:
- 2 proyectos independientes (2 marcas de ropa)
- Cada proyecto: 7-10 usuarios simultáneos
- Cada proyecto: ~8,000 registros anuales
- Ambos desplegados en servidor físico
- Funcionamiento paralelo

---

### 📈 ANÁLISIS DE VIABILIDAD

#### ✅ TOTALMENTE VIABLE

**Razones**:

1. **Volumen de datos BAJO**
   - 8,000 registros/año = ~22 registros/día
   - SQLite maneja fácilmente millones de registros
   - Tamaño BD estimado: 50-100 MB por proyecto
   - Total: 100-200 MB (insignificante)

2. **Usuarios BAJOS**
   - 7-10 usuarios simultáneos por proyecto
   - Total: 14-20 usuarios en servidor
   - Carga CPU: < 5%
   - Memoria: < 500 MB

3. **Arquitectura MODULAR**
   - Tu proyecto ya está refactorizado
   - Fácil de duplicar
   - Bajo acoplamiento

---

### 🏗️ ARQUITECTURA RECOMENDADA

#### Opción 1: DOS INSTANCIAS INDEPENDIENTES (RECOMENDADO)

```
Servidor Físico
├── Proyecto 1 (Marca A)
│   ├── Backend: Puerto 3001
│   ├── Frontend: Puerto 5001
│   ├── BD: database/marca-a.db
│   └── Logs: logs/marca-a/
│
├── Proyecto 2 (Marca B)
│   ├── Backend: Puerto 3002
│   ├── Frontend: Puerto 5002
│   ├── BD: database/marca-b.db
│   └── Logs: logs/marca-b/
│
└── Nginx (Reverse Proxy)
    ├── marca-a.tudominio.com → :5001
    ├── marca-b.tudominio.com → :5002
    └── api-a.tudominio.com → :3001
    └── api-b.tudominio.com → :3002
```

**Ventajas**:
- ✅ Aislamiento total
- ✅ Fallos en un proyecto NO afectan el otro
- ✅ Escalabilidad independiente
- ✅ Fácil de mantener
- ✅ Fácil de actualizar uno sin afectar el otro

**Desventajas**:
- ❌ Usa más recursos (pero aún mínimo)
- ❌ Dos procesos Node.js

---

#### Opción 2: UNA INSTANCIA CON MULTI-TENANCY

```
Servidor Físico
├── Backend Único: Puerto 3000
│   ├── Middleware de tenant
│   ├── BD compartida con columna tenant_id
│   └── Contexto aislado por tenant
│
├── Frontend 1: Puerto 5001 (Marca A)
├── Frontend 2: Puerto 5002 (Marca B)
│
└── Nginx (Reverse Proxy)
```

**Ventajas**:
- ✅ Menos recursos
- ✅ Un solo backend
- ✅ Código compartido

**Desventajas**:
- ❌ Más complejo de implementar
- ❌ Riesgo de data leak entre tenants
- ❌ Más difícil de debuggear
- ❌ Fallos afectan ambos proyectos

---

### 🎯 RECOMENDACIÓN: OPCIÓN 1 (DOS INSTANCIAS)

**Por qué**:
1. Tu servidor físico tiene recursos suficientes
2. Simplicidad > complejidad
3. Seguridad de datos
4. Mantenimiento más fácil
5. Escalabilidad futura

---

### 💾 ANÁLISIS DE BASE DE DATOS

#### Tamaño estimado por proyecto

```
Tabla              Registros/año    Tamaño estimado
─────────────────────────────────────────────────
clients            50-100           5-10 KB
sellers            20-30            2-5 KB
confeccionistas    30-50            3-8 KB
references         200-500          20-50 KB
orders             8,000            800 KB - 1 MB
order_items        16,000           1.5-2 MB
receptions         8,000            800 KB - 1 MB
dispatches         8,000            800 KB - 1 MB
delivery_dates     8,000            800 KB - 1 MB
audit_log          50,000           5-10 MB
─────────────────────────────────────────────────
TOTAL              ~100,000         10-20 MB
```

**Conclusión**: Cada BD ~20-50 MB, ambas ~40-100 MB total

---

### ⚡ ANÁLISIS DE RENDIMIENTO

#### Recursos del servidor

```
Recurso          Disponible    Proyecto 1    Proyecto 2    Total Usado
─────────────────────────────────────────────────────────────────────
CPU              8 cores       1-2%          1-2%          2-4%
RAM              16 GB         150 MB        150 MB        300 MB
Disco            500 GB        50 MB BD      50 MB BD      100 MB
Ancho banda      1 Gbps        ~1 Mbps       ~1 Mbps       ~2 Mbps
```

**Conclusión**: Recursos más que suficientes ✅

---

### 🔒 CONSIDERACIONES DE SEGURIDAD

#### Aislamiento de datos

```
✅ Bases de datos separadas
   → Imposible data leak entre proyectos
   
✅ Usuarios separados
   → Cada proyecto tiene su BD de usuarios
   
✅ Autenticación independiente
   → Tokens JWT separados
   
✅ Logs separados
   → Auditoría independiente
```

---

### 📋 PLAN DE IMPLEMENTACIÓN

#### Fase 1: Preparación (1 día)

```bash
# 1. Crear estructura de directorios
mkdir -p /opt/proyectos/marca-a
mkdir -p /opt/proyectos/marca-b
mkdir -p /opt/proyectos/logs

# 2. Copiar proyecto base
cp -r . /opt/proyectos/marca-a
cp -r . /opt/proyectos/marca-b

# 3. Configurar .env para cada proyecto
# marca-a/.env
PORT=3001
FRONTEND_PORT=5001
DB_PATH=./database/marca-a.db
PROJECT_NAME=Marca A

# marca-b/.env
PORT=3002
FRONTEND_PORT=5002
DB_PATH=./database/marca-b.db
PROJECT_NAME=Marca B
```

#### Fase 2: Configuración de Nginx (1 día)

```nginx
# /etc/nginx/sites-available/proyectos

upstream marca_a_backend {
    server localhost:3001;
}

upstream marca_b_backend {
    server localhost:3002;
}

server {
    listen 80;
    server_name marca-a.tudominio.com;
    
    location / {
        proxy_pass http://localhost:5001;
    }
    
    location /api {
        proxy_pass http://marca_a_backend;
    }
}

server {
    listen 80;
    server_name marca-b.tudominio.com;
    
    location / {
        proxy_pass http://localhost:5002;
    }
    
    location /api {
        proxy_pass http://marca_b_backend;
    }
}
```

#### Fase 3: Automatización con PM2 (1 día)

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'marca-a-backend',
      script: './backend/src/server.js',
      cwd: '/opt/proyectos/marca-a',
      env: { PORT: 3001 },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      error_file: './logs/marca-a-error.log',
      out_file: './logs/marca-a-out.log'
    },
    {
      name: 'marca-b-backend',
      script: './backend/src/server.js',
      cwd: '/opt/proyectos/marca-b',
      env: { PORT: 3002 },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      error_file: './logs/marca-b-error.log',
      out_file: './logs/marca-b-out.log'
    }
  ]
};
```

---

### 🚀 VENTAJAS DE ESTA ARQUITECTURA

| Aspecto | Beneficio |
|--------|-----------|
| **Escalabilidad** | Cada proyecto escala independientemente |
| **Confiabilidad** | Fallo en uno NO afecta el otro |
| **Mantenimiento** | Actualizaciones sin downtime |
| **Seguridad** | Datos completamente aislados |
| **Rendimiento** | Recursos dedicados por proyecto |
| **Debugging** | Logs separados, fácil de diagnosticar |
| **Backup** | Backup independiente por proyecto |

---

### ⚠️ LIMITACIONES Y CONSIDERACIONES

#### Limitaciones actuales

```
❌ SQLite no es ideal para >100 usuarios simultáneos
   → Tu caso: 7-10 usuarios ✅ OK

❌ SQLite no soporta replicación
   → Solución: Backup automático diario

❌ SQLite tiene límite de conexiones
   → Tu caso: ~20 conexiones total ✅ OK

❌ No hay clustering nativo
   → Solución: Usar PM2 con reinicio automático
```

#### Cuándo migrar a PostgreSQL

```
Migrar a PostgreSQL cuando:
- > 100 usuarios simultáneos por proyecto
- > 1 millón de registros por proyecto
- Necesites replicación/backup en tiempo real
- Necesites múltiples servidores

Tu caso actual: SQLite es perfecto ✅
```

---

### 📊 COMPARATIVA: SQLite vs PostgreSQL

| Criterio | SQLite | PostgreSQL |
|----------|--------|-----------|
| **Usuarios simultáneos** | 10-50 | 100+ |
| **Registros** | 1M+ | 1B+ |
| **Complejidad** | Baja | Alta |
| **Recursos** | Mínimos | Moderados |
| **Costo** | Gratis | Gratis |
| **Mantenimiento** | Mínimo | Moderado |
| **Tu caso** | ✅ IDEAL | ❌ Overkill |

---

### 🎯 CONCLUSIÓN

**¿Es viable tener dos proyectos paralelos?**

### ✅ SÍ, TOTALMENTE VIABLE

**Recomendación final**:

1. **Usa Opción 1**: Dos instancias independientes
2. **Mantén SQLite**: Perfecto para tu volumen
3. **Implementa PM2**: Para gestión automática
4. **Configura Nginx**: Como reverse proxy
5. **Automatiza backups**: Diarios por proyecto
6. **Monitorea recursos**: Con htop/Grafana

**Recursos necesarios**:
- CPU: 2-4% (tienes 8 cores)
- RAM: 300-500 MB (tienes 16 GB)
- Disco: 100-200 MB (tienes 500 GB)

**Conclusión**: Tu servidor físico puede manejar fácilmente 5-10 proyectos similares sin problemas.

---

## 📅 CRONOGRAMA TOTAL

| Fase | Tarea | Duración | Inicio |
|------|-------|----------|--------|
| 1 | Caché | 3-4 días | Semana 1 |
| 1 | Context API | 4-5 días | Semana 1-2 |
| 1 | Paginación | 5-6 días | Semana 2 |
| 1 | MastersView | 4-5 días | Semana 2-3 |
| 1 | Índices BD | 1-2 días | Semana 3 |
| 1 | Auditoría | 3-4 días | Semana 3 |
| 1 | Endpoints | 3-4 días | Semana 3-4 |
| **Total Fase 1** | | **3-4 semanas** | |
| 2 | Multi-proyecto | 3-4 días | Semana 5 |

---

## ✅ PRÓXIMOS PASOS

1. **Revisar este plan** con tu equipo
2. **Priorizar tareas** según urgencia
3. **Crear specs** para cada mejora
4. **Comenzar con Fase 1**
5. **Preparar servidor** para Fase 2

---

**Documento creado**: Febrero 2025  
**Versión**: 1.0  
**Estado**: Listo para implementación
