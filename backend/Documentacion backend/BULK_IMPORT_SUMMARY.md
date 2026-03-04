# 📦 SISTEMA DE IMPORTACIÓN MASIVA - RESUMEN

## ¿Qué se creó?

Un sistema completo para cargar datos iniciales al sistema sin ingresarlos uno por uno. Perfecto para desatrasar el sistema con información histórica.

---

## 📁 Archivos Creados

### 1. Controlador Principal
- **`src/controllers/bulkImportController.js`** - API de importación masiva
  - 5 endpoints para importar diferentes tipos de datos
  - Validación automática
  - Reportes de errores

### 2. Herramientas de Migración
- **`src/scripts/csvToJsonConverter.js`** - Convierte CSV a JSON
  - Maneja comillas y delimitadores
  - Uso desde CLI
  
- **`src/scripts/bulkMigration.js`** - Script de migración completa
  - Ejecuta importación en orden correcto
  - Genera reportes automáticos
  - Manejo de errores

### 3. Ejemplos de Datos
- **`examples/data/referencias.json`** - 10 referencias de ejemplo
- **`examples/data/fichas-costo.json`** - 10 fichas de costo de ejemplo
- **`examples/data/pedidos.json`** - 5 pedidos de ejemplo
- **`examples/data/despachos.json`** - 5 despachos de ejemplo
- **`examples/data/recepciones.json`** - 5 recepciones de ejemplo
- **`examples/migration-config.json`** - Configuración de migración

### 4. Documentación
- **`BULK_IMPORT_GUIDE.md`** - Guía completa (7 secciones)
- **`QUICK_START_BULK_IMPORT.md`** - Inicio rápido (5 minutos)
- **`BULK_IMPORT_API_REFERENCE.md`** - Referencia técnica de API
- **`BULK_IMPORT_SUMMARY.md`** - Este archivo

### 5. Rutas API
- Agregadas 5 rutas POST en `src/routes/index.js`
- Protegidas con autenticación y permisos de admin

---

## 🚀 Cómo Usar

### Opción 1: Script Automático (Recomendado)

```bash
# 1. Preparar datos (ya están en examples/data/)
# 2. Ejecutar migración
node src/scripts/bulkMigration.js examples/migration-config.json
```

### Opción 2: API REST

```bash
# Importar referencias
curl -X POST http://localhost:3000/api/bulk-import/references \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d @referencias.json
```

### Opción 3: Convertir CSV primero

```bash
# Convertir CSV a JSON
node src/scripts/csvToJsonConverter.js datos.csv datos.json

# Luego usar script o API
```

---

## 📊 Datos que se pueden cargar

| Tipo | Cantidad | Descripción |
|------|----------|-------------|
| Referencias | 650+ | Productos únicos |
| Fichas Costo | 650+ | Costos y precios |
| Pedidos | 250+ | Órdenes de clientes |
| Despachos | 250+ | Envíos realizados |
| Recepciones | 500+ | Mercancía recibida |

---

## ✅ Características

- ✅ Validación automática de datos
- ✅ Detección de duplicados
- ✅ Verificación de integridad referencial
- ✅ Reportes detallados de errores
- ✅ Orden de importación automático
- ✅ Conversión CSV a JSON
- ✅ Ejemplos incluidos
- ✅ Documentación completa
- ✅ Protección con autenticación
- ✅ Permisos de admin

---

## 📋 Orden de Importación (IMPORTANTE)

Debe seguirse este orden para mantener integridad referencial:

1. **Referencias** - Base de todo
2. **Fichas de Costo** - Dependen de referencias
3. **Pedidos** - Dependen de clientes
4. **Despachos** - Dependen de pedidos
5. **Recepciones** - Independientes

---

## 🔍 Validaciones Automáticas

- ✅ Campos requeridos presentes
- ✅ Referencias existen (para fichas, pedidos, etc.)
- ✅ Clientes existen (para pedidos)
- ✅ Órdenes existen (para despachos)
- ✅ Datos duplicados detectados
- ✅ Tipos de datos correctos
- ✅ Fechas en formato correcto

---

## 📈 Ejemplo de Resultado

```json
{
  "success": true,
  "message": "Importación completada: 2300 exitosas, 15 fallidas",
  "results": {
    "references": { "success": 650, "failed": 0 },
    "costSheets": { "success": 650, "failed": 0 },
    "orders": { "success": 250, "failed": 5 },
    "dispatches": { "success": 250, "failed": 0 },
    "receptions": { "success": 500, "failed": 10 }
  }
}
```

