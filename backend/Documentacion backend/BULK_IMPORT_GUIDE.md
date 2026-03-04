# 📦 GUÍA DE IMPORTACIÓN MASIVA DE DATOS

## Descripción General

Este sistema permite cargar datos iniciales al sistema de forma masiva, sin necesidad de ingresarlos uno por uno. Es ideal para:

- Migración de datos desde sistemas anteriores
- Carga inicial de información histórica
- Desatrasar el sistema con datos de períodos anteriores

## Flujo de Importación

```
CSV/JSON → Validación → BD → Reporte
```

### Orden de Importación (IMPORTANTE)

Debe seguirse este orden para mantener integridad referencial:

1. **Referencias de Productos** - Base de todo
2. **Fichas de Costo** - Dependen de referencias
3. **Pedidos de Clientes** - Dependen de clientes (deben existir)
4. **Despachos** - Dependen de pedidos
5. **Recepciones** - Independientes pero relacionadas

---

## 1. PREPARAR DATOS

### Opción A: Desde CSV

Si tienes datos en Excel o CSV:

```bash
# Convertir CSV a JSON
node src/scripts/csvToJsonConverter.js referencias.csv referencias.json
```

**Formato CSV esperado:**
```csv
codigo,descripcion,marca,novedad,observaciones
10210,Camiseta Básica,MarcaX,true,Modelo clásico
10211,Pantalón Denim,MarcaY,false,Azul oscuro
```

### Opción B: Crear JSON directamente

Crear archivos JSON con la estructura correcta (ver ejemplos abajo).

---

## 2. ESTRUCTURA DE DATOS

### 2.1 Referencias de Productos

**Archivo:** `referencias.json`

```json
[
  {
    "codigo": "10210",
    "descripcion": "Camiseta Básica",
    "marca": "MarcaX",
    "novedad": true,
    "observaciones": "Modelo clásico"
  },
  {
    "codigo": "10211",
    "descripcion": "Pantalón Denim",
    "marca": "MarcaY",
    "novedad": false,
    "observaciones": "Azul oscuro"
  }
]
```

**Campos requeridos:**
- `codigo` (string) - Identificador único
- `descripcion` (string) - Descripción del producto

**Campos opcionales:**
- `marca` (string)
- `novedad` (boolean) - true/false
- `observaciones` (string)

---

### 2.2 Fichas de Costo

**Archivo:** `fichas-costo.json`

```json
[
  {
    "referencia": "10210",
    "descripcion": "Camiseta Básica",
    "marca": "MarcaX",
    "totalMateriaPrima": 5000,
    "totalManoObra": 3000,
    "totalInsumosDirectos": 1000,
    "totalInsumosIndirectos": 500,
    "totalProvisiones": 200,
    "rentabilidad": 49
  },
  {
    "referencia": "10211",
    "descripcion": "Pantalón Denim",
    "marca": "MarcaY",
    "totalMateriaPrima": 8000,
    "totalManoObra": 4000,
    "totalInsumosDirectos": 1500,
    "totalInsumosIndirectos": 800,
    "totalProvisiones": 300,
    "rentabilidad": 45
  }
]
```

**Campos requeridos:**
- `referencia` (string) - Debe existir en referencias
- `descripcion` (string)

**Campos opcionales:**
- `marca` (string)
- `totalMateriaPrima` (number) - Costo en pesos
- `totalManoObra` (number)
- `totalInsumosDirectos` (number)
- `totalInsumosIndirectos` (number)
- `totalProvisiones` (number)
- `rentabilidad` (number) - Porcentaje, default 49

**Nota:** Los totales se calculan automáticamente.

---

### 2.3 Pedidos de Clientes

**Archivo:** `pedidos.json`

```json
[
  {
    "numeroOrden": "PED-001",
    "clienteId": 1,
    "fechaPedido": "2026-02-01",
    "fechaEntrega": "2026-02-15",
    "estado": "completado",
    "items": [
      {
        "referencia": "10210",
        "cantidad": 50,
        "precioUnitario": 25000
      },
      {
        "referencia": "10211",
        "cantidad": 30,
        "precioUnitario": 35000
      }
    ]
  },
  {
    "numeroOrden": "PED-002",
    "clienteId": 2,
    "fechaPedido": "2026-02-05",
    "fechaEntrega": "2026-02-20",
    "estado": "completado",
    "items": [
      {
        "referencia": "10210",
        "cantidad": 100,
        "precioUnitario": 25000
      }
    ]
  }
]
```

