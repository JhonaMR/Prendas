# 🔍 INVESTIGACIÓN: Sistema de Backup de Devoluciones

**Fecha de Investigación**: 2 de marzo de 2026  
**Objetivo**: Verificar consistencia de tipos de datos entre generación y recepción de backups de devoluciones

---

## 📋 RESUMEN EJECUTIVO

✅ **CONCLUSIÓN**: El sistema de backup está **CORRECTAMENTE CONFIGURADO** para devoluciones. Los tipos de datos son consistentes entre:
- Generación de backups (pg_dump)
- Almacenamiento en SQL
- Restauración (psql)
- Recepción en el frontend

**Sin embargo**, hay un **PROBLEMA CRÍTICO** identificado en los backups actuales que requiere atención inmediata.

---

## 1️⃣ GENERACIÓN DE BACKUPS

### 1.1 Servicio: `BackupExecutionService.js`

**Ubicación**: `Prendas/backend/src/services/BackupExecutionService.js`

**Comando pg_dump utilizado**:
```bash
pg_dump --encoding=UTF8 --clean --if-exists --no-password -U ${dbUser} -h ${dbHost} -p ${dbPort} -d ${dbName} -F p -v -f "${backupPath}"
```

**Opciones críticas**:
- `--encoding=UTF8`: Especifica UTF-8 explícitamente ✅
- `--clean`: Incluye DROP TABLE para limpiar antes de restaurar ✅
- `--if-exists`: Evita errores si las tablas no existen ✅
- `-F p`: Formato plano (SQL) ✅
- `-f`: Archivo de salida (mejor que redirección en Windows) ✅

**Qué se respalda**: TODAS las tablas de la BD, incluyendo:
- `return_receptions` (tabla principal)
- `return_reception_items` (tabla de items)
- Todas las demás tablas del sistema

---

## 2️⃣ ESTRUCTURA DE DATOS EN BACKUP

### 2.1 Tabla: `return_receptions`

**En el backup SQL** (línea 810-820):
```sql
CREATE TABLE public.return_receptions (
    id character varying(255) NOT NULL,
    client_id character varying(255) NOT NULL,
    credit_note_number character varying(255),
    total_value numeric(10,2) NOT NULL,
    received_by character varying(255) NOT NULL,
    created_at character varying(255) NOT NULL
);
```

**Datos de ejemplo** (línea 3129-3131):
```sql
COPY public.return_receptions (id, client_id, credit_note_number, total_value, received_by, created_at) FROM stdin;
mm992elendvcsh0cp	133	NC-490	50800.00	Prueba general	2026-03-02T09:04:05.859-05:00
\.
```

**Tipos de datos**:
| Campo | Tipo | Ejemplo |
|-------|------|---------|
| `id` | `varchar(255)` | `mm992elendvcsh0cp` |
| `client_id` | `varchar(255)` | `133` |
| `credit_note_number` | `varchar(255)` | `NC-490` |
| `total_value` | `numeric(10,2)` | `50800.00` |
| `received_by` | `varchar(255)` | `Prueba general` |
| `created_at` | `varchar(255)` | `2026-03-02T09:04:05.859-05:00` |

### 2.2 Tabla: `return_reception_items`

**En el backup SQL** (línea 770-778):
```sql
CREATE TABLE public.return_reception_items (
    id integer NOT NULL,
    return_reception_id character varying(255) NOT NULL,
    reference character varying(255) NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2)
);
```

**Secuencia para auto-incremento** (línea 786-802):
```sql
CREATE SEQUENCE public.return_reception_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.return_reception_items_id_seq OWNED BY public.return_reception_items.id;
ALTER TABLE ONLY public.return_reception_items ALTER COLUMN id SET DEFAULT nextval('public.return_reception_items_id_seq'::regclass);
```

**Datos de ejemplo** (línea 3117-3120):
```sql
COPY public.return_reception_items (id, return_reception_id, reference, quantity, unit_price) FROM stdin;
6	mm992elendvcsh0cp	12694	1	24900.00
7	mm992elendvcsh0cp	12693	1	25900.00
\.
```

**Tipos de datos**:
| Campo | Tipo | Ejemplo |
|-------|------|---------|
| `id` | `integer` (auto-incremento) | `6`, `7` |
| `return_reception_id` | `varchar(255)` | `mm992elendvcsh0cp` |
| `reference` | `varchar(255)` | `12694`, `12693` |
| `quantity` | `integer` | `1` |
| `unit_price` | `numeric(10,2)` | `24900.00` |

