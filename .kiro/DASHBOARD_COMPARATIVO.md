# Dashboard Comparativo - Guía de Implementación

## 📋 Descripción General

El **Dashboard Comparativo** es una nueva vista que proporciona análisis detallado de rendimiento y cumplimiento de ventas y despachos por correría. Está diseñado para usuarios con roles de ADMIN, SOPORTE, OBSERVER y GENERAL.

## 🚫 Restricciones de Acceso

- **NO VISIBLE** para usuarios con rol **DISEÑADORA**
- **VISIBLE** para: ADMIN, SOPORTE, OBSERVER, GENERAL

## 📁 Estructura de Archivos

```
Prendas/
├── src/
│   ├── views/
│   │   └── ComparativeDashboardView.tsx          # Vista principal
│   └── components/
│       └── ComparativeDashboard/
│           └── ExportModal.tsx                   # Modal de exportación
├── .kiro/
│   └── DASHBOARD_COMPARATIVO.md                  # Este archivo
```

## 🎯 Características Principales

### 1. **KPI Cards (4 Tarjetas de Métricas)**
- **Ventas Totales**: Unidades vendidas en el período
- **Despachos**: Unidades despachadas vs vendidas
- **Valor Vendido**: Total en pesos
- **Diferencia**: Valor faltante por despachar

### 2. **Gráficos Visuales**
- **Cumplimiento por Correría**: Barras comparativas de ventas vs despachos
- **Distribución de Venta**: Gráfico de porcentajes por correría

### 3. **Tablas de Análisis**
- **Cumplimiento por Vendedor**: 
  - Vista de Unidades o Valor
  - Pedidos, vendidas, despachadas
  - Porcentaje de cumplimiento
  
- **Efectividad por Diseñadora**:
  - Referencias creadas vs vendidas
  - Porcentaje de éxito

### 4. **Funcionalidades**
- Selector de año (2024, 2025, 2026)
- Botón de exportación (PDF/Excel)
- Vistas alternativas (Unidades/Valor)

## 🔄 Flujo de Datos

```
AppState (Redux/Context)
    ↓
ComparativeDashboardView
    ├── state.correrias
    ├── state.orders
    ├── state.dispatches
    ├── state.sellers
    ├── state.disenadoras
    └── state.references
    ↓
Cálculo de Métricas (useMemo)
    ↓
Renderizado de Componentes
```

## 📊 Cálculos de Métricas

### Cumplimiento de Unidades
```
cumplimientoUnidades = (totalDespachadas / totalVendidas) * 100
```

### Cumplimiento de Valor
```
cumplimientoValor = (totalDespachadoValor / totalVendidoValor) * 100
```

### Diferencia Faltante
```
diferenciaValor = totalVendidoValor - totalDespachadoValor
```

### Efectividad de Diseñadora
```
exitoPedido = (refsVendidas / refsCreadas) * 100
```

## 🎨 Estilos y Colores

- **Indigo**: Ventas, referencias
- **Emerald**: Despachos, cumplimiento
- **Blue**: Valores en pesos
- **Rose**: Diferencias, alertas

## 🔧 Integración en App.tsx

```typescript
case 'comparativeDashboard':
  if (user.role === UserRole.DISEÑADORA) {
    setActiveTab('home');
    alert('No tienes permiso para acceder a esta sección');
    return <HomeView ... />;
  }
  return <ComparativeDashboardView state={state} user={user} />;
```

## 📱 Responsividad

- **Mobile**: 1 columna
- **Tablet**: 2 columnas
- **Desktop**: 3-4 columnas

## 🚀 Mejoras Futuras

1. **Exportación Real**
   - Implementar generación de PDF con jsPDF
   - Implementar generación de Excel con ExcelJS

2. **Filtros Avanzados**
   - Filtrar por vendedor específico
   - Filtrar por diseñadora específica
   - Rango de fechas personalizado

3. **Gráficos Interactivos**
   - Integrar Recharts para gráficos más avanzados
   - Gráficos de tendencias
   - Comparativas históricas

4. **Alertas y Notificaciones**
   - Alertas de bajo cumplimiento
   - Notificaciones de referencias en cero
   - Recomendaciones automáticas

## 🐛 Troubleshooting

### Problema: No aparece el botón en HomeView
**Solución**: Verificar que el usuario NO sea DISEÑADORA

### Problema: Métricas en cero
**Solución**: Verificar que existan datos en:
- `state.orders` (pedidos)
- `state.dispatches` (despachos)
- `state.correrias` (correrias del año seleccionado)

### Problema: Tablas vacías
**Solución**: Verificar que existan vendedores y diseñadoras con datos

## 📞 Soporte

Para reportar problemas o sugerencias, contactar al equipo de desarrollo.
