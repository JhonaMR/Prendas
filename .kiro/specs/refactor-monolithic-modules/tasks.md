# Implementation Plan: Refactorización de Módulos Monolíticos

## Overview

Este plan implementa la refactorización de dos archivos monolíticos en una arquitectura modular. La implementación se divide en 5 fases:

1. **Backend Refactoring**: Separar CRUD por entidad
2. **Frontend State Management**: Crear Context API y hooks
3. **Frontend Component Refactoring**: Actualizar vistas
4. **Logging y Debugging**: Sistema centralizado de logs
5. **Documentación**: Guías y referencias

Cada fase se implementa de forma incremental, manteniendo compatibilidad con código existente.

## Tasks

- [x] 1. Preparar estructura de directorios backend
  - Crear directorio `backend/src/controllers/entities/`
  - Crear subdirectorios para cada entidad (references, clients, confeccionistas, sellers, correrias)
  - Crear directorio `backend/src/controllers/shared/`
  - _Requirements: 7.1, 7.2_

- [ ] 2. Implementar validadores centralizados
  - [x] 2.1 Crear `backend/src/controllers/shared/validators.js` con funciones de validación reutilizables
    - Validar campos requeridos
    - Validar tipos de datos
    - Validar rangos y formatos
    - _Requirements: 8.1, 8.3_
  
  - [ ]* 2.2 Escribir property test para validadores
    - **Property 2: Validation Consistency**
    - **Validates: Requirements 1.3, 8.1**

- [ ] 3. Implementar sistema de logging
  - [x] 3.1 Crear `backend/src/controllers/shared/logger.js`
    - Implementar niveles de logging (DEBUG, INFO, WARN, ERROR)
    - Configurar logging por ambiente
    - Agregar timestamps y contexto
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [ ]* 3.2 Escribir unit tests para logger
    - Probar que logs se registran correctamente
    - Probar filtrado por nivel
    - _Requirements: 9.1_

- [ ] 4. Implementar manejador de errores centralizado
  - [x] 4.1 Crear `backend/src/controllers/shared/errorHandler.js`
    - Definir clases de error (ValidationError, NotFoundError, DatabaseError)
    - Implementar middleware de manejo de errores
    - Asegurar que errores no exponen detalles internos
    - _Requirements: 1.5, 9.2_
  
  - [ ]* 4.2 Escribir property test para error handling
    - **Property 3: Error Response Format**
    - **Validates: Requirements 1.5, 9.1**

- [-] 5. Refactorizar References (Productos/Prendas)
  - [x] 5.1 Crear `backend/src/controllers/entities/references/referencesValidator.js`
    - Validar ID, descripción, precio, diseñador
    - Validar que tenga al menos una correría
    - _Requirements: 1.3, 8.1_
  
  - [x] 5.2 Crear `backend/src/controllers/entities/references/referencesService.js`
    - Implementar lógica de negocio para CRUD
    - Manejar transacciones para crear/actualizar correrías
    - _Requirements: 1.1, 1.2, 1.4_
  
  - [x] 5.3 Crear `backend/src/controllers/entities/references/referencesController.js`
    - Implementar list, create, read, update, delete
    - Usar validador y servicio
    - _Requirements: 1.1, 1.2, 1.4_
  
  - [ ]* 5.4 Escribir property tests para References
    - **Property 1: CRUD Round Trip Consistency**
    - **Property 4: Data Integrity After Update**
    - **Property 5: Deletion Idempotence**
    - **Validates: Requirements 1.1, 1.2, 1.4**

- [ ] 6. Refactorizar Clients (Clientes)
  - [x] 6.1 Crear `backend/src/controllers/entities/clients/clientsValidator.js`
    - Validar ID, nombre, NIT, dirección, ciudad, vendedor
    - _Requirements: 1.3, 8.1_
  
  - [x] 6.2 Crear `backend/src/controllers/entities/clients/clientsService.js`
    - Implementar lógica de negocio para CRUD
    - _Requirements: 1.1, 1.2, 1.4_
  
  - [x] 6.3 Crear `backend/src/controllers/entities/clients/clientsController.js`
    - Implementar list, create, read, update, delete
    - _Requirements: 1.1, 1.2, 1.4_
  
  - [ ]* 6.4 Escribir property tests para Clients
    - **Property 1: CRUD Round Trip Consistency**
    - **Property 4: Data Integrity After Update**
    - **Property 5: Deletion Idempotence**
    - **Validates: Requirements 1.1, 1.2, 1.4**

