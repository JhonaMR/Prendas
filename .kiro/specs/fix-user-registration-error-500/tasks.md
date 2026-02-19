# Implementation Plan: Fix User Registration Error 500

## Overview

Este plan implementa la solución para el error 500 en el endpoint de registro de usuarios. La solución consta de tres fases:

1. **Diagnóstico**: Crear un script que identifique el problema en la tabla `users`
2. **Corrección**: Crear un script que corrija la configuración de la secuencia
3. **Validación**: Crear tests para verificar que la solución funciona correctamente

## Tasks

- [x] 1. Crear script de diagnóstico para la tabla users
  - Crear archivo `backend/src/scripts/diagnoseUsersSequence.js`
  - Implementar conexión a PostgreSQL
  - Verificar existencia de tabla `users`
  - Extraer estructura de columnas
  - Buscar secuencias relacionadas
  - Generar reporte detallado del estado actual
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Crear script de corrección para la tabla users
  - Crear archivo `backend/src/scripts/fixUsersSequence.js`
  - Implementar conexión a PostgreSQL
  - Crear secuencia `users_id_seq` si no existe
  - Configurar default del campo `id`
  - Vincular secuencia a tabla usando OWNED BY
  - Verificar configuración final
  - Generar reporte de confirmación
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3. Ejecutar script de corrección en la base de datos
  - Ejecutar `node backend/src/scripts/fixUsersSequence.js`
  - Verificar que no hay errores
  - Confirmar que la secuencia fue creada correctamente
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2_

- [x] 4. Crear script de validación
  - Crear archivo `backend/src/scripts/validateUsersSequence.js`
  - Implementar verificación de secuencia
  - Implementar verificación de default
  - Implementar verificación de ownership
  - Generar reporte de validación
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [-] 5. Crear tests unitarios para el endpoint de registro
  - [x] 5.1 Crear archivo `backend/src/tests/auth.register.test.js`
    - Implementar test de registro exitoso
    - Implementar test de datos inválidos
    - Implementar test de login_code duplicado
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 5.2 Escribir property test para creación de usuarios
    - **Property 5: User Creation Success**
    - **Validates: Requirements 4.1, 4.2**

  - [ ]* 5.3 Escribir property test para rechazo de datos inválidos
    - **Property 7: Invalid Data Rejection**
    - **Validates: Requirements 4.4**

  - [ ]* 5.4 Escribir property test para prevención de duplicados
    - **Property 8: Duplicate Login Code Prevention**
    - **Validates: Requirements 4.5**

- [ ] 6. Ejecutar tests para validar la solución
  - Ejecutar tests unitarios
  - Ejecutar property tests
  - Verificar que todos los tests pasan
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 7. Checkpoint - Verificar que el endpoint funciona correctamente
  - Ejecutar script de validación
  - Verificar que la secuencia está configurada
  - Ejecutar tests y verificar que todos pasan
  - Probar manualmente el endpoint POST /api/auth/register
  - Confirmar que se pueden crear usuarios sin error 500

- [x] 8. Crear documentación de la solución
  - Crear archivo `backend/src/scripts/SOLUTION_DOCUMENTATION.md`
  - Documentar el problema identificado
  - Documentar los pasos de la solución
  - Incluir referencias al problema anterior con `reception_items`
  - Incluir instrucciones para prevenir este problema en futuras tablas
  - Incluir ejemplos de cómo verificar que la solución funciona
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 9. Final checkpoint - Asegurar que todo funciona
  - Ejecutar todos los tests
  - Verificar que el endpoint de registro funciona
  - Verificar que se pueden crear múltiples usuarios
  - Verificar que los datos se persisten correctamente en la base de datos
  - Confirmar que no hay errores 500

## Notes

- Tasks marcadas con `*` son opcionales y pueden saltarse para un MVP más rápido
- Cada task referencia requirements específicos para trazabilidad
- Los checkpoints aseguran validación incremental
- Los property tests validan propiedades de corrección universal
- Los unit tests validan ejemplos específicos y casos edge
