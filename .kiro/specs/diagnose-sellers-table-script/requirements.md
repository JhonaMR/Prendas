# Requirements Document

## Introduction

El script `checkSellersTable.js` se ejecuta dos veces pero se queda atascado en la consulta `COUNT(*)` que muestra "Total de vendedores". Este script es crítico para verificar la integridad referencial de la tabla `clients` con la tabla `sellers`. El problema impide la validación completa de la base de datos y puede ocultar problemas de rendimiento, bloqueos o errores en la tabla `sellers`.

## Glossary

- **System**: Sistema de producción de confección
- **PostgreSQL**: Sistema de gestión de bases de datos relacional
- **checkSellersTable.js**: Script de diagnóstico que verifica la tabla sellers
- **sellers**: Tabla que almacena información de vendedores
- **clients**: Tabla que almacena información de clientes
- **seller_id**: Columna que relaciona clientes con vendedores
- **COUNT(*)**: Consulta SQL que cuenta registros en una tabla
- **Blocking**: Bloqueo de transacciones en base de datos
- **Timeout**: Tiempo máximo de espera para una consulta
- **Query Performance**: Rendimiento de consultas SQL

## Requirements

### Requirement 1: Diagnosticar bloqueo en consulta COUNT(*)

**User Story:** Como administrador del sistema, necesito diagnosticar por qué el script `checkSellersTable.js` se queda pegado en la consulta `COUNT(*)`, para poder identificar y resolver problemas de rendimiento o bloqueos en la base de datos.

#### Acceptance Criteria

1. WHEN se ejecuta el script `checkSellersTable.js`, THE Diagnostic_System SHALL identificar el punto exacto donde se bloquea
2. WHEN la consulta `COUNT(*)` se bloquea, THE Diagnostic_System SHALL detectar si hay bloqueos de transacciones activas
3. WHEN hay problemas de rendimiento, THE Diagnostic_System SHALL medir tiempos de ejecución de cada consulta
4. IF la tabla `sellers` no existe, THEN THE Diagnostic_System SHALL detectar este error y reportarlo claramente
5. WHERE hay problemas de conexión a la base de datos, THE Diagnostic_System SHALL identificar errores de conexión específicos

### Requirement 2: Analizar rendimiento de consultas

**User Story:** Como desarrollador, necesito analizar el rendimiento de las consultas en la tabla `sellers`, para optimizar tiempos de respuesta y prevenir bloqueos futuros.

#### Acceptance Criteria

1. WHEN se ejecutan consultas en la tabla `sellers`, THE Performance_Analyzer SHALL medir tiempos de ejecución con precisión de milisegundos
2. WHEN se ejecuta `COUNT(*)` en la tabla `sellers`, THE Performance_Analyzer SHALL identificar si hay índices faltantes que afecten el rendimiento
3. WHILE se analiza el rendimiento, THE Performance_Analyzer SHALL verificar el tamaño de la tabla y estadísticas de PostgreSQL
4. WHERE hay consultas lentas, THE Performance_Analyzer SHALL sugerir optimizaciones específicas
5. FOR ALL consultas en el script, THE System SHALL registrar tiempos de ejecución para análisis histórico

### Requirement 3: Verificar integridad de la tabla sellers

**User Story:** Como administrador de datos, necesito verificar que la tabla `sellers` tenga la estructura correcta y datos válidos, para garantizar la integridad referencial con la tabla `clients`.

#### Acceptance Criteria

1. WHEN se verifica la tabla `sellers`, THE Integrity_Checker SHALL confirmar que todas las columnas requeridas existen
2. WHEN se validan datos en `sellers`, THE Integrity_Checker SHALL verificar que no haya valores NULL en columnas requeridas
3. IF hay problemas de integridad referencial, THEN THE Integrity_Checker SHALL identificar clientes con `seller_id` que no existen en `sellers`
4. WHERE hay inconsistencias en datos, THE Integrity_Checker SHALL reportar problemas específicos con sugerencias de corrección
5. FOR ALL verificaciones de integridad, THE System SHALL generar reportes detallados para auditoría

### Requirement 4: Implementar timeouts y manejo de errores

