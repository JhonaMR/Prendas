# Requirements Document: Refactorización de Módulos Monolíticos

## Introduction

Este proyecto requiere refactorizar dos archivos monolíticos que sostienen toda la aplicación:
- **backend/src/controllers/crudController.js**: Contiene 20+ funciones CRUD para 6 entidades
- **src/views/App.tsx**: Componente principal con estado global y 12 vistas

El objetivo es dividir estos archivos en módulos más pequeños, mantenibles y testables, permitiendo desarrollo paralelo y reduciendo riesgos de regresiones.

## Glossary

- **CRUD**: Create, Read, Update, Delete - operaciones básicas de datos
- **Entity**: Entidad de negocio (References, Clients, Confeccionistas, Sellers, Correrias, Users)
- **AppState**: Estado global de la aplicación que contiene 10+ arrays
- **Hook**: Función personalizada de React que encapsula lógica reutilizable
- **Controller**: Módulo backend que maneja operaciones CRUD para una entidad
- **View**: Componente React que renderiza una sección de la interfaz
- **Monolithic**: Archivo único que contiene múltiples responsabilidades
- **Modular**: Arquitectura dividida en módulos independientes con responsabilidades claras
- **Backward Compatibility**: Capacidad de mantener funcionamiento con código existente
- **Incremental Migration**: Proceso de cambio gradual sin romper funcionalidad

## Requirements

### Requirement 1: Separación de CRUD por Entidad en Backend

**User Story:** Como desarrollador backend, quiero que cada entidad tenga su propio módulo CRUD, para que pueda trabajar en paralelo sin conflictos y entender rápidamente qué operaciones afectan cada entidad.

#### Acceptance Criteria

1. WHEN se accede a operaciones CRUD de una entidad THEN el sistema SHALL cargar el controlador específico de esa entidad desde un archivo dedicado
2. WHEN se crea un nuevo controlador de entidad THEN el sistema SHALL exportar funciones CRUD (create, read, update, delete, list) con una interfaz consistente
3. WHEN se ejecuta una operación CRUD THEN el sistema SHALL validar los datos de entrada antes de procesarlos
4. WHEN se completa una operación CRUD THEN el sistema SHALL retornar una respuesta consistente con estructura {success, data, error}
5. WHEN se produce un error en una operación CRUD THEN el sistema SHALL capturar el error y retornar un mensaje descriptivo sin exponer detalles internos

### Requirement 2: Extracción de Lógica de Estado Global en Frontend

**User Story:** Como desarrollador frontend, quiero que la lógica de estado global esté separada del componente App.tsx, para que pueda entender y modificar el estado sin navegar por cientos de líneas de código.

#### Acceptance Criteria

1. WHEN la aplicación inicia THEN el sistema SHALL crear un contexto de estado global que contenga todos los arrays de datos
2. WHEN se actualiza un dato en el estado THEN el sistema SHALL notificar a todos los componentes suscritos sin re-renderizar innecesariamente
3. WHEN se carga la aplicación THEN el sistema SHALL cargar todos los datos iniciales desde el backend de forma centralizada
4. WHEN se produce un cambio de estado THEN el sistema SHALL mantener la consistencia entre el estado global y los componentes locales
5. WHEN se accede al estado desde un componente THEN el sistema SHALL proporcionar acceso de solo lectura a los datos sin permitir mutaciones directas

### Requirement 3: Creación de Hooks Personalizados para Manejo de Datos

**User Story:** Como desarrollador frontend, quiero hooks personalizados que encapsulen la lógica de datos, para que pueda reutilizar operaciones CRUD en múltiples componentes sin duplicar código.

#### Acceptance Criteria

1. WHEN un componente necesita operaciones CRUD THEN el sistema SHALL proporcionar un hook personalizado que exponga create, read, update, delete, list
2. WHEN se ejecuta una operación a través del hook THEN el sistema SHALL actualizar automáticamente el estado global y el estado local del componente
3. WHEN se produce un error en una operación THEN el hook SHALL retornar el error en un formato consistente para que el componente lo maneje
4. WHEN se carga un hook THEN el sistema SHALL permitir pasar opciones de configuración (filtros, paginación, etc.)
5. WHEN se desmonta un componente que usa el hook THEN el sistema SHALL limpiar recursos y cancelar peticiones pendientes

### Requirement 4: Separación de Vistas en Componentes Independientes

**User Story:** Como desarrollador frontend, quiero que cada vista sea un componente independiente, para que pueda desarrollar, testear y mantener cada sección de forma aislada.

#### Acceptance Criteria

1. WHEN se renderiza una vista THEN el sistema SHALL cargar solo los datos necesarios para esa vista
2. WHEN se cambia entre vistas THEN el sistema SHALL mantener el estado de la vista anterior sin perderlo
3. WHEN una vista necesita datos THEN el sistema SHALL obtenerlos del estado global o del backend según corresponda
4. WHEN se actualiza un dato en una vista THEN el sistema SHALL reflejar el cambio en todas las vistas que lo usan
5. WHEN se renderiza una vista THEN el sistema SHALL no incluir lógica de otras vistas en el mismo archivo

