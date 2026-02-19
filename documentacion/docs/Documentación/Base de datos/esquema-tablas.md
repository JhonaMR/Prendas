# Esquema de Tablas - Documentación Detallada

## 📋 Tabla `clients`

### Descripción General
La tabla `clients` es la tabla principal del sistema que almacena toda la información de los clientes. Cada cliente representa una empresa o persona que realiza pedidos en el sistema de producción.

### Estructura Completa

```sql
-- Script completo de creación de tabla
CREATE TABLE IF NOT EXISTS clients (
    -- Identificación única
    id VARCHAR(255) PRIMARY KEY,
    
    -- Información básica (obligatoria)
    name VARCHAR(255) NOT NULL,
    
    -- Información de contacto (opcional)
    nit VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    
    -- Relación con vendedores
    seller_id VARCHAR(255),
    
    -- Metadatos de auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_clients_seller_id ON clients(seller_id);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_nit ON clients(nit);

-- Restricción de integridad referencial (si está habilitada)
-- ALTER TABLE clients ADD CONSTRAINT fk_clients_seller_id 
-- FOREIGN KEY (seller_id) REFERENCES sellers(id);
```

### Detalles por Campo

#### 1. `id` - Identificador Único
- **Tipo:** `VARCHAR(255)`
- **Nullable:** `NO` (Primary Key)
- **Descripción:** Identificador único del cliente. Se asigna manualmente siguiendo un sistema de consecutivos.
- **Formato Recomendado:** `"CLI-" + consecutivo` (ej: `"CLI-001"`, `"CLI-2024-1001"`)
- **Consideraciones:**
  - No es auto-incremental
  - Se debe asignar manualmente al crear el cliente
  - Debe ser único en todo el sistema
  - Se recomienda usar un prefijo para identificar el tipo de entidad

#### 2. `name` - Nombre del Cliente
- **Tipo:** `VARCHAR(255)`
- **Nullable:** `NO`
- **Descripción:** Nombre completo o razón social del cliente.
- **Longitud Máxima:** 255 caracteres
- **Consideraciones:**
  - Campo obligatorio
  - Se usa en búsquedas y reportes
  - Índice creado para optimizar búsquedas

#### 3. `nit` - Número de Identificación Tributaria
- **Tipo:** `VARCHAR(50)`
- **Nullable:** `YES`
- **Descripción:** Número de identificación fiscal del cliente.
- **Formato:** Depende del país (ej: Colombia: `"123456789-0"`)
- **Consideraciones:**
  - Campo opcional
  - Único por cliente (a nivel de negocio, no a nivel de base de datos)
  - Índice creado para búsquedas rápidas

#### 4. `address` - Dirección
- **Tipo:** `TEXT`
- **Nullable:** `YES`
- **Descripción:** Dirección física completa del cliente.
- **Consideraciones:**
  - Campo opcional
  - Tipo `TEXT` para direcciones largas
  - Puede contener saltos de línea y caracteres especiales

#### 5. `city` - Ciudad
- **Tipo:** `VARCHAR(100)`
- **Nullable:** `YES`
- **Descripción:** Ciudad donde se encuentra el cliente.
- **Consideraciones:**
  - Campo opcional
  - Se usa para filtros geográficos
  - Máximo 100 caracteres

#### 6. `seller_id` - ID del Vendedor
- **Tipo:** `VARCHAR(255)`
- **Nullable:** `YES`
- **Descripción:** Identificador del vendedor asignado al cliente.
- **Relación:** Referencia a tabla `sellers(id)` (si la restricción FOREIGN KEY está habilitada)
- **Consideraciones:**
  - Campo opcional (un cliente puede no tener vendedor asignado)
  - Índice creado para optimizar joins y filtros
  - Si se habilita FOREIGN KEY, debe existir en tabla `sellers`

