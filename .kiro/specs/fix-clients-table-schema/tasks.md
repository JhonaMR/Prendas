# Implementation Plan: Fix Clients Table Schema

## Overview

Implementar la corrección del esquema de la tabla `clients` en PostgreSQL para que coincida con lo que el código en `clientsService.js` espera. Esto incluye diagnosticar el estado actual, corregir el esquema, migrar datos de SQLite si es necesario, y verificar que todo funcione correctamente.

## Tasks

- [x] 1. Diagnosticar el estado actual del esquema
  - [x] 1.1 Crear script de diagnóstico para verificar estructura de tabla clients
    - Verificar si la tabla `clients` existe en PostgreSQL
    - Listar todas las columnas actuales de la tabla
    - Comparar con el esquema esperado (id, name, nit, address, city, seller_id, active)
    - Reportar diferencias encontradas
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ]* 1.2 Escribir test de propiedad para verificación de esquema
    - **Property 1: Schema Completeness**
    - **Validates: Requirements 1.1, 1.2, 1.3**

- [x] 2. Corregir el esquema de la tabla clients
  - [x] 2.1 Crear o modificar tabla clients con esquema correcto
    - Si la tabla no existe: crear con todas las columnas requeridas
    - Si la tabla existe: agregar columnas faltantes (nit, address, city, seller_id, active)
    - Definir tipos de datos apropiados (VARCHAR, TEXT, BOOLEAN)
    - Agregar columna `updated_at` para auditoría
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

  - [x] 2.2 Agregar restricciones de integridad
    - Agregar FOREIGN KEY constraint: `seller_id` → `sellers(id)`
    - Agregar DEFAULT value para `active` (TRUE)
    - Agregar NOT NULL constraint para `id` y `name`
    - _Requirements: 1.5, 2.4_

  - [ ]* 2.3 Escribir test de propiedad para integridad referencial
    - **Property 3: Foreign Key Integrity**
    - **Validates: Requirements 1.5, 2.4**

- [x] 3. Checkpoint - Verificar esquema corregido
  - Ejecutar script de diagnóstico nuevamente para confirmar correcciones
  - Verificar que todas las columnas requeridas existan
  - Confirmar que las restricciones de integridad estén aplicadas
  - Asegurar que todos los tests pasen, preguntar al usuario si hay dudas

- [x] 4. Migrar datos de SQLite a PostgreSQL (si es necesario)
  - [x] 4.1 Crear script de migración de datos
    - Leer datos de tabla `clients` desde SQLite
    - Transformar tipos de datos y mapear columnas (email → nit)
    - Manejar valores NULL apropiadamente
    - Insertar datos en PostgreSQL con el esquema corregido
    - _Requirements: 1.4, 3.1, 3.2, 3.3_

  - [x] 4.2 Implementar validación de migración
    - Comparar conteo de registros entre SQLite y PostgreSQL
    - Verificar que todos los datos se transformaron correctamente
    - Validar que las relaciones se preserven
    - _Requirements: 3.3, 3.5_

  - [ ]* 4.3 Escribir test de propiedad para migración de datos
    - **Property 4: Data Migration Completeness**
    - **Validates: Requirements 1.4, 3.1, 3.2, 3.3**

- [x] 5. Crear índices para optimización
  - [x] 5.1 Crear índices en columnas frecuentemente consultadas
    - Índice en `seller_id` para búsquedas por vendedor
    - Índice en `name` para búsquedas por nombre
    - Índice en `nit` para búsquedas por NIT
    - _Requirements: 4.1_

  - [ ]* 5.2 Escribir test de propiedad para disponibilidad de índices
    - **Property 7: Index Availability**
    - **Validates: Requirements 4.1**

- [x] 6. Verificar compatibilidad con código existente
  - [x] 6.1 Probar operaciones CRUD de clientsService.js
    - Ejecutar `getAllClients()` y verificar que no haya errores
    - Probar `createClient()` con datos de prueba
    - Probar `updateClient()` con actualizaciones de todas las columnas
    - Probar `deleteClient()` y verificar eliminación
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [x] 6.2 Probar integridad referencial
    - Intentar crear cliente con `seller_id` que no existe (debe fallar)
    - Verificar que el error sea descriptivo
    - Probar con `seller_id` válido (debe funcionar)
    - _Requirements: 2.4_

  - [ ]* 6.3 Escribir test de propiedad para compatibilidad de aplicación
    - **Property 10: Application Compatibility**
    - **Validates: Requirements 2.1, 2.2, 2.3**

- [x] 7. Checkpoint - Verificación completa
  - Ejecutar todas las pruebas de clientsService.js
  - Verificar que no haya errores de columna faltante
  - Confirmar que todas las funcionalidades relacionadas con clientes funcionen
  - Asegurar que todos los tests pasen, preguntar al usuario si hay dudas

- [x] 8. Implementar manejo de concurrencia
  - [x] 8.1 Probar operaciones concurrentes
    - Simular múltiples operaciones CRUD simultáneas
    - Verificar que no haya condiciones de carrera
    - Confirmar que los datos permanezcan consistentes
    - _Requirements: 4.4_

  - [ ]* 8.2 Escribir test de propiedad para seguridad en concurrencia
    - **Property 6: Concurrent Operation Safety**
    - **Validates: Requirements 4.4**

- [x] 9. Implementar mecanismo de rollback
  - [x] 9.1 Crear sistema de backup y restauración
    - Implementar backup del estado actual antes de cambios
    - Crear puntos de restauración durante la migración
    - Implementar rollback automático en caso de error
    - _Requirements: 5.5_

  - [ ]* 9.2 Escribir test de propiedad para capacidad de rollback
    - **Property 8: Rollback Capability**
    - **Validates: Requirements 5.5**

- [ ] 10. Verificación final y documentación
  - [x] 10.1 Ejecutar verificación completa
    - Verificar que todos los índices estén creados
    - Confirmar que todas las restricciones estén aplicadas
    - Validar que el rendimiento de consultas sea aceptable
    - Ejecutar pruebas de integración end-to-end
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 10.2 Documentar cambios realizados
    - Documentar el esquema final de la tabla
    - Documentar pasos de migración ejecutados
    - Documentar cualquier transformación de datos aplicada
    - Crear guía de resolución de problemas
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 10.3 Escribir test de propiedad para migración round-trip
    - **Property 9: Data Migration Round-trip**
    - **Validates: Requirements 3.5**

- [ ] 11. Checkpoint final - Entrega
  - Ejecutar suite completa de pruebas
  - Verificar que todas las funcionalidades del sistema funcionen
  - Confirmar que el error original de `seller_id` esté resuelto
  - Asegurar que todos los tests pasen, preguntar al usuario si hay dudas

## Notes

- Tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los checkpoints aseguran validación incremental
- Los tests de propiedad validan propiedades universales de corrección
- Los tests unitarios validan ejemplos específicos y casos extremos
- El enfoque principal es resolver el error crítico de `seller_id` faltante
- La solución debe mantener compatibilidad con el código existente en `clientsService.js`
- Se debe priorizar la estabilidad del sistema sobre optimizaciones avanzadas