---

## 🛠️ Estructura de Datos

### Referencias
```json
{
  "codigo": "10210",
  "descripcion": "Camiseta Básica",
  "marca": "Premium",
  "novedad": true,
  "observaciones": "Modelo clásico"
}
```

### Fichas de Costo
```json
{
  "referencia": "10210",
  "descripcion": "Camiseta Básica",
  "totalMateriaPrima": 5000,
  "totalManoObra": 3000,
  "rentabilidad": 49
}
```

### Pedidos
```json
{
  "numeroOrden": "PED-2026-001",
  "clienteId": 1,
  "fechaPedido": "2026-01-15",
  "items": [
    {
      "referencia": "10210",
      "cantidad": 50,
      "precioUnitario": 25000
    }
  ]
}
```

### Despachos
```json
{
  "numeroDespacho": "DESP-2026-001",
  "numeroOrden": "PED-2026-001",
  "fechaDespacho": "2026-02-01",
  "items": [
    {
      "referencia": "10210",
      "cantidad": 50
    }
  ]
}
```

### Recepciones
```json
{
  "numeroRecepcion": "REC-2026-001",
  "numeroOrdenCompra": "OC-2026-001",
  "fechaRecepcion": "2026-01-10",
  "items": [
    {
      "referencia": "10210",
      "cantidad": 500,
      "lote": "LOTE-001-2026"
    }
  ]
}
```

---

## 🔐 Seguridad

- ✅ Requiere autenticación (token JWT)
- ✅ Solo admins pueden importar
- ✅ Validación de datos antes de insertar
- ✅ Transacciones ACID
- ✅ Auditoría de cambios

---

## 📚 Documentación

| Documento | Propósito |
|-----------|-----------|
| `BULK_IMPORT_GUIDE.md` | Guía completa con todos los detalles |
| `QUICK_START_BULK_IMPORT.md` | Inicio rápido en 5 minutos |
| `BULK_IMPORT_API_REFERENCE.md` | Referencia técnica de endpoints |
| `BULK_IMPORT_SUMMARY.md` | Este resumen |

---

## 🎯 Casos de Uso

### 1. Migración desde Sistema Anterior
```bash
# Exportar datos del sistema anterior a CSV
# Convertir CSV a JSON
node src/scripts/csvToJsonConverter.js datos.csv datos.json
# Importar
node src/scripts/bulkMigration.js config.json
```

### 2. Cargar Datos Históricos
```bash
# Preparar archivos JSON con datos históricos
# Ejecutar importación
node src/scripts/bulkMigration.js config.json
```

### 3. Desatrasar el Sistema
```bash
# Cargar información de períodos anteriores
# El sistema queda listo para trabajar con normalidad
```

---

## ⚠️ Consideraciones Importantes

1. **Orden de Importación**: Siempre seguir el orden recomendado
2. **Integridad Referencial**: Las referencias deben existir antes de usarlas
3. **Duplicados**: El sistema detecta y rechaza duplicados
4. **Backup**: Hacer backup antes de importación masiva
5. **Validación**: Revisar reporte de errores después de importar

---

## 🔧 Troubleshooting

| Problema | Solución |
|----------|----------|
| "Referencia no existe" | Importar referencias primero |
| "Cliente no existe" | Verificar que cliente existe en BD |
| "Orden no existe" | Importar pedidos antes de despachos |
| "Referencia ya existe" | Usar códigos únicos |
| Error de conexión | Verificar que servidor está corriendo |

---

## 📊 Capacidad

- Máximo 1000 registros por request
- Máximo 10 MB por request
- Timeout: 30 segundos
- Ideal para: 100-10,000 registros por tipo

---

## 🚀 Próximos Pasos

1. Preparar datos en formato JSON o CSV
2. Convertir CSV a JSON si es necesario
3. Crear archivo de configuración
4. Ejecutar migración
5. Revisar reporte de errores
6. Validar datos en el sistema

---

## 📞 Soporte

Para más información:
- Ver `BULK_IMPORT_GUIDE.md` para documentación completa
- Ver `BULK_IMPORT_API_REFERENCE.md` para referencia técnica
- Ver `QUICK_START_BULK_IMPORT.md` para inicio rápido

---

**Creado:** 25 de Febrero de 2026  
**Versión:** 1.0  
**Estado:** Listo para usar