**Campos requeridos:**
- `numeroOrden` (string) - Identificador único
- `clienteId` (number) - ID del cliente (debe existir)
- `items` (array) - Al menos un item

**Campos opcionales:**
- `fechaPedido` (date) - Formato YYYY-MM-DD
- `fechaEntrega` (date)
- `estado` (string) - pendiente, completado, cancelado
- `items[].precioUnitario` (number)

---

### 2.4 Despachos

**Archivo:** `despachos.json`

```json
[
  {
    "numeroDespacho": "DESP-001",
    "numeroOrden": "PED-001",
    "fechaDespacho": "2026-02-15",
    "items": [
      {
        "referencia": "10210",
        "cantidad": 50
      },
      {
        "referencia": "10211",
        "cantidad": 30
      }
    ]
  },
  {
    "numeroDespacho": "DESP-002",
    "numeroOrden": "PED-002",
    "fechaDespacho": "2026-02-20",
    "items": [
      {
        "referencia": "10210",
        "cantidad": 100
      }
    ]
  }
]
```

**Campos requeridos:**
- `numeroDespacho` (string) - Identificador único
- `numeroOrden` (string) - Debe existir en pedidos
- `items` (array) - Al menos un item

**Campos opcionales:**
- `fechaDespacho` (date) - Formato YYYY-MM-DD

---

### 2.5 Recepciones de Mercancía

**Archivo:** `recepciones.json`

```json
[
  {
    "numeroRecepcion": "REC-001",
    "numeroOrdenCompra": "OC-001",
    "fechaRecepcion": "2026-02-10",
    "items": [
      {
        "referencia": "10210",
        "cantidad": 500,
        "lote": "LOTE-001"
      },
      {
        "referencia": "10211",
        "cantidad": 300,
        "lote": "LOTE-002"
      }
    ]
  },
  {
    "numeroRecepcion": "REC-002",
    "numeroOrdenCompra": "OC-002",
    "fechaRecepcion": "2026-02-12",
    "items": [
      {
        "referencia": "10210",
        "cantidad": 200,
        "lote": "LOTE-003"
      }
    ]
  }
]
```

**Campos requeridos:**
- `numeroRecepcion` (string) - Identificador único
- `numeroOrdenCompra` (string)
- `items` (array) - Al menos un item

**Campos opcionales:**
- `fechaRecepcion` (date) - Formato YYYY-MM-DD
- `items[].lote` (string) - Número de lote

---

## 3. EJECUTAR IMPORTACIÓN

### Opción A: API REST

Hacer llamadas HTTP a los endpoints:

```bash
# Importar referencias
curl -X POST http://localhost:3000/api/bulk-import/references \
  -H "Content-Type: application/json" \
  -d @referencias.json

# Importar fichas de costo
curl -X POST http://localhost:3000/api/bulk-import/cost-sheets \
  -H "Content-Type: application/json" \
  -d @fichas-costo.json

# Importar pedidos
curl -X POST http://localhost:3000/api/bulk-import/orders \
  -H "Content-Type: application/json" \
  -d @pedidos.json

# Importar despachos
curl -X POST http://localhost:3000/api/bulk-import/dispatches \
  -H "Content-Type: application/json" \
  -d @despachos.json

# Importar recepciones
curl -X POST http://localhost:3000/api/bulk-import/receptions \
  -H "Content-Type: application/json" \
  -d @recepciones.json
```

### Opción B: Script de Migración

Crear archivo de configuración `migration-config.json`:

```json
{
  "references": "path/to/referencias.json",
  "costSheets": "path/to/fichas-costo.json",
  "orders": "path/to/pedidos.json",
  "dispatches": "path/to/despachos.json",
  "receptions": "path/to/recepciones.json"
}
```

Ejecutar:

```bash
node src/scripts/bulkMigration.js migration-config.json
```

---

## 4. RESPUESTAS Y REPORTES

### Respuesta de API