- [ ] 7. Refactorizar Confeccionistas
  - [x] 7.1 Crear `backend/src/controllers/entities/confeccionistas/confeccionistasValidator.js`
    - Validar ID, nombre, dirección, ciudad, teléfono, score
    - Validar que score sea A, AA, AAA o NA
    - _Requirements: 1.3, 8.1_
  
  - [x] 7.2 Crear `backend/src/controllers/entities/confeccionistas/confeccionistasService.js`
    - Implementar lógica de negocio para CRUD
    - _Requirements: 1.1, 1.2, 1.4_
  
  - [x] 7.3 Crear `backend/src/controllers/entities/confeccionistas/confeccionistasController.js`
    - Implementar list, create, read, update, delete
    - _Requirements: 1.1, 1.2, 1.4_
  
  - [ ]* 7.4 Escribir property tests para Confeccionistas
    - **Property 1: CRUD Round Trip Consistency**
    - **Property 4: Data Integrity After Update**
    - **Property 5: Deletion Idempotence**
    - **Validates: Requirements 1.1, 1.2, 1.4**

- [ ] 8. Refactorizar Sellers (Vendedores)
  - [x] 8.1 Crear `backend/src/controllers/entities/sellers/sellersValidator.js`
    - Validar nombre
    - _Requirements: 1.3, 8.1_
  
  - [x] 8.2 Crear `backend/src/controllers/entities/sellers/sellersService.js`
    - Implementar lógica de negocio para CRUD
    - _Requirements: 1.1, 1.2, 1.4_
  
  - [x] 8.3 Crear `backend/src/controllers/entities/sellers/sellersController.js`
    - Implementar list, create, read, update, delete
    - _Requirements: 1.1, 1.2, 1.4_
  
  - [ ]* 8.4 Escribir property tests para Sellers
    - **Property 1: CRUD Round Trip Consistency**
    - **Property 4: Data Integrity After Update**
    - **Property 5: Deletion Idempotence**
    - **Validates: Requirements 1.1, 1.2, 1.4**

- [ ] 9. Refactorizar Correrias
  - [x] 9.1 Crear `backend/src/controllers/entities/correrias/correriasValidator.js`
    - Validar nombre y año
    - _Requirements: 1.3, 8.1_
  
  - [x] 9.2 Crear `backend/src/controllers/entities/correrias/correriasService.js`
    - Implementar lógica de negocio para CRUD
    - _Requirements: 1.1, 1.2, 1.4_
  
  - [x] 9.3 Crear `backend/src/controllers/entities/correrias/correriasController.js`
    - Implementar list, create, read, update, delete
    - _Requirements: 1.1, 1.2, 1.4_
  
  - [ ]* 9.4 Escribir property tests para Correrias
    - **Property 1: CRUD Round Trip Consistency**
    - **Property 4: Data Integrity After Update**
    - **Property 5: Deletion Idempotence**
    - **Validates: Requirements 1.1, 1.2, 1.4**

- [ ] 10. Crear adaptador de compatibilidad backend
  - [ ] 10.1 Actualizar `backend/src/controllers/crudController.js` como adaptador
    - Importar controladores de entidades
    - Exportar funciones con nombres antiguos
    - Mantener interfaz pública idéntica
    - _Requirements: 5.1, 5.3, 5.4_
  
  - [ ]* 10.2 Escribir property test para compatibilidad
    - **Property 10: Backward Compatibility**
    - **Validates: Requirements 5.1, 5.2, 5.3**

- [ ] 11. Checkpoint - Backend refactorizado
  - Ejecutar todos los tests de backend
  - Verificar que código antiguo funciona
  - Revisar logs y debugging

- [-] 12. Crear Context API para estado global
  - [x] 12.1 Crear `src/context/AppContext.tsx`
    - Definir AppState con todos los arrays
    - Definir AppAction para actualizaciones
    - Crear reducer para manejar acciones
    - _Requirements: 2.1, 2.4_
  
  - [x] 12.2 Crear `src/context/AppProvider.tsx`
    - Implementar Provider que envuelve la aplicación
    - Cargar datos iniciales desde backend
    - _Requirements: 2.1, 2.3_
  
  - [x] 12.3 Crear `src/context/useAppContext.ts`
    - Hook para acceder al contexto
    - Validar que no se permite mutación directa
    - _Requirements: 2.5_
  
  - [ ]* 12.4 Escribir property tests para Context
    - **Property 6: State Consistency**
    - **Property 8: UI Reflects State**
    - **Validates: Requirements 2.1, 2.2, 2.4**