---

## 3️⃣ RESTAURACIÓN DE BACKUPS

### 3.1 Servicio: `BackupExecutionService.js` - Función `restoreBackup()`

**Ubicación**: `Prendas/backend/src/services/BackupExecutionService.js` (línea 158-210)

**Comando psql utilizado**:
```bash
psql --no-password -U ${dbUser} -h ${dbHost} -p ${dbPort} -d ${dbName} -f "${backupPath}"
```

**Proceso de restauración**:
1. ✅ Valida que el archivo de backup existe
2. ✅ Crea un backup de seguridad del estado actual (antes de restaurar)
3. ✅ Ejecuta psql con el archivo SQL
4. ✅ Retorna resultado de éxito/error

**Código relevante**:
```javascript
async restoreBackup(backupFilename) {
    try {
      const backupPath = path.join(this.backupDir, backupFilename);
      
      // Validar que el archivo existe
      if (!fs.existsSync(backupPath)) {
        throw new Error(`Archivo de backup no encontrado: ${backupFilename}`);
      }

      // Crear backup de seguridad del estado actual
      const securityBackupResult = await this.executeBackup();
      if (!securityBackupResult.success) {
        throw new Error('No se pudo crear backup de seguridad');
      }

      // Restaurar desde el backup
      const command = `psql --no-password -U ${dbUser} -h ${dbHost} -p ${dbPort} -d ${dbName} -f "${backupPath}"`;
      const env = { ...process.env, PGPASSWORD: dbPassword };
      await execAsync(command, { env, maxBuffer: 10 * 1024 * 1024 });

      return {
        success: true,
        restoredFrom: backupFilename,
        securityBackup: securityBackupResult.filename,
        restoredAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
}
```

---

## 4️⃣ RECEPCIÓN EN BACKEND

### 4.1 Servicio: `ReturnService.js`

**Ubicación**: `Prendas/backend/src/services/ReturnService.js`

#### 4.1.1 Función: `getAllWithPagination()`

**Cómo recibe los datos**:
```javascript
const mappedReturns = await Promise.all(returns.map(async (r) => {
    const itemsResult = await query(
        `SELECT reference, quantity, unit_price
        FROM return_reception_items
        WHERE return_reception_id = $1`,
        [r.id]
    );

    return {
        id: r.id,                              // varchar(255) ✅
        clientId: r.client_id,                 // varchar(255) ✅
        creditNoteNumber: r.credit_note_number, // varchar(255) ✅
        items: itemsResult.rows,               // Array de items ✅
        totalValue: r.total_value,             // numeric(10,2) ✅
        receivedBy: r.received_by,             // varchar(255) ✅
        createdAt: r.created_at                // varchar(255) ✅
    };
}));
```

**Mapeo de tipos**:
| Campo BD | Tipo BD | Campo Mapeado | Tipo Mapeado |
|----------|---------|---------------|--------------|
| `id` | `varchar(255)` | `id` | `string` |
| `client_id` | `varchar(255)` | `clientId` | `string` |
| `credit_note_number` | `varchar(255)` | `creditNoteNumber` | `string` |
| `total_value` | `numeric(10,2)` | `totalValue` | `number` |
| `received_by` | `varchar(255)` | `receivedBy` | `string` |
| `created_at` | `varchar(255)` | `createdAt` | `string` |

#### 4.1.2 Función: `createReturnReception()`

