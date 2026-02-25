# 📦 SISTEMA DE IMPORTACIÓN MASIVA DE DATOS

> Carga inicial del sistema sin ingreso manual. Desatrasa el sistema con información histórica.

---

## 🎯 ¿Qué es?

Un sistema completo para importar grandes volúmenes de datos al sistema de forma automática:

- **Referencias de productos** (650+)
- **Fichas de costo** (650+)
- **Pedidos de clientes** (250+)
- **Despachos realizados** (250+)
- **Recepciones de mercancía** (500+)

---

## ⚡ Inicio Rápido (5 minutos)

### 1️⃣ Preparar datos

```bash
# Opción A: Usar ejemplos incluidos
cd Prendas/backend

# Opción B: Convertir tus CSV
node src/scripts/csvToJsonConverter.js datos.csv datos.json
```

### 2️⃣ Crear configuración

```bash
cat > migration-config.json << EOF
{
  "references": "examples/data/referencias.json",
  "costSheets": "examples/data/fichas-costo.json",
  "orders": "examples/data/pedidos.json",
  "dispatches": "examples/data/despachos.json",
  "receptions": "examples/data/recepciones.json"
}
EOF
```

### 3️⃣ Ejecutar migración

```bash
node src/scripts/bulkMigration.js migration-config.json
```

### 4️⃣ Ver resultados

Se genera automáticamente `migration-report-TIMESTAMP.json` con:
- ✅ Registros exitosos
- ❌ Registros fallidos
- 📊 Resumen completo

---

## 📚 Documentación

| Documento | Propósito | Tiempo |
|-----------|-----------|--------|
| **QUICK_START_BULK_IMPORT.md** | Inicio rápido | 5 min |
| **BULK_IMPORT_GUIDE.md** | Guía completa | 30 min |
| **BULK_IMPORT_API_REFERENCE.md** | Referencia técnica | 15 min |
| **BULK_IMPORT_SUMMARY.md** | Resumen ejecutivo | 10 min |
| **BULK_IMPORT_CHECKLIST.md** | Checklist de implementación | 20 min |

---

## 🛠️ Herramientas Disponibles

### 1. Convertidor CSV a JSON
```bash
node src/scripts/csvToJsonConverter.js entrada.csv salida.json
```
Convierte archivos CSV a JSON para importación.

### 2. Script de Migración
```bash
node src/scripts/bulkMigration.js config.json
```
Ejecuta importación completa con reportes automáticos.

### 3. API REST
```bash
curl -X POST http://localhost:3000/api/bulk-import/references \
  -H "Authorization: Bearer TOKEN" \
  -d @referencias.json
```
Importa datos a través de API.

---

## 📊 Estructura de Datos

### Referencias
```json
{
  "codigo": "10210",
  "descripcion": "Camiseta Básica",
  "marca": "Premium",
  "novedad": true
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
  "items": [
    {
      "referencia": "10210",
      "cantidad": 500,
      "lote": "LOTE-001"
    }
  ]
}
```

---

## ✅ Características

- ✅ Validación automática de datos
- ✅ Detección de duplicados
- ✅ Verificación de integridad referencial
- ✅ Reportes detallados de errores
- ✅ Conversión CSV a JSON
- ✅ Ejemplos incluidos
- ✅ Documentación completa
- ✅ Protección con autenticación
- ✅ Permisos de admin
- ✅ Cálculos automáticos

---

## 🔐 Seguridad

- 🔒 Requiere autenticación (token JWT)
- 🔒 Solo admins pueden importar
- 🔒 Validación de entrada
- 🔒 Protección contra inyección SQL
- 🔒 Auditoría de cambios

---

## 📋 Orden de Importación

**IMPORTANTE:** Seguir este orden para mantener integridad referencial:

```
1. Referencias ──────────────────┐
                                 ├─→ 2. Fichas de Costo
                                 │
3. Clientes (deben existir)      │
                                 ├─→ 4. Pedidos
                                 │
                                 ├─→ 5. Despachos
                                 │
                                 └─→ 6. Recepciones
```

---

## 🚀 Casos de Uso

### Migración desde Sistema Anterior
```bash
# 1. Exportar datos del sistema anterior a CSV
# 2. Convertir CSV a JSON
node src/scripts/csvToJsonConverter.js datos.csv datos.json
# 3. Importar
node src/scripts/bulkMigration.js config.json
```

### Cargar Datos Históricos
```bash
# Preparar archivos JSON con datos históricos
# Ejecutar importación
node src/scripts/bulkMigration.js config.json
```