```json
{
  "success": true,
  "message": "Importación completada: 50 exitosas, 2 fallidas",
  "results": {
    "success": 50,
    "failed": 2,
    "errors": [
      {
        "codigo": "10212",
        "error": "Referencia ya existe"
      },
      {
        "codigo": "10213",
        "error": "Código y descripción requeridos"
      }
    ]
  }
}
```

### Reporte de Migración

Se genera automáticamente en `migration-report-TIMESTAMP.json`:

```json
{
  "timestamp": "2026-02-25T10:30:00.000Z",
  "results": {
    "references": { "success": 650, "failed": 0 },
    "costSheets": { "success": 650, "failed": 0 },
    "orders": { "success": 250, "failed": 5 },
    "dispatches": { "success": 250, "failed": 0 },
    "receptions": { "success": 500, "failed": 10 }
  },
  "errors": [...],
  "summary": {
    "totalSuccess": 2300,
    "totalFailed": 15
  }
}
```

---

## 5. VALIDACIONES Y ERRORES

### Validaciones Automáticas

- ✅ Campos requeridos presentes
- ✅ Referencias existen (para fichas, pedidos, etc.)
- ✅ Clientes existen (para pedidos)
- ✅ Órdenes existen (para despachos)
- ✅ Datos duplicados detectados
- ✅ Tipos de datos correctos

### Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "Código y descripción requeridos" | Falta campo obligatorio | Verificar JSON |
| "Referencia ya existe" | Duplicado | Usar código único |
| "Referencia no existe" | FK inválida | Importar referencias primero |
| "Cliente no existe" | FK inválida | Verificar ID de cliente |
| "Orden no existe" | FK inválida | Importar pedidos primero |

---

## 6. MEJORES PRÁCTICAS

### ✅ Hacer

- Seguir el orden de importación recomendado
- Validar datos antes de importar
- Hacer backup antes de importación masiva
- Revisar reporte de errores
- Importar en lotes pequeños si hay muchos datos

### ❌ No Hacer

- Importar sin validar datos
- Cambiar el orden de importación
- Usar caracteres especiales en códigos
- Dejar campos requeridos vacíos
- Importar datos duplicados

---

## 7. EJEMPLOS COMPLETOS

### Ejemplo 1: Migración Pequeña

```bash
# 1. Convertir CSV a JSON
node src/scripts/csvToJsonConverter.js referencias.csv referencias.json

# 2. Crear fichas-costo.json manualmente

# 3. Crear config
cat > migration-config.json << EOF
{
  "references": "referencias.json",
  "costSheets": "fichas-costo.json"
}
EOF

# 4. Ejecutar
node src/scripts/bulkMigration.js migration-config.json
```

### Ejemplo 2: Migración Completa

```bash
# Convertir todos los CSV
node src/scripts/csvToJsonConverter.js referencias.csv referencias.json
node src/scripts/csvToJsonConverter.js fichas-costo.csv fichas-costo.json
node src/scripts/csvToJsonConverter.js pedidos.csv pedidos.json
node src/scripts/csvToJsonConverter.js despachos.csv despachos.json
node src/scripts/csvToJsonConverter.js recepciones.csv recepciones.json

# Crear config
cat > migration-config.json << EOF
{
  "references": "referencias.json",
  "costSheets": "fichas-costo.json",
  "orders": "pedidos.json",
  "dispatches": "despachos.json",
  "receptions": "recepciones.json"
}
EOF

# Ejecutar
node src/scripts/bulkMigration.js migration-config.json
```

---

## 8. SOPORTE Y TROUBLESHOOTING

### Verificar Datos Importados

```sql
-- Contar referencias
SELECT COUNT(*) FROM product_references;

-- Contar fichas de costo
SELECT COUNT(*) FROM fichas_costo;

-- Contar pedidos
SELECT COUNT(*) FROM orders;

-- Ver últimos registros
SELECT * FROM product_references ORDER BY created_at DESC LIMIT 10;
```

### Limpiar Datos (si es necesario)

```sql
-- ⚠️ CUIDADO: Esto elimina todos los datos
DELETE FROM product_references;
DELETE FROM fichas_costo;
DELETE FROM orders;
DELETE FROM dispatches;
DELETE FROM receptions;
```

---

**Última actualización:** 25 de Febrero de 2026