**Cómo inserta los datos**:
```javascript
const createReturnReception = async (returnData, items) => {
    return await transaction(async (client) => {
        // Insert return reception
        const returnResult = await client.query(
            `INSERT INTO return_receptions (id, client_id, credit_note_number, total_value, received_by, created_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [
                returnData.id,                    // varchar(255) ✅
                returnData.clientId,              // varchar(255) ✅
                returnData.creditNoteNumber,      // varchar(255) ✅
                returnData.totalValue,            // numeric(10,2) ✅
                returnData.receivedBy,            // varchar(255) ✅
                new Date()                        // Timestamp ✅
            ]
        );

        // Insert items - ID es auto-generado, NO se proporciona
        for (const item of items) {
            let unitPrice = item.unitPrice || 0;
            if (!item.unitPrice) {
                const refResult = await client.query(
                    `SELECT price FROM product_references WHERE id = $1`,
                    [item.reference]
                );
                if (refResult.rows.length > 0) {
                    unitPrice = refResult.rows[0].price;
                }
            }

            // ✅ CORRECTO: NO incluye el ID (es auto-generado)
            await client.query(
                `INSERT INTO return_reception_items (return_reception_id, reference, quantity, unit_price)
                VALUES ($1, $2, $3, $4)`,
                [returnData.id, item.reference, item.quantity, unitPrice]
            );
        }

        return returnResult.rows[0];
    });
};
```

---

## 5️⃣ RECEPCIÓN EN FRONTEND

### 5.1 Componente: `ReturnReceptionView.tsx`

**Ubicación**: `Prendas/src/views/ReturnReceptionView.tsx`

**Interfaz de datos**:
```typescript
interface ReturnReceptionData {
  id: string;                    // ✅ Coincide con varchar(255)
  clientId: string;              // ✅ Coincide con varchar(255)
  creditNoteNumber?: string;     // ✅ Coincide con varchar(255)
  items: ItemEntry[];            // ✅ Array de items
  totalValue: number;            // ✅ Coincide con numeric(10,2)
  receivedBy: string;            // ✅ Coincide con varchar(255)
  createdAt: string;             // ✅ Coincide con varchar(255)
}
```

**Cómo carga los datos**:
```typescript
const loadReturnReceptions = async () => {
    try {
        setIsLoading(true);
        const response = await api.getReturnReceptionsWithPagination(1, 100);
        if (response.success && response.data) {
            setReturnReceptions(response.data);  // ✅ Recibe datos mapeados correctamente
        }
    } catch (error) {
        console.error('❌ Error loading return receptions:', error);
    } finally {
        setIsLoading(false);
    }
};
```

---

## 6️⃣ CAMBIOS RECIENTES EN TIPOS DE DATOS

### 6.1 Cambios Realizados (Febrero 2026)

**Archivo**: `DEVOLUCIONES_FIXES_SUMMARY.md`

#### Cambio 1: Tipo de ID en `return_reception_items`

**ANTES (INCORRECTO)**:
```sql
CREATE TABLE public.return_reception_items (
    id character varying(255) NOT NULL,  -- ❌ INCORRECTO
    ...
);
```

**DESPUÉS (CORRECTO)**:
```sql
CREATE TABLE public.return_reception_items (
    id integer NOT NULL,  -- ✅ CORRECTO (auto-incremento)
    ...
);

CREATE SEQUENCE public.return_reception_items_id_seq
    START WITH 1
    INCREMENT BY 1;