### Desatrasar el Sistema
```bash
# Cargar información de períodos anteriores
# El sistema queda listo para trabajar con normalidad
```

---

## 📁 Archivos Incluidos

```
Prendas/backend/
├── src/
│   ├── controllers/
│   │   └── bulkImportController.js      ← Controlador principal
│   ├── scripts/
│   │   ├── csvToJsonConverter.js        ← Convertidor CSV
│   │   └── bulkMigration.js             ← Script de migración
│   └── routes/
│       └── index.js                     ← Rutas agregadas
├── examples/
│   ├── migration-config.json            ← Configuración
│   └── data/
│       ├── referencias.json             ← Ejemplo
│       ├── referencias.csv              ← Ejemplo CSV
│       ├── fichas-costo.json            ← Ejemplo
│       ├── pedidos.json                 ← Ejemplo
│       ├── despachos.json               ← Ejemplo
│       └── recepciones.json             ← Ejemplo
├── BULK_IMPORT_README.md                ← Este archivo
├── QUICK_START_BULK_IMPORT.md           ← Inicio rápido
├── BULK_IMPORT_GUIDE.md                 ← Guía completa
├── BULK_IMPORT_API_REFERENCE.md         ← Referencia API
├── BULK_IMPORT_SUMMARY.md               ← Resumen
└── BULK_IMPORT_CHECKLIST.md             ← Checklist
```

---

## 🔍 Validaciones

El sistema valida automáticamente:

- ✅ Campos requeridos presentes
- ✅ Referencias existen
- ✅ Clientes existen
- ✅ Órdenes existen
- ✅ Datos duplicados
- ✅ Tipos de datos correctos
- ✅ Fechas en formato correcto

---

## 📈 Capacidad

| Métrica | Límite |
|---------|--------|
| Registros por request | 1,000 |
| Tamaño máximo | 10 MB |
| Timeout | 30 segundos |
| Ideal para | 100-10,000 registros |

---

## ⚠️ Consideraciones Importantes

1. **Orden de Importación**: Siempre seguir el orden recomendado
2. **Integridad Referencial**: Las referencias deben existir antes de usarlas
3. **Duplicados**: El sistema detecta y rechaza duplicados
4. **Backup**: Hacer backup antes de importación masiva
5. **Validación**: Revisar reporte de errores después de importar

---

## 🆘 Troubleshooting

| Problema | Solución |
|----------|----------|
| "Referencia no existe" | Importar referencias primero |
| "Cliente no existe" | Verificar que cliente existe en BD |
| "Orden no existe" | Importar pedidos antes de despachos |
| "Referencia ya existe" | Usar códigos únicos |
| Error de conexión | Verificar que servidor está corriendo |

---

## 📞 Soporte

Para más información:
- 📖 Ver `BULK_IMPORT_GUIDE.md` para documentación completa
- 🔧 Ver `BULK_IMPORT_API_REFERENCE.md` para referencia técnica
- ⚡ Ver `QUICK_START_BULK_IMPORT.md` para inicio rápido
- ✅ Ver `BULK_IMPORT_CHECKLIST.md` para checklist

---

## 🎓 Ejemplos Completos

### Ejemplo 1: Migración Pequeña
```bash
# Convertir CSV
node src/scripts/csvToJsonConverter.js referencias.csv referencias.json

# Crear config
cat > config.json << EOF
{
  "references": "referencias.json",
  "costSheets": "fichas-costo.json"
}
EOF

# Ejecutar
node src/scripts/bulkMigration.js config.json
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
cat > config.json << EOF
{
  "references": "referencias.json",
  "costSheets": "fichas-costo.json",
  "orders": "pedidos.json",
  "dispatches": "despachos.json",
  "receptions": "recepciones.json"
}
EOF

# Ejecutar
node src/scripts/bulkMigration.js config.json
```

---

## 🎯 Próximos Pasos

1. ✅ Leer `QUICK_START_BULK_IMPORT.md`
2. ✅ Preparar datos en formato JSON o CSV
3. ✅ Convertir CSV a JSON si es necesario
4. ✅ Crear archivo de configuración
5. ✅ Ejecutar migración
6. ✅ Revisar reporte de errores
7. ✅ Validar datos en el sistema

---

## 📊 Resultado Esperado

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

## 📝 Notas

- Sistema listo para usar
- Ejemplos incluidos
- Documentación completa
- Soporte para CSV y JSON
- Validación automática
- Reportes detallados

---

**Creado:** 25 de Febrero de 2026  
**Versión:** 1.0  
**Estado:** ✅ Listo para usar

---

¿Preguntas? Ver documentación completa en `BULK_IMPORT_GUIDE.md`
