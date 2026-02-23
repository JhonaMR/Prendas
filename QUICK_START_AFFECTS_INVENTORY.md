# ⚡ Quick Start - Toggle "Afecta Inventario"

## 🎯 En 3 Pasos

### 1️⃣ Ejecutar Migración (2 minutos)
```bash
cd Prendas/backend
node scripts/migrate-affects-inventory.js
```

### 2️⃣ Reiniciar Backend (1 minuto)
```bash
pm2 restart all
```

### 3️⃣ Recargar Frontend (30 segundos)
- Limpia caché: `Ctrl+Shift+Delete`
- Recarga: `F5`

**¡Listo!** El toggle está funcionando.

---

## 📸 Cómo Se Ve

### En el Formulario de Recepción
```
┌─────────────────────────────────────┐
│ Impacto en Inventario               │
│ ☑ Esta recepción CARGA al inventario│
│ Desactiva si esta recepción es      │
│ parte de un lote que se descarga    │
│ en múltiples partes                 │
└─────────────────────────────────────┘
```

### En la Tabla de Recepciones
```
Remisión: REM-001
Confeccionista: Juan Pérez
Prendas: 100
🟠 No Afecta Inv.  ← Solo aparece si está desactivado
```

---

## 💡 Caso de Uso

**Problema**: Tienes un trío (blusa, top, falda) que es UNA referencia pero se envía a 3 confeccionistas.

**Solución**:
1. Recepción 1 (Blusa): ✅ Afecta Inventario
2. Recepción 2 (Top): ❌ NO Afecta Inventario
3. Recepción 3 (Falda): ❌ NO Afecta Inventario

**Resultado**: Inventario suma 100 (no 300)

---

## 🔧 Cambios Realizados

| Archivo | Cambio |
|---------|--------|
| `types.ts` | Agregado `affectsInventory?: boolean` |
| `ReceptionView.tsx` | Checkbox + indicador visual |
| `ReceptionService.js` | Maneja nuevo campo |
| `movementsController.js` | Recibe/envía `affectsInventory` |
| `receptions` (BD) | Nueva columna `affects_inventory` |

---

## ⚠️ Importante

**El toggle está listo, pero necesitas actualizar la lógica de inventario** para que realmente solo cuente recepciones con `affectsInventory = true`.

Ver: `INVENTORY_CALCULATION_UPDATE.md`

---

## 🆘 Troubleshooting

| Problema | Solución |
|----------|----------|
| Migración falla | Ejecuta SQL manualmente: `ALTER TABLE receptions ADD COLUMN affects_inventory BOOLEAN DEFAULT TRUE;` |
| Toggle no aparece | Limpia caché (Ctrl+Shift+Delete) y recarga |
| Error en backend | Revisa logs: `pm2 logs` |

---

## 📚 Documentación Completa

- `TOGGLE_AFFECTS_INVENTORY_SETUP.md` - Guía detallada
- `INVENTORY_CALCULATION_UPDATE.md` - Cómo actualizar inventario
- `IMPLEMENTATION_SUMMARY_AFFECTS_INVENTORY.md` - Resumen técnico

---

**¿Listo?** Ejecuta el paso 1️⃣ ahora mismo.
