# 📊 Análisis del Sistema de Backups - Proyecto Prendas

**Fecha:** 16 de Marzo, 2026  
**Autor:** Análisis técnico del sistema actual  
**Propósito:** Evaluar la estrategia de backups actual y proporcionar recomendaciones para escalabilidad

---

## 📋 Índice

1. [Sistema Actual](#sistema-actual)
2. [Análisis Comparativo](#análisis-comparativo)
3. [Proyección de Crecimiento](#proyección-de-crecimiento)
4. [Recomendaciones](#recomendaciones)
5. [Plan de Implementación](#plan-de-implementación)
6. [Casos de Uso](#casos-de-uso)

---

## 🔍 Sistema Actual

### Descripción

El sistema utiliza **backups completos** mediante `pg_dump` de PostgreSQL con las siguientes características:

**Tecnología:**
- PostgreSQL `pg_dump` con formato SQL plano
- Compresión con `gzip`
- Rotación automática de backups

**Programación:**
- Base de datos: Diario a las 22:00
- Imágenes: Diario a las 23:00

**Estrategia de retención:**
- Diarios: Últimos 7 días
- Semanales: Últimas 4 semanas
- Mensuales: Últimos 12 meses

**Instancias:**
- PLOW: Puerto 3000 (BD: `inventory_plow`)
- MELAS: Puerto 3001 (BD: `inventory_melas`)

### Ventajas del Sistema Actual

✅ **Simplicidad**
- Fácil de implementar y mantener
- Un solo comando para backup completo
- Restauración directa sin complejidad

✅ **Consistencia**
- Garantiza integridad referencial entre tablas
- Un archivo = un punto exacto en el tiempo
- No hay riesgo de inconsistencias entre módulos

✅ **Confiabilidad**
- Tecnología probada y estable (pg_dump)
- Respaldado por comunidad PostgreSQL
- Recuperación de desastres garantizada

✅ **Automatización**
- Integrado con PM2 para ejecución automática
- Rotación automática de backups antiguos
- Subida automática a Google Drive

### Desventajas del Sistema Actual

❌ **Escalabilidad**
- Con miles de registros, el archivo será muy grande (varios GB)
- Tiempo de backup aumenta proporcionalmente con datos
- Restauración completa puede tardar mucho tiempo

❌ **Flexibilidad limitada**
- No permite restauración selectiva por módulo
- Para recuperar un solo registro, hay que restaurar todo
- Downtime durante restauración completa

❌ **Consumo de recursos**
- Ocupa más espacio en disco
- Transferencias más lentas a Google Drive
- Mayor uso de ancho de banda

---

## ⚖️ Análisis Comparativo

### Backup Completo vs Backup Modular

| Aspecto | Backup Completo | Backup Modular |
|---------|----------------|----------------|
| **Complejidad** | Baja | Alta |
| **Consistencia** | Garantizada | Riesgo de inconsistencias |
| **Tiempo de backup** | Aumenta con datos | Constante por módulo |
| **Restauración selectiva** | No | Sí |
| **Integridad referencial** | Automática | Manual |
| **Espacio en disco** | Mayor | Menor |
| **Mantenimiento** | Mínimo | Requiere atención |
| **Recuperación de desastres** | Excelente | Compleja |

### Backup Completo vs Backup Incremental

| Aspecto | Backup Completo | Backup Incremental |
|---------|----------------|-------------------|
| **Frecuencia recomendada** | Diario | Cada 2-4 horas |
| **Tamaño** | Grande | Pequeño |
| **Velocidad** | Lenta | Rápida |
| **Restauración** | Simple | Requiere múltiples archivos |
| **Uso de recursos** | Alto | Bajo |
| **Complejidad** | Baja | Media |

---

## 📈 Proyección de Crecimiento

### Estimación de Datos

#### Situación Actual (Marzo 2026)
```
Maestros:
- Clientes: 100-500
- Referencias: 1,000-5,000
- Proveedores: 50-200

Transacciones mensuales:
- Pedidos: 500-2,000
- Despachos: 500-2,000
- Recepciones: 200-800
- Movimientos: 5,000-20,000

Tamaño estimado BD: 50-200 MB
Tamaño comprimido: 5-20 MB
```

#### Proyección 1 Año (Marzo 2027)
```
Acumulado transacciones:
- Pedidos: ~24,000
- Despachos: ~24,000
- Recepciones: ~9,600
- Movimientos: ~240,000

Tamaño estimado BD: 500 MB - 2 GB
Tamaño comprimido: 50-200 MB
Tiempo de backup: 2-5 minutos
Tiempo de restauración: 5-15 minutos
```

#### Proyección 3 Años (Marzo 2029)
```
Acumulado transacciones:
- Pedidos: ~72,000
- Despachos: ~72,000
- Recepciones: ~28,800
- Movimientos: ~720,000

Tamaño estimado BD: 2-5 GB
Tamaño comprimido: 200-500 MB
Tiempo de backup: 5-15 minutos
Tiempo de restauración: 15-45 minutos
```

#### Proyección 5 Años (Marzo 2031)
```
Acumulado transacciones:
- Pedidos: ~120,000
- Despachos: ~120,000
- Recepciones: ~48,000
- Movimientos: ~1,200,000

Tamaño estimado BD: 5-10 GB
Tamaño comprimido: 500 MB - 1 GB
Tiempo de backup: 15-30 minutos
Tiempo de restauración: 30-90 minutos
```

### Conclusión de Proyección

**Para los próximos 3-5 años, el backup completo sigue siendo VIABLE:**
- Tamaños manejables (< 1 GB comprimido)
- Tiempos aceptables (< 30 minutos)
- Complejidad justificada vs beneficio

---

## 🎯 Recomendaciones

### Estrategia por Fases

#### Fase 1: Corto Plazo (Ahora - 1 año)

**Mantener backup completo + Optimizaciones**

1. **Mejorar compresión**
   ```bash
   # Actual: gzip (ratio ~70%)
   # Implementar: gzip -9 (ratio ~80%)
   # Futuro: zstd (ratio ~85%, más rápido)
   ```

2. **Agregar backups incrementales**
   ```
   Frecuencia: Cada 4 horas
   Contenido: Solo cambios desde último backup
   Propósito: Recuperación rápida de cambios recientes
   Retención: Últimas 48 horas
   ```

3. **Implementar soft deletes**
   ```javascript
   // En lugar de DELETE físico
   UPDATE tabla SET deleted_at = NOW() WHERE id = X;
   
   // Recuperación instantánea
   UPDATE tabla SET deleted_at = NULL WHERE id = X;
   ```

4. **Mejorar auditoría**
   ```javascript
   // Registrar TODOS los cambios importantes
   // Permite recuperar datos sin restaurar backup
   // Tabla: audit_log con before/after values
   ```

#### Fase 2: Mediano Plazo (1-3 años)

**Sistema híbrido: Completo + Incremental + Archivado**

1. **Mantener backup completo diario**
   - Continuar con estrategia actual
   - Optimizar compresión (zstd)

2. **Backups incrementales frecuentes**
   ```
   Frecuencia: Cada 2 horas
   Método: pg_dump con WHERE fecha > último_backup
   Tamaño: 1-10 MB por backup
   ```

3. **Archivado de datos antiguos**
   ```sql
   -- Mover transacciones > 2 años a tablas de archivo
   CREATE TABLE pedidos_archivo AS 
   SELECT * FROM pedidos 
   WHERE created_at < NOW() - INTERVAL '2 years';
   
   -- Mantiene BD principal rápida
   -- Datos siguen disponibles para consulta
   ```

4. **Backups diferenciales por criticidad**
   ```
   Crítico (cada 4h): clientes, referencias, pedidos activos
   Normal (diario): movimientos, fichas, auditoría
   Archivo (semanal): pedidos cerrados > 30 días
   ```

#### Fase 3: Largo Plazo (3+ años)

**Sistema avanzado: Completo + Modular + Particionamiento**

1. **Backup completo semanal**
   - Reducir frecuencia a semanal
   - Mantener para recuperación de desastres

2. **Backups modulares diarios**
   ```
   Módulos:
   - Maestros: clientes, referencias, proveedores
   - Transacciones: pedidos, despachos, recepciones
   - Inventario: movimientos, fichas
   - Auditoría: logs, cambios
   ```

3. **Particionamiento de tablas**
   ```sql
   -- Particionar por fecha (mensual)
   CREATE TABLE movimientos_2029_03 PARTITION OF movimientos
   FOR VALUES FROM ('2029-03-01') TO ('2029-04-01');
   
   -- Backup por partición
   -- Restauración selectiva por período
   ```

4. **Replicación en tiempo real**
   ```
   - PostgreSQL streaming replication
   - Base de datos standby para failover
   - Recuperación instantánea ante fallas
   ```

### Optimizaciones Prioritarias

#### 🔥 Alta Prioridad (Implementar YA)

1. **Soft Deletes**
   - Impacto: Alto
   - Complejidad: Baja
   - Beneficio: Recuperación instantánea sin backups

2. **Auditoría Completa**
   - Impacto: Alto
   - Complejidad: Media
   - Beneficio: Trazabilidad total de cambios

3. **Compresión Mejorada (gzip -9)**
   - Impacto: Medio
   - Complejidad: Muy baja
   - Beneficio: 10-15% menos espacio

#### ⚡ Media Prioridad (Próximos 3-6 meses)

4. **Backups Incrementales**
   - Impacto: Medio
   - Complejidad: Media
   - Beneficio: Recuperación rápida de cambios recientes

5. **Validación Automática de Backups**
   - Impacto: Alto
   - Complejidad: Baja
   - Beneficio: Garantía de backups funcionales

6. **Alertas de Backup**
   - Impacto: Medio
   - Complejidad: Baja
   - Beneficio: Notificación inmediata de fallos

#### 📅 Baja Prioridad (Cuando sea necesario)

7. **Archivado de Datos Antiguos**
   - Impacto: Bajo (por ahora)
   - Complejidad: Media
   - Beneficio: BD más rápida, backups más pequeños

8. **Backups Modulares**
   - Impacto: Bajo (por ahora)
   - Complejidad: Alta
   - Beneficio: Restauración selectiva

---

## 📝 Plan de Implementación

### Implementación Inmediata

#### 1. Soft Deletes (1-2 días)

**Cambios en base de datos:**
```sql
-- Agregar columna deleted_at a tablas principales
ALTER TABLE clientes ADD COLUMN deleted_at TIMESTAMP NULL;
ALTER TABLE referencias ADD COLUMN deleted_at TIMESTAMP NULL;
ALTER TABLE pedidos ADD COLUMN deleted_at TIMESTAMP NULL;
-- ... otras tablas
```

**Cambios en código:**
```javascript
// Modificar queries para excluir eliminados
const clientes = await db.query(
  'SELECT * FROM clientes WHERE deleted_at IS NULL'
);

// Función de eliminación suave
async function softDelete(table, id) {
  await db.query(
    `UPDATE ${table} SET deleted_at = NOW() WHERE id = $1`,
    [id]
  );
}

// Función de recuperación
async function restore(table, id) {
  await db.query(
    `UPDATE ${table} SET deleted_at = NULL WHERE id = $1`,
    [id]
  );
}
```

#### 2. Mejorar Compresión (30 minutos)

**Modificar BackupExecutionService.js:**
```javascript
// Cambiar de gzip a gzip -9
const command = `pg_dump ... | gzip -9 > "${backupPath}"`;
```

#### 3. Validación Automática (1 día)

**Agregar verificación post-backup:**
```javascript
// Verificar que el archivo no está corrupto
async function validateBackup(backupPath) {
  // 1. Verificar tamaño mínimo
  const stats = fs.statSync(backupPath);
  if (stats.size < 1024) return false;
  
  // 2. Verificar que se puede descomprimir
  try {
    execSync(`gzip -t "${backupPath}"`);
  } catch {
    return false;
  }
  
  // 3. Verificar contenido SQL básico
  const content = execSync(`gunzip -c "${backupPath}" | head -n 100`);
  return content.includes('PostgreSQL database dump');
}
```

### Implementación a 3 Meses

#### 4. Backups Incrementales

**Crear script de backup incremental:**
```javascript
// backupIncremental.js
async function createIncrementalBackup() {
  const lastBackupTime = getLastBackupTime();
  
  // Tablas a respaldar incrementalmente
  const tables = [
    'pedidos',
    'despachos',
    'recepciones',
    'movimientos'
  ];
  
  for (const table of tables) {
    await execAsync(
      `pg_dump -t ${table} --data-only ` +
      `--where="updated_at > '${lastBackupTime}'" ` +
      `... > incremental_${table}_${timestamp}.sql`
    );
  }
}
```

**Programar en PM2:**
```javascript
// ecosystem.config.js
{
  name: 'plow-incremental-backup',
  script: 'backend/src/scripts/backupIncremental.js',
  cron_restart: '0 */4 * * *', // Cada 4 horas
  autorestart: false
}
```

#### 5. Sistema de Alertas

**Integrar notificaciones:**
```javascript
// Enviar email/Slack si backup falla
async function notifyBackupFailure(error) {
  // Implementar según preferencia:
  // - Email (nodemailer)
  // - Slack webhook
  // - Telegram bot
  // - SMS (Twilio)
}
```

### Implementación a 6-12 Meses

#### 6. Archivado de Datos Antiguos

**Script de archivado:**
```javascript
// archiveOldData.js
async function archiveOldTransactions() {
  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - 2);
  
  // Mover a tabla de archivo
  await db.query(`
    INSERT INTO pedidos_archivo 
    SELECT * FROM pedidos 
    WHERE created_at < $1 AND estado = 'cerrado'
  `, [cutoffDate]);
  
  // Eliminar de tabla principal
  await db.query(`
    DELETE FROM pedidos 
    WHERE created_at < $1 AND estado = 'cerrado'
  `, [cutoffDate]);
}
```

---

## 🎲 Casos de Uso

### Caso 1: Error de Usuario - Eliminación Accidental

**Escenario:**
> Un usuario elimina por error un cliente importante con todos sus pedidos.

**Solución Actual (Backup Completo):**
1. Detener sistema (downtime)
2. Restaurar backup completo del día anterior
3. Perder cambios del día actual
4. Tiempo: 15-30 minutos

**Solución con Soft Delete:**
1. Ejecutar query de recuperación
2. Sin downtime
3. Sin pérdida de datos
4. Tiempo: 10 segundos

**Recomendación:** ✅ Implementar soft deletes

---

### Caso 2: Falla Catastrófica del Servidor

**Escenario:**
> El servidor se cae completamente, disco duro dañado, pérdida total de datos.

**Solución Actual (Backup Completo):**
1. Instalar nuevo servidor
2. Instalar PostgreSQL
3. Descargar último backup de Google Drive
4. Restaurar backup completo
5. Reiniciar aplicación
6. Tiempo: 1-2 horas

**Solución con Backup Modular:**
1. Instalar nuevo servidor
2. Instalar PostgreSQL
3. Descargar múltiples backups modulares
4. Restaurar módulo por módulo (riesgo de inconsistencias)
5. Verificar integridad referencial
6. Tiempo: 2-4 horas

**Recomendación:** ✅ Mantener backup completo para este caso

---

### Caso 3: Necesidad de Datos Históricos

**Escenario:**
> Auditoría requiere revisar todos los pedidos de hace 6 meses.

**Solución Actual (Backup Completo):**
1. Crear base de datos temporal
2. Restaurar backup de hace 6 meses
3. Extraer datos necesarios
4. Tiempo: 30-60 minutos

**Solución con Archivado:**
1. Consultar tabla de archivo
2. Datos disponibles inmediatamente
3. Tiempo: 1 minuto

**Recomendación:** ✅ Implementar archivado cuando sea necesario

---

### Caso 4: Corrupción de Datos Específicos

**Escenario:**
> Un bug en el código corrompe los precios de 100 referencias.

**Solución Actual (Backup Completo):**
1. Identificar cuándo ocurrió
2. Restaurar backup en BD temporal
3. Extraer precios correctos
4. Actualizar manualmente en producción
5. Tiempo: 1-2 horas

**Solución con Auditoría Completa:**
1. Consultar tabla de auditoría
2. Ver valores anteriores
3. Restaurar con script automático
4. Tiempo: 5-10 minutos

**Recomendación:** ✅ Mejorar sistema de auditoría

---

### Caso 5: Backup Corrupto

**Escenario:**
> El backup de anoche está corrupto y no se puede restaurar.

**Solución Actual:**
1. Intentar con backup de hace 2 días
2. Perder 2 días de datos
3. Tiempo: Variable

**Solución con Validación Automática:**
1. Sistema detecta corrupción inmediatamente
2. Alerta enviada al administrador
3. Crear nuevo backup manualmente
4. Tiempo: Prevención del problema

**Recomendación:** ✅ Implementar validación automática

---

## 🏆 Conclusiones Finales

### Decisión Estratégica

**Para el Sistema Prendas, la recomendación es:**

✅ **MANTENER backup completo como estrategia principal**

**Razones:**
1. Escala actual y proyectada (< 1 GB) es manejable
2. Simplicidad operativa es crítica
3. Garantía de consistencia es prioritaria
4. Equipo pequeño (no hay DBA dedicado)
5. Costo-beneficio favorable

### Mejoras Prioritarias

**Implementar en orden:**

1. ✅ **Soft deletes** (inmediato)
2. ✅ **Compresión mejorada** (inmediato)
3. ✅ **Validación automática** (1 semana)
4. ✅ **Auditoría completa** (1 mes)
5. ✅ **Backups incrementales** (3 meses)
6. ⏳ **Archivado** (cuando sea necesario)
7. ⏳ **Backups modulares** (solo si crece > 10 GB)

### Cuándo Reconsiderar

**Evaluar cambio a sistema modular cuando:**
- Base de datos > 10 GB comprimida
- Backup completo tarda > 30 minutos
- Restauraciones selectivas son frecuentes (> 1/mes)
- Hay equipo dedicado a administración de BD
- Downtime de restauración es inaceptable

### Métricas de Éxito

**Monitorear:**
- Tiempo de backup (debe ser < 15 min)
- Tamaño de backups (crecimiento mensual)
- Tasa de éxito de backups (debe ser 100%)
- Tiempo de restauración (debe ser < 30 min)
- Frecuencia de uso de backups

---

## 📚 Referencias

- [PostgreSQL Backup Documentation](https://www.postgresql.org/docs/current/backup.html)
- [Backup Best Practices](https://wiki.postgresql.org/wiki/Backup_and_Recovery)
- [PM2 Cron Jobs](https://pm2.keymetrics.io/docs/usage/restart-strategies/)

---

**Documento creado:** 16 de Marzo, 2026  
**Última actualización:** 16 de Marzo, 2026  
**Próxima revisión:** Septiembre 2026 (6 meses)