- [ ] 13. Crear hooks genéricos CRUD
  - [x] 13.1 Crear `src/hooks/useCRUD.ts`
    - Hook genérico que expone create, read, update, delete, list
    - Manejar loading y error states
    - Actualizar estado global automáticamente
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [x] 13.2 Crear `src/hooks/useDataLoader.ts`
    - Hook para cargar datos iniciales
    - Manejar errores de carga
    - _Requirements: 2.3_
  
  - [ ]* 13.3 Escribir property tests para hooks
    - **Property 7: Hook Data Freshness**
    - **Property 9: Hook Cleanup**
    - **Validates: Requirements 3.1, 3.2, 3.5**

- [ ] 14. Crear hooks específicos por entidad
  - [x] 14.1 Crear `src/hooks/useReferences.ts`
    - Wrapper sobre useCRUD para References
    - Agregar lógica específica de dominio
    - _Requirements: 3.1, 3.4_
  
  - [x] 14.2 Crear `src/hooks/useClients.ts`
    - Wrapper sobre useCRUD para Clients
    - _Requirements: 3.1, 3.4_
  
  - [x] 14.3 Crear `src/hooks/useConfeccionistas.ts`
    - Wrapper sobre useCRUD para Confeccionistas
    - _Requirements: 3.1, 3.4_
  
  - [x] 14.4 Crear `src/hooks/useSellers.ts`
    - Wrapper sobre useCRUD para Sellers
    - _Requirements: 3.1, 3.4_
  
  - [x] 14.5 Crear `src/hooks/useCorrerias.ts`
    - Wrapper sobre useCRUD para Correrias
    - _Requirements: 3.1, 3.4_
  
  - [ ]* 14.6 Escribir unit tests para hooks específicos
    - Probar que cada hook funciona correctamente
    - _Requirements: 3.1, 3.4_

- [ ] 15. Refactorizar App.tsx
  - [x] 15.1 Actualizar `src/views/App.tsx` para usar AppProvider
    - Envolver aplicación con AppProvider
    - Remover estado local de App
    - _Requirements: 2.1, 2.3_
  
  - [x] 15.2 Actualizar lógica de autenticación en App.tsx
    - Usar contexto para estado de usuario
    - Mantener logout funcional
    - _Requirements: 2.1_
  
  - [x] 15.3 Actualizar renderizado de vistas en App.tsx
    - Pasar props desde contexto en lugar de estado local
    - Remover callbacks inline
    - _Requirements: 4.1, 4.3_
  
  - [ ]* 15.4 Escribir property tests para App.tsx
    - **Property 6: State Consistency**
    - **Property 8: UI Reflects State**
    - **Validates: Requirements 2.1, 2.2, 2.4**

- [ ] 16. Refactorizar ReceptionView
  - [ ] 16.1 Actualizar `src/views/ReceptionView.tsx` para usar hooks
    - Usar useReferences, useClients, useConfeccionistas
    - Remover props de estado
    - Usar hook para operaciones CRUD
    - _Requirements: 4.1, 4.3, 4.4_
  
  - [ ]* 16.2 Escribir property tests para ReceptionView
    - **Property 4: Data Integrity After Update**
    - **Validates: Requirements 4.4_

- [ ] 17. Refactorizar DispatchView
  - [ ] 17.1 Actualizar `src/views/DispatchView.tsx` para usar hooks
    - Usar useClients, useCorrerias
    - Remover props de estado
    - Usar hook para operaciones CRUD
    - _Requirements: 4.1, 4.3, 4.4_
  
  - [ ]* 17.2 Escribir property tests para DispatchView
    - **Property 4: Data Integrity After Update**
    - **Validates: Requirements 4.4**

- [ ] 18. Refactorizar MastersView
  - [ ] 18.1 Actualizar `src/views/MastersView.tsx` para usar hooks
    - Usar todos los hooks de entidades
    - Remover callbacks inline
    - Usar hook para operaciones CRUD
    - _Requirements: 4.1, 4.3, 4.4_
  
  - [ ]* 18.2 Escribir property tests para MastersView
    - **Property 4: Data Integrity After Update**
    - **Validates: Requirements 4.4**

- [ ] 19. Refactorizar vistas restantes
  - [ ] 19.1 Actualizar `src/views/InventoryView.tsx`
    - Usar hooks para datos
    - _Requirements: 4.1, 4.3_
  
  - [ ] 19.2 Actualizar `src/views/OrdersView.tsx`
    - Usar hooks para datos
    - _Requirements: 4.1, 4.3_
  
  - [ ] 19.3 Actualizar `src/views/OrderSettleView.tsx`
    - Usar hooks para datos
    - _Requirements: 4.1, 4.3_
  
  - [ ] 19.4 Actualizar `src/views/OrderHistoryView.tsx`
    - Usar hooks para datos
    - _Requirements: 4.1, 4.3_
  
  - [ ] 19.5 Actualizar `src/views/ReportsView.tsx`
    - Usar hooks para datos
    - _Requirements: 4.1, 4.3_
  
  - [ ] 19.6 Actualizar `src/views/SalesReportView.tsx`
    - Usar hooks para datos
    - _Requirements: 4.1, 4.3_

- [ ] 20. Checkpoint - Frontend refactorizado
  - Ejecutar todos los tests de frontend
  - Verificar que todas las vistas funcionan
  - Verificar que estado se sincroniza correctamente

- [ ] 21. Implementar logging en frontend
  - [ ] 21.1 Crear `src/services/logger.ts`
    - Implementar logger para frontend
    - Configurar niveles de logging
    - _Requirements: 9.1, 9.3_
  
  - [ ] 21.2 Agregar logging a hooks
    - Registrar operaciones CRUD
    - Registrar errores
    - _Requirements: 9.1, 9.2_
  
  - [ ]* 21.3 Escribir unit tests para logger frontend
    - Probar que logs se registran
    - _Requirements: 9.1_

- [ ] 22. Implementar logging en backend
  - [ ] 22.1 Agregar logging a controladores
    - Registrar operaciones CRUD
    - Registrar errores
    - _Requirements: 9.1, 9.2_
  
  - [ ] 22.2 Agregar logging a servicios
    - Registrar lógica de negocio
    - _Requirements: 9.1_
  
  - [ ]* 22.3 Escribir unit tests para logging backend
    - Probar que logs se registran
    - _Requirements: 9.1_

- [ ] 23. Crear documentación de arquitectura
  - [ ] 23.1 Crear `docs/ARCHITECTURE.md`
    - Explicar estructura general
    - Diagramas de flujo de datos
    - _Requirements: 10.1_
  
  - [ ] 23.2 Crear `docs/PATTERNS.md`
    - Documentar patrones backend
    - Documentar patrones frontend
    - Ejemplos de uso
    - _Requirements: 10.2_
  
  - [ ] 23.3 Crear `docs/ADDING_ENTITIES.md`
    - Checklist para agregar nuevas entidades
    - Ejemplos paso a paso
    - _Requirements: 10.3_
  
  - [ ] 23.4 Crear `docs/TROUBLESHOOTING.md`
    - Problemas comunes
    - Guías de debugging
    - _Requirements: 10.5_

- [ ] 24. Agregar comentarios al código
  - [ ] 24.1 Agregar comentarios a controladores
    - Explicar decisiones arquitectónicas
    - _Requirements: 10.4_
  
  - [ ] 24.2 Agregar comentarios a hooks
    - Explicar lógica compleja
    - _Requirements: 10.4_
  
  - [ ] 24.3 Agregar comentarios a servicios
    - Explicar lógica de negocio
    - _Requirements: 10.4_

- [ ] 25. Ejecutar tests de integración completos
  - Ejecutar todos los tests
  - Verificar que código antiguo y nuevo coexisten
  - Verificar que no hay regresiones
  - _Requirements: 5.5, 6.3_

- [ ] 26. Final checkpoint - Refactorización completa
  - Revisar que todos los requisitos se cumplen
  - Verificar que documentación está completa
  - Preparar para producción

## Notes

- Tasks marcadas con `*` son opcionales y pueden saltarse para MVP más rápido
- Cada tarea de testing valida una propiedad específica del diseño
- Los checkpoints permiten validar progreso incremental
- La compatibilidad con código antiguo se mantiene durante toda la refactorización
- Los logs ayudan a debuggear problemas durante la migración
