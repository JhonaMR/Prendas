# Documentación de Base de Datos - Sistema de Producción

## 📋 Índice

1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Esquema de Base de Datos](#esquema-de-base-de-datos)
4. [Conexiones y Configuración](#conexiones-y-configuración)
5. [Migración de Datos](#migración-de-datos)
6. [Backup y Restauración](#backup-y-restauración)
7. [Operaciones CRUD](#operaciones-crud)
8. [Resolución de Problemas](#resolución-de-problemas)
9. [Referencias](#referencias)

## Introducción

Esta documentación describe la arquitectura, configuración y operación del sistema de base de datos para el sistema de producción de confección. El sistema maneja base de datos basada en PostgreSQL para mejorar el rendimiento, escalabilidad y confiabilidad.

### 🎯 Objetivos del Sistema

- **Alta disponibilidad**: Sistema 24/7 para operaciones de producción
- **Escalabilidad**: Soporte para crecimiento futuro del negocio
- **Integridad de datos**: Garantía de consistencia y precisión
- **Rendimiento**: Respuesta rápida para operaciones críticas
- **Mantenibilidad**: Fácil mantenimiento y actualización

### 📊 Tecnologías Utilizadas

- **PostgreSQL 14+**: Sistema de gestión de bases de datos relacional
- **Node.js 18+**: Entorno de ejecución para el backend
- **Express.js**: Framework para API REST
- **pg (node-postgres)**: Cliente PostgreSQL para Node.js
- **Jest**: Framework de testing

## Arquitectura del Sistema

### Diagrama de Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   PostgreSQL    │
│   (React)       │◄──►│   (Node.js)     │◄──►│   Database      │
│                 │    │                 │    │                 │
│  • Interfaz     │    │  • Controladores│    │  • Tablas       │
│  • Componentes  │    │  • Servicios    │    │  • Índices      │
│  • Estado       │    │  • Validadores  │    │  • Restricciones│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                         ┌─────────────────┐
                         │   Utilidades    │
                         │                 │
                         │  • Migración    │
                         │  • Backup       │
                         │  • Verificación │
                         └─────────────────┘
```

### Flujo de Datos

1. **Cliente → API**: Solicitudes HTTP (GET, POST, PUT, DELETE)
2. **API → Servicio**: Lógica de negocio y validación
3. **Servicio → PostgreSQL**: Consultas SQL parametrizadas
4. **PostgreSQL → Servicio**: Resultados de consultas
5. **Servicio → API**: Transformación de datos
6. **API → Cliente**: Respuestas JSON

### Componentes Principales

| Componente | Descripción | Responsabilidad |
|------------|-------------|-----------------|
| **Frontend** | Interfaz de usuario React | Presentación de datos, interacción usuario |
| **Backend API** | Servidor Node.js/Express | Procesamiento de solicitudes, lógica de negocio |
| **PostgreSQL** | Base de datos relacional | Almacenamiento persistente, integridad de datos |
| **Scripts de Utilidad** | Herramientas de administración | Migración, backup, verificación, mantenimiento |

## Esquema de Base de Datos

### Tabla Principal: `clients`

La tabla `clients` almacena la información de los clientes del sistema.

#### Estructura de la Tabla

```sql
CREATE TABLE clients (
    -- Identificación
    id VARCHAR(255) PRIMARY KEY,           -- ID único del cliente (consecutivo manual)
    name VARCHAR(255) NOT NULL,            -- Nombre del cliente
    
    -- Información de contacto
    nit VARCHAR(50),                       -- Número de Identificación Tributaria
    address TEXT,                          -- Dirección completa
    city VARCHAR(100),                     -- Ciudad
    
    -- Relaciones
    seller_id VARCHAR(255),                -- ID del vendedor asignado
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Fecha de creación
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP   -- Fecha de última actualización
);
```

#### Descripción de Campos

| Campo | Tipo | Nullable | Descripción | Ejemplo |
|-------|------|----------|-------------|---------|
| `id` | VARCHAR(255) | NO | Identificador único del cliente. Se asigna manualmente como consecutivo. | `"CLI-001"`, `"CLI-2024-1001"` |
| `name` | VARCHAR(255) | NO | Nombre completo del cliente. Campo obligatorio. | `"Empresa Textil S.A."` |
| `nit` | VARCHAR(50) | YES | Número de Identificación Tributaria. Puede ser NULL. | `"123456789-0"` |
| `address` | TEXT | YES | Dirección física completa. Campo de texto largo. | `"Carrera 10 #20-30, Bogotá"` |
| `city` | VARCHAR(100) | YES | Ciudad donde se encuentra el cliente. | `"Medellín"` |
| `seller_id` | VARCHAR(255) | YES | ID del vendedor asignado al cliente. Relación con tabla sellers. | `"VEND-001"` |
| `created_at` | TIMESTAMP | YES | Fecha y hora de creación del registro. Se establece automáticamente. | `2024-01-15 10:30:00` |
| `updated_at` | TIMESTAMP | YES | Fecha y hora de última actualización. Se actualiza automáticamente. | `2024-01-20 14:45:00` |

### Tabla Relacionada: `sellers`

```sql
CREATE TABLE sellers (
    id VARCHAR(255) PRIMARY KEY,           -- ID único del vendedor
    name VARCHAR(255) NOT NULL,            -- Nombre del vendedor
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Índices para Optimización

```sql
-- Índice para búsquedas por vendedor
CREATE INDEX idx_clients_seller_id ON clients(seller_id);

-- Índice para búsquedas por nombre
CREATE INDEX idx_clients_name ON clients(name);

-- Índice para búsquedas por NIT
CREATE INDEX idx_clients_nit ON clients(nit);
```

### Restricciones de Integridad

```sql
-- Restricción FOREIGN KEY (opcional, dependiendo de la configuración)
ALTER TABLE clients 
ADD CONSTRAINT fk_clients_seller_id 
FOREIGN KEY (seller_id) 
REFERENCES sellers(id);
```

---

**📁 Documentación Relacionada:**
- [Esquema de Tablas](./esquema-tablas.md)
- [Conexiones y API](./conexiones-api.md)
- [Migración de Datos](./migracion-datos.md)
- [Backup y Restauración](./backup-restore.md)
- [Resolución de Problemas](./troubleshooting.md)

**Última Actualización:** 18 de Febrero de 2026  
**Versión:** 1.0.0  
**Responsable:** Equipo de Desarrollo