**User Story:** Como ingeniero de confiabilidad, necesito que el script tenga timeouts apropiados y manejo robusto de errores, para prevenir bloqueos infinitos y facilitar diagnóstico.

#### Acceptance Criteria

1. WHEN se ejecuta una consulta, THE Script SHALL aplicar timeout configurable (ej: 30 segundos)
2. WHEN ocurre timeout en una consulta, THE Script SHALL capturar el error y continuar con diagnóstico
3. IF la base de datos no responde, THEN THE Script SHALL intentar reconexión con backoff exponencial
4. WHERE hay errores de permisos o acceso, THE Script SHALL reportar errores específicos con sugerencias de solución
5. FOR ALL operaciones de base de datos, THE System SHALL implementar transacciones con rollback automático en caso de error

### Requirement 5: Mejorar logging para diagnóstico

**User Story:** Como operador del sistema, necesito logs detallados y estructurados del script, para facilitar diagnóstico remoto y monitoreo proactivo.

#### Acceptance Criteria

1. WHEN se ejecuta el script, THE Logging_System SHALL registrar cada paso con timestamp y nivel de severidad
2. WHEN se ejecutan consultas SQL, THE Logging_System SHALL registrar la consulta y sus parámetros
3. WHILE se procesan resultados, THE Logging_System SHALL registrar conteos y estadísticas relevantes
4. WHERE hay advertencias o errores, THE Logging_System SHALL incluir contexto completo para diagnóstico
5. FOR ALL logs generados, THE System SHALL usar formato estructurado (JSON) para integración con sistemas de monitoreo

### Requirement 6: Optimizar consulta COUNT(*) para grandes tablas

**User Story:** Como arquitecto de base de datos, necesito optimizar la consulta `COUNT(*)` para tablas grandes, para evitar bloqueos y mejorar rendimiento.

#### Acceptance Criteria

1. WHEN se cuenta registros en tablas grandes (>10k registros), THE Optimizer SHALL usar métodos aproximados o estadísticas de PostgreSQL
2. WHERE se requiere conteo exacto, THE Optimizer SHALL implementar paginación o muestreo para evitar bloqueos
3. WHILE se optimiza `COUNT(*)`, THE Optimizer SHALL considerar el uso de índices y particionamiento
4. IF la tabla tiene millones de registros, THEN THE Optimizer SHALL sugerir estrategias alternativas de conteo
5. FOR ALL optimizaciones, THE System SHALL mantener precisión aceptable para propósitos de diagnóstico

### Requirement 7: Verificar dependencias y estado del sistema

**User Story:** Como administrador de sistemas, necesito verificar el estado completo del sistema antes de ejecutar diagnósticos, para asegurar que todas las dependencias estén funcionando.

#### Acceptance Criteria

1. WHEN se inicia el diagnóstico, THE System_Checker SHALL verificar que PostgreSQL esté ejecutándose y accesible
2. WHEN se verifican credenciales, THE System_Checker SHALL validar permisos de lectura/escritura en tablas relevantes
3. WHILE se analiza el sistema, THE System_Checker SHALL verificar versiones de PostgreSQL y extensiones requeridas
4. WHERE hay problemas de configuración, THE System_Checker SHALL reportar problemas específicos con comandos de solución
5. FOR ALL verificaciones del sistema, THE System SHALL proporcionar resumen ejecutivo de estado de salud

### Requirement 8: Implementar pruebas de regresión

**User Story:** Como ingeniero de calidad, necesito pruebas automatizadas para verificar que las correcciones no introduzcan regresiones, para mantener la confiabilidad del script.

#### Acceptance Criteria

1. WHEN se implementan correcciones, THE Regression_Tester SHALL ejecutar pruebas que simulen el problema original
2. WHEN se optimizan consultas, THE Regression_Tester SHALL verificar que los resultados sean consistentes
3. WHILE se prueban timeouts, THE Regression_Tester SHALL simular condiciones de bloqueo y verificar manejo apropiado
4. WHERE hay cambios en logging, THE Regression_Tester SHALL verificar que la información crítica se mantenga
5. FOR ALL cambios al script, THE System SHALL mantener compatibilidad con scripts existentes que lo usen