ALTER TABLE public.return_reception_items ALTER COLUMN id SET DEFAULT nextval('public.return_reception_items_id_seq'::regclass);
```

**Impacto en Backup**: ✅ Los backups generados DESPUÉS de este cambio incluyen la estructura correcta.

#### Cambio 2: Nombres de Tablas en Queries

**ANTES (INCORRECTO)**:
```javascript
FROM "references"              // ❌ Tabla no existe
FROM reference_correrias       // ❌ Tabla no existe
```

**DESPUÉS (CORRECTO)**:
```javascript
FROM product_references        // ✅ Tabla correcta
FROM correria_catalog          // ✅ Tabla correcta
```

**Impacto en Backup**: ✅ Los datos se guardan en las tablas correctas.

#### Cambio 3: Generación de ID en Items

**ANTES (INCORRECTO)**:
```javascript
// Generaba ID manualmente
const itemId = `item_${Date.now()}_${index}`;
await client.query(
    `INSERT INTO return_reception_items (id, return_reception_id, reference, quantity, unit_price)
    VALUES ($1, $2, $3, $4, $5)`,
    [itemId, ...]  // ❌ Intentaba insertar string en campo integer
);
```

**DESPUÉS (CORRECTO)**:
```javascript
// NO genera ID, deja que la secuencia lo haga
await client.query(
    `INSERT INTO return_reception_items (return_reception_id, reference, quantity, unit_price)
    VALUES ($1, $2, $3, $4)`,
    [...]  // ✅ ID auto-generado por la secuencia
);
```

**Impacto en Backup**: ✅ Los IDs se generan correctamente y se respaldan como integers.

---

## 7️⃣ VALIDACIÓN DE INTEGRIDAD

### 7.1 Servicio: `BackupValidationService.js`

**Ubicación**: `Prendas/backend/src/services/BackupValidationService.js`

**Validaciones realizadas**:
```javascript
validateBackup(filePath) {
    // 1. Verifica que el archivo existe ✅
    // 2. Detecta caracteres corruptos ✅
    // 3. Verifica estructura SQL (CREATE TABLE, PRIMARY KEY) ✅
    // 4. Cuenta tablas en el backup ✅
    // 5. Retorna información de validación ✅
}
```

**Patrones de corrupción detectados**:
```javascript
CORRUPTION_PATTERNS = [
    /\\restrict/,                    // Patrón de corrupción conocido
    /[\x00-\x08\x0B-\x0C\x0E-\x1F]/g // Caracteres de control inválidos
];
```

---

## 🚨 PROBLEMA CRÍTICO IDENTIFICADO

### 8.1 Corrupción en Backups Actuales

**Síntoma**: Línea 1 del backup contiene:
```
\restrict ykxEyH4ZP0aV3Bk1H9xwLh61tAtgZC3HG3X7NB7MPrccOJb709xiuflg3FEtIRD
```

**Causa**: Posible problema con la redirección de salida o codificación en Windows.

**Impacto**: 
- ❌ Los backups pueden no restaurarse correctamente
- ❌ Riesgo de pérdida de datos
- ❌ La línea corrupta aparece al inicio del archivo

**Solución implementada**: 
- ✅ Se cambió comando de `pg_dump` para usar `-f` en lugar de redirección `>`
- ✅ Se agregó `BackupValidationService` para detectar corrupción
- ✅ Se creó script `validate-and-clean-backups.js` para limpiar backups existentes

**Estado actual**: Los nuevos backups deberían ser válidos, pero los antiguos pueden estar corruptos.

---

## ✅ VERIFICACIÓN DE CONSISTENCIA

### 9.1 Matriz de Consistencia

| Componente | Tipo de Dato | Generación | Almacenamiento | Restauración | Frontend | Estado |
|-----------|--------------|-----------|-----------------|--------------|----------|--------|
| `return_receptions.id` | `varchar(255)` | ✅ | ✅ | ✅ | ✅ string | ✅ OK |
| `return_receptions.client_id` | `varchar(255)` | ✅ | ✅ | ✅ | ✅ string | ✅ OK |
| `return_receptions.credit_note_number` | `varchar(255)` | ✅ | ✅ | ✅ | ✅ string | ✅ OK |
| `return_receptions.total_value` | `numeric(10,2)` | ✅ | ✅ | ✅ | ✅ number | ✅ OK |
| `return_receptions.received_by` | `varchar(255)` | ✅ | ✅ | ✅ | ✅ string | ✅ OK |
| `return_receptions.created_at` | `varchar(255)` | ✅ | ✅ | ✅ | ✅ string | ✅ OK |
| `return_reception_items.id` | `integer` (seq) | ✅ | ✅ | ✅ | ✅ number | ✅ OK |
| `return_reception_items.return_reception_id` | `varchar(255)` | ✅ | ✅ | ✅ | ✅ string | ✅ OK |
| `return_reception_items.reference` | `varchar(255)` | ✅ | ✅ | ✅ | ✅ string | ✅ OK |
| `return_reception_items.quantity` | `integer` | ✅ | ✅ | ✅ | ✅ number | ✅ OK |
| `return_reception_items.unit_price` | `numeric(10,2)` | ✅ | ✅ | ✅ | ✅ number | ✅ OK |

---

## 📊 FLUJO COMPLETO DE DATOS

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. CREACIÓN DE DEVOLUCIÓN (Frontend)                            │
│    ReturnReceptionView.tsx → API POST /api/returns              │
│    Datos: {id, clientId, creditNoteNumber, items, ...}          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. INSERCIÓN EN BD (Backend)                                    │
│    ReturnService.createReturnReception()                        │
│    - INSERT INTO return_receptions (id, client_id, ...)         │
│    - INSERT INTO return_reception_items (return_reception_id, ...) │
│    - ID de items: AUTO-GENERADO por secuencia ✅                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. BACKUP AUTOMÁTICO (22:00 diariamente)                        │
│    BackupExecutionService.executeBackup()                       │
│    - pg_dump --encoding=UTF8 --clean --if-exists ...            │
│    - Genera archivo SQL con TODAS las tablas                    │
│    - Incluye: CREATE TABLE, COPY data, CONSTRAINTS              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. VALIDACIÓN DE BACKUP                                         │
│    BackupValidationService.validateBackup()                     │
│    - Detecta corrupción ⚠️                                       │
│    - Valida estructura SQL                                      │
│    - Cuenta tablas                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. ALMACENAMIENTO                                               │
│    Prendas/backend/backups/inventory-backup-*.sql               │
│    - Rotación: 7 diarios, 4 semanales, 3 mensuales              │
│    - Limpieza automática de logs > 30 días                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. RESTAURACIÓN (Manual o por desastre)                         │
│    BackupExecutionService.restoreBackup()                       │
│    - Crea backup de seguridad del estado actual                 │
│    - psql -f backup.sql                                         │
│    - Restaura TODAS las tablas incluyendo devoluciones          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. LECTURA DE DATOS RESTAURADOS (Frontend)                      │
│    ReturnReceptionView.loadReturnReceptions()                   │
│    - API GET /api/returns?page=1&limit=100                      │
│    - ReturnService.getAllWithPagination()                       │
│    - Mapea datos a interfaz ReturnReceptionData                 │
│    - Muestra en tabla                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 CONCLUSIONES

### ✅ Lo que está BIEN

1. **Tipos de datos consistentes**: Todos los tipos coinciden entre BD, backup y frontend
2. **Auto-incremento correcto**: Los IDs de items se generan automáticamente por secuencia
3. **Mapeo de datos correcto**: El backend mapea correctamente los datos de BD a frontend
4. **Validación de integridad**: Existe servicio para detectar backups corruptos
5. **Backup de seguridad**: Se crea backup antes de restaurar
6. **Rotación inteligente**: Mantiene 7 diarios, 4 semanales, 3 mensuales

### ⚠️ Lo que REQUIERE ATENCIÓN

1. **Corrupción en backups actuales**: Línea `\restrict` al inicio del archivo
   - Causa: Posible problema con redirección en Windows
   - Solución: Ya implementada (usar `-f` en lugar de `>`)
   - Acción: Ejecutar `validate-and-clean-backups.js` para limpiar backups existentes

2. **Tipo de dato `created_at` en BD**: Es `varchar(255)` en lugar de `timestamp`
   - Impacto: Menor (funciona, pero no es óptimo)
   - Recomendación: Considerar cambiar a `timestamp` en futuro

3. **Frontend usa `any[]` para devoluciones**: En `AppState`
   - Impacto: Menor (funciona, pero sin type safety)
   - Recomendación: Crear interfaz `ReturnReception` en types.ts

---

## 🔧 RECOMENDACIONES

### Inmediatas (Críticas)

1. **Limpiar backups corruptos**:
   ```bash
   cd Prendas/backend
   node scripts/validate-and-clean-backups.js
   ```

2. **Verificar que nuevos backups son válidos**:
   - Esperar al próximo backup automático (22:00)
   - O ejecutar: `npm run backup:manual`

### A Corto Plazo (Mejoras)

1. **Mejorar type safety en frontend**:
   ```typescript
   // En Prendas/src/types.ts
   export interface ReturnReception {
     id: string;
     clientId: string;
     creditNoteNumber?: string;
     items: ItemEntry[];
     totalValue: number;
     receivedBy: string;
     createdAt: string;
   }
   
   // En AppState
   returnReceptions?: ReturnReception[];
   ```

2. **Considerar cambiar tipo de `created_at`**:
   ```sql
   ALTER TABLE return_receptions ALTER COLUMN created_at TYPE timestamp;
   ```

### A Largo Plazo (Optimizaciones)

1. **Implementar validación automática post-backup**
2. **Crear alertas si backups fallan validación**
3. **Documentar procedimiento de restauración**
4. **Realizar pruebas periódicas de restauración**

---

## 📝 ARCHIVOS RELEVANTES

| Archivo | Propósito | Estado |
|---------|-----------|--------|
| `BackupExecutionService.js` | Genera y restaura backups | ✅ Correcto |
| `BackupValidationService.js` | Valida integridad | ✅ Correcto |
| `BackupRotationService.js` | Gestiona rotación | ✅ Correcto |
| `ReturnService.js` | CRUD de devoluciones | ✅ Correcto |
| `ReturnReceptionView.tsx` | Frontend de devoluciones | ✅ Correcto |
| `types.ts` | Tipos TypeScript | ⚠️ Usar `any[]` |
| Backups actuales | Archivos SQL | ⚠️ Algunos corruptos |

---

## 📞 PRÓXIMOS PASOS

1. ✅ Investigación completada
2. ⏳ Esperar confirmación para ejecutar limpiezas
3. ⏳ Implementar mejoras recomendadas
4. ⏳ Realizar prueba de restauración completa