#### 7. `created_at` - Fecha de Creación
- **Tipo:** `TIMESTAMP`
- **Nullable:** `YES` (pero siempre tiene valor por DEFAULT)
- **Valor por Defecto:** `CURRENT_TIMESTAMP`
- **Descripción:** Fecha y hora exacta cuando se creó el registro.
- **Consideraciones:**
  - Se establece automáticamente al insertar
  - No se debe modificar manualmente
  - Útil para auditoría y reportes históricos

#### 8. `updated_at` - Fecha de Actualización
- **Tipo:** `TIMESTAMP`
- **Nullable:** `YES` (pero siempre tiene valor por DEFAULT)
- **Valor por Defecto:** `CURRENT_TIMESTAMP`
- **Descripción:** Fecha y hora de la última modificación del registro.
- **Consideraciones:**
  - Se actualiza automáticamente en operaciones UPDATE
  - Se debe actualizar manualmente en el código de la aplicación
  - Útil para sincronización y detección de cambios

### Índices

#### 1. `idx_clients_seller_id`
- **Campos:** `seller_id`
- **Tipo:** B-tree
- **Propósito:** Optimizar búsquedas y filtros por vendedor
- **Uso:** `WHERE seller_id = '...'`, `JOIN` con tabla sellers

#### 2. `idx_clients_name`
- **Campos:** `name`
- **Tipo:** B-tree
- **Propósito:** Optimizar búsquedas por nombre
- **Uso:** `WHERE name LIKE '...%'`, ordenamiento por nombre

#### 3. `idx_clients_nit`
- **Campos:** `nit`
- **Tipo:** B-tree
- **Propósito:** Optimizar búsquedas por NIT
- **Uso:** `WHERE nit = '...'`

### Restricciones

#### 1. PRIMARY KEY (`id`)
- **Tipo:** Primary Key
- **Campos:** `id`
- **Efecto:** Garantiza unicidad e identificación única de cada registro
- **Comportamiento:** Rechaza inserciones con `id` duplicado

#### 2. FOREIGN KEY (`seller_id`) [OPCIONAL]
- **Tipo:** Foreign Key
- **Campos:** `seller_id`
- **Referencia:** `sellers(id)`
- **Efecto:** Garantiza integridad referencial
- **Comportamiento:** 
  - `ON INSERT/UPDATE`: Rechaza si `seller_id` no existe en `sellers`
  - `ON DELETE`: Depende de la configuración (RESTRICT, CASCADE, SET NULL)

### Modelo de Datos en Código

#### TypeScript/JavaScript Interface
```typescript
interface Client {
    // Identificación
    id: string;
    
    // Información básica
    name: string;
    nit?: string;
    address?: string;
    city?: string;
    
    // Relaciones
    seller_id?: string;
    
    // Auditoría
    created_at: Date;
    updated_at: Date;
}

// Para creación (sin campos de auditoría)
interface CreateClientInput {
    id: string;
    name: string;
    nit?: string;
    address?: string;
    city?: string;
    seller_id?: string;
}

// Para actualización (solo campos modificables)
interface UpdateClientInput {
    name?: string;
    nit?: string;
    address?: string;
    city?: string;
    seller_id?: string;
}
```

#### Ejemplos de Datos

```json
{
    "id": "CLI-2024-001",
    "name": "Textiles del Norte S.A.",
    "nit": "900123456-7",
    "address": "Carrera 50 # 80-100, Bodega 5\nZona Industrial",
    "city": "Barranquilla",
    "seller_id": "VEND-003",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-02-18T14:20:00.000Z"
}

{
    "id": "CLI-2024-002",
    "name": "Confecciones María",
    "nit": null,
    "address": "Calle 10 # 20-30, Local 2",
    "city": "Medellín",
    "seller_id": null,
    "created_at": "2024-01-16T09:15:00.000Z",
    "updated_at": "2024-01-16T09:15:00.000Z"
}
```

### Consultas Comunes

#### 1. Obtener todos los clientes
```sql
SELECT id, name, nit, address, city, seller_id, 
       created_at, updated_at
FROM clients
ORDER BY name;
```

#### 2. Buscar cliente por ID
```sql
SELECT * FROM clients WHERE id = 'CLI-2024-001';
```