### Requirement 5: Mantener Compatibilidad con Código Existente

**User Story:** Como líder técnico, quiero que la refactorización sea compatible con el código existente, para que no rompamos funcionalidad durante la migración.

#### Acceptance Criteria

1. WHEN se ejecuta código existente THEN el sistema SHALL funcionar sin cambios en la interfaz pública
2. WHEN se migra un componente a la nueva arquitectura THEN el sistema SHALL mantener el mismo comportamiento observable
3. WHEN se llama a una función CRUD THEN el sistema SHALL retornar datos en el mismo formato que antes
4. WHEN se accede al estado desde código antiguo THEN el sistema SHALL proporcionar un adaptador que traduzca a la nueva estructura
5. WHEN se completa la migración THEN el sistema SHALL permitir que código antiguo y nuevo coexistan sin conflictos

### Requirement 6: Implementar Cambios Incrementales y Seguros

**User Story:** Como desarrollador, quiero que los cambios se hagan de forma incremental, para que pueda validar cada paso y evitar romper la aplicación.

#### Acceptance Criteria

1. WHEN se refactoriza un módulo THEN el sistema SHALL mantener tests pasando después de cada cambio
2. WHEN se migra una entidad THEN el sistema SHALL crear el nuevo módulo antes de eliminar el código antiguo
3. WHEN se completa una migración THEN el sistema SHALL ejecutar tests de integración para validar que todo funciona
4. WHEN se identifica un problema THEN el sistema SHALL permitir revertir cambios sin afectar otras migraciones
5. WHEN se documenta un módulo THEN el sistema SHALL incluir ejemplos de uso para facilitar la adopción

### Requirement 7: Crear Estructura de Directorios Modular

**User Story:** Como arquitecto de software, quiero una estructura de directorios clara y consistente, para que sea fácil encontrar código y entender la organización del proyecto.

#### Acceptance Criteria

1. WHEN se busca código de una entidad THEN el sistema SHALL encontrarlo en una ubicación predecible y consistente
2. WHEN se crea un nuevo módulo THEN el sistema SHALL seguir la misma estructura que los módulos existentes
3. WHEN se navega el proyecto THEN el sistema SHALL ver una jerarquía clara de responsabilidades
4. WHEN se documenta la estructura THEN el sistema SHALL incluir un diagrama o descripción de la organización
5. WHEN se agrega una nueva entidad THEN el sistema SHALL poder hacerlo sin modificar la estructura existente

### Requirement 8: Implementar Validación Centralizada de Datos

**User Story:** Como desarrollador, quiero que la validación de datos esté centralizada, para que no haya inconsistencias entre frontend y backend.

#### Acceptance Criteria

1. WHEN se valida un dato en el backend THEN el sistema SHALL aplicar las mismas reglas que en el frontend
2. WHEN se recibe un dato inválido THEN el sistema SHALL retornar un error descriptivo indicando qué campo es inválido
3. WHEN se define un esquema de validación THEN el sistema SHALL reutilizarlo en múltiples lugares sin duplicación
4. WHEN se actualiza una regla de validación THEN el sistema SHALL aplicarse automáticamente en todos los lugares que la usan
5. WHEN se valida un objeto complejo THEN el sistema SHALL validar todos los campos y retornar todos los errores de una vez

### Requirement 9: Crear Sistema de Logging y Debugging

**User Story:** Como desarrollador, quiero un sistema de logging consistente, para que pueda debuggear problemas rápidamente sin agregar console.log en todas partes.

#### Acceptance Criteria

1. WHEN se ejecuta una operación CRUD THEN el sistema SHALL registrar la operación con timestamp y parámetros
2. WHEN se produce un error THEN el sistema SHALL registrarlo con stack trace y contexto relevante
3. WHEN se habilita modo debug THEN el sistema SHALL mostrar logs detallados sin afectar performance en producción
4. WHEN se revisan logs THEN el sistema SHALL poder filtrar por entidad, operación o nivel de severidad
5. WHEN se despliega a producción THEN el sistema SHALL registrar solo errores críticos sin afectar performance

### Requirement 10: Documentar Arquitectura y Patrones

**User Story:** Como nuevo desarrollador, quiero documentación clara de la arquitectura, para que pueda entender cómo funciona el proyecto sin hacer muchas preguntas.

#### Acceptance Criteria

1. WHEN se lee la documentación THEN el sistema SHALL explicar la estructura general del proyecto
2. WHEN se busca cómo implementar una característica THEN el sistema SHALL encontrar ejemplos de patrones comunes
3. WHEN se agrega una nueva entidad THEN el sistema SHALL poder seguir un checklist de pasos sin ambigüedad
4. WHEN se revisa el código THEN el sistema SHALL encontrar comentarios explicando decisiones arquitectónicas
5. WHEN se necesita debuggear THEN el sistema SHALL tener guías de troubleshooting para problemas comunes