#### 3. Buscar clientes por vendedor
```sql
SELECT c.*, s.name as seller_name
FROM clients c
LEFT JOIN sellers s ON c.seller_id = s.id
WHERE c.seller_id = 'VEND-003'
ORDER BY c.name;
```

#### 4. Buscar clientes por nombre (búsqueda parcial)
```sql
SELECT * FROM clients 
WHERE name ILIKE '%textil%'
ORDER BY name
LIMIT 20;
```

#### 5. Contar clientes por ciudad
```sql
SELECT city, COUNT(*) as client_count
FROM clients
WHERE city IS NOT NULL
GROUP BY city
ORDER BY client_count DESC;
```

#### 6. Actualizar cliente
```sql
UPDATE clients 
SET name = 'Nuevo Nombre',
    city = 'Nueva Ciudad',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'CLI-2024-001';
```

#### 7. Insertar nuevo cliente
```sql
INSERT INTO clients (id, name, nit, address, city, seller_id)
VALUES ('CLI-2024-100', 'Nuevo Cliente', '123456789-0', 
        'Dirección Ejemplo', 'Ciudad Ejemplo', 'VEND-001');
```

### Consideraciones de Rendimiento

#### 1. Tamaño de la Tabla
- **Estimación:** ~1KB por registro
- **100,000 registros:** ~100MB
- **1,000,000 registros:** ~1GB

#### 2. Índices
- **Espacio:** ~30% del tamaño de la tabla
- **Mantenimiento:** Los índices se actualizan automáticamente en INSERT/UPDATE/DELETE
- **Reindexación:** Recomendada periódicamente para mantener rendimiento

#### 3. Particionamiento
Para tablas muy grandes (>10 millones de registros), considerar:
- **Particionamiento por rango:** Por fecha de creación
- **Particionamiento por lista:** Por ciudad o región

### Mantenimiento

#### 1. Vacuum y Analyze
```sql
-- Liberar espacio y actualizar estadísticas
VACUUM ANALYZE clients;

-- Vacuum completo (requiere más tiempo)
VACUUM FULL clients;
```

#### 2. Reindexar
```sql
-- Reconstruir todos los índices
REINDEX TABLE clients;

-- Reconstruir índice específico
REINDEX INDEX idx_clients_name;
```

#### 3. Estadísticas
```sql
-- Ver tamaño de la tabla
SELECT 
    pg_size_pretty(pg_total_relation_size('clients')) as total_size,
    pg_size_pretty(pg_relation_size('clients')) as table_size,
    pg_size_pretty(pg_indexes_size('clients')) as indexes_size;

-- Ver número de registros
SELECT COUNT(*) as total_clients FROM clients;
```

### Migración y Evolución

#### 1. Agregar Nuevo Campo
```sql
ALTER TABLE clients 
ADD COLUMN phone VARCHAR(20);
```

#### 2. Modificar Tipo de Campo
```sql
ALTER TABLE clients 
ALTER COLUMN city TYPE VARCHAR(150);
```

#### 3. Agregar Nueva Restricción
```sql
ALTER TABLE clients 
ADD CONSTRAINT chk_city_length 
CHECK (LENGTH(city) <= 150);
```

#### 4. Eliminar Campo (CUIDADO)
```sql
-- Primero hacer backup
-- Luego eliminar
ALTER TABLE clients 
DROP COLUMN phone;
```

---

**📊 Estadísticas de la Tabla:**
- **Registros Actuales:** 307 (después de migración)
- **Tamaño Estimado:** ~300KB
- **Índices:** 3 índices B-tree
- **Crecimiento Estimado:** ~100 registros/mes

**🔧 Scripts Relacionados:**
- `backend/src/scripts/diagnoseClientsSchema.js` - Diagnóstico del esquema
- `backend/src/scripts/fixClientsSchema.js` - Corrección del esquema
- `backend/src/scripts/migrateClientsData.js` - Migración de datos

**📈 Monitoreo Recomendado:**
- Tamaño de la tabla semanalmente
- Rendimiento de consultas frecuentes
- Uso de índices