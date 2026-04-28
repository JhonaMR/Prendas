# Paleta de Modo Oscuro - Prendas App

## Contexto
El modo oscuro está implementado usando `DarkModeContext` que persiste en `localStorage` bajo la clave `dark_mode`. El toggle aparece en el header solo para usuarios con rol `SOPORTE`.

## Paleta de Colores Oscura

### Fondos
- **Fondo principal**: `#3d2d52` (morado claro-medio)
- **Fondo secundario**: `#4a3a63` (morado más claro)
- **Cards/Contenedores**: `#4a3a63` (morado claro)
- **Headers de tabla**: `#5a4a75` (morado aún más claro)
- **Filas alternas (par)**: `#3d2d52`
- **Filas alternas (impar)**: `#4a3a5f`
- **Filas con devolución**: `#5a3a70` (con 70% opacity)

### Bordes
- **Borde principal**: `border-violet-700`
- **Borde secundario**: `border-violet-600`
- **Borde terciario**: `divide-violet-700/50`
- **Borde muy claro**: `border-violet-700/40`

### Textos
- **Título principal**: `text-violet-200`
- **Subtítulo**: `text-violet-400`
- **Texto en headers**: `text-violet-200`
- **Texto en inputs**: `text-violet-100`
- **Placeholder en inputs**: `placeholder-violet-600` o `placeholder-violet-500`
- **Texto deshabilitado**: `text-violet-700`
- **Texto en filas**: `text-violet-300` o `text-violet-400`

### Botones
- **Botón primario (Agregar)**: `bg-violet-600 hover:bg-violet-700`
- **Botón secundario (Importar)**: `bg-purple-700 hover:bg-purple-800`
- **Botón guardar**: `bg-pink-600 hover:bg-pink-700`
- **Botón deshabilitado**: `bg-violet-900/40 text-violet-700 cursor-not-allowed`
- **Botón filtro**: `border-violet-700 bg-[#3d2d52] text-violet-300 hover:text-pink-400 hover:border-pink-600`
- **Botón eliminar**: `text-violet-700 hover:text-pink-400`
- **Botón eliminar deshabilitado**: `text-violet-900/40 cursor-not-allowed`

### Inputs
- **Fondo input**: `bg-[#3d2d52]`
- **Borde input**: `border-violet-600`
- **Focus ring**: `focus:ring-violet-400`
- **Select options**: `bg-[#3d2d52]` (para las opciones del select)

### Estados
- **Cambios sin guardar (punto)**: `bg-pink-500`
- **Cambios sin guardar (texto)**: `text-pink-400`
- **Spinner**: `border-violet-500`
- **Ring en filas nuevas**: `ring-violet-600`

### Leyenda
- **Texto leyenda**: `text-violet-400`
- **Box leyenda**: `bg-violet-900/50 border-violet-600`

## Transiciones
Todos los cambios de color deben incluir:
```tailwind
transition-colors duration-300
```

## Estructura de Paleta en Código

```typescript
const dk = {
  page:       isDark ? 'bg-[#3d2d52]'                    : '',
  title:      isDark ? 'text-violet-200'                  : 'text-slate-800',
  subtitle:   isDark ? 'text-violet-400'                  : 'text-slate-400',
  card:       isDark ? 'bg-[#4a3a63] border-violet-700'   : 'bg-white border-slate-100',
  thead:      isDark ? 'bg-[#5a4a75] border-violet-600'   : 'bg-indigo-50 border-indigo-200',
  thDivide:   isDark ? 'divide-violet-600'                : 'divide-indigo-200',
  th:         isDark ? 'text-violet-200'                  : 'text-indigo-400',
  rowEven:    isDark ? 'bg-[#3d2d52]'                     : 'bg-white',
  rowOdd:     isDark ? 'bg-[#4a3a5f]'                     : 'bg-indigo-50/20',
  rowDev:     isDark ? 'bg-[#5a3a70]/70'                  : 'bg-slate-100/90',
  rowHover:   isDark ? 'hover:bg-violet-700/40'           : 'hover:bg-indigo-50/40',
  rowDevHov:  isDark ? 'hover:bg-[#5a3a70]'               : 'hover:bg-slate-200/70',
  rowDivide:  isDark ? 'divide-violet-700/50'             : 'divide-slate-200',
  rowBorder:  isDark ? 'border-violet-700/40'             : 'border-slate-100',
  input:      isDark ? 'text-violet-100 placeholder-violet-600' : '',
  inputFocus: isDark ? 'focus:ring-violet-400'            : 'focus:ring-indigo-300',
  select:     isDark ? 'text-violet-100'                  : '',
  btnAdd:     isDark ? 'bg-violet-600 hover:bg-violet-700 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white',
  btnImport:  isDark ? 'bg-purple-700 hover:bg-purple-800 text-white' : 'bg-violet-600 hover:bg-violet-700 text-white',
  btnSave:    isDark ? 'bg-pink-600 hover:bg-pink-700 text-white'     : 'bg-blue-600 hover:bg-blue-700 text-white',
  btnSaveDis: isDark ? 'bg-violet-900/40 text-violet-700 cursor-not-allowed' : 'bg-slate-100 text-slate-400 cursor-not-allowed',
  filterBtn:  isDark ? 'border-violet-700 bg-[#3d2d52] text-violet-300 hover:text-pink-400 hover:border-pink-600' : 'border-slate-200 bg-white text-slate-400 hover:text-red-500 hover:border-red-200',
  filterInput:isDark ? 'border-violet-600 bg-[#3d2d52] text-violet-100 placeholder-violet-500 focus:ring-violet-400' : 'border-slate-200 bg-white text-slate-700 placeholder-slate-400 focus:ring-slate-300',
  legend:     isDark ? 'text-violet-400'                  : 'text-slate-400',
  legendBox:  isDark ? 'bg-violet-900/50 border-violet-600' : 'bg-slate-200 border-slate-300',
  delBtn:     isDark ? 'text-violet-700 hover:text-pink-400' : 'text-slate-300 hover:text-red-500',
  delBtnDis:  isDark ? 'text-violet-900/40 cursor-not-allowed' : 'text-slate-200 cursor-not-allowed',
  newRing:    isDark ? 'ring-violet-600'                  : 'ring-indigo-200',
  amber:      isDark ? 'text-pink-400'                    : 'text-amber-600',
  amberDot:   isDark ? 'bg-pink-500'                      : 'bg-amber-500',
  spinner:    isDark ? 'border-violet-500'                : 'border-indigo-400',
};
```

## Componentes Actualizados
- ✅ `SalidasBodegaView.tsx` - Paleta completa implementada
- ✅ `PaginationComponent.tsx` - Estilos oscuros agregados
- ✅ `SalidasBodegaImportModal.tsx` - Modal con soporte oscuro
- ✅ `App.tsx` - Header, menú lateral y contenedor principal con soporte oscuro
- ✅ `DottedBackground.tsx` - Fondo punteado con soporte oscuro
- ✅ `ClockDisplay.tsx` - Reloj con soporte oscuro
- ✅ `AdminLayout.tsx` - Dashboard de admin con soporte oscuro

## Próximos Pasos
Aplicar esta paleta a otros módulos:
1. `InventoryView`
2. `ReceptionView`
3. `ReturnReceptionView`
4. `DispatchView`
5. Y otros módulos según sea necesario

## Estructura del App en Modo Oscuro
- **Contenedor principal**: `bg-[#3d2d52]` (fondo completo)
- **Header**: `bg-[#4a3a63]` con `border-violet-700`
- **Menú lateral**: `bg-[#3d2d52]` con `border-r border-violet-700`
- **Separadores del menú**: `border-violet-700`
- **Etiquetas de sección**: `text-violet-500`
- **Botones del header**: `bg-violet-700/40 text-violet-300 hover:bg-violet-700/60`
- **NavItems activos**: Gradiente `from-violet-600 to-purple-500`
- **NavItems inactivos**: `text-violet-400 hover:bg-violet-700/30`
- **Fondo punteado**: `#3d2d52` con puntos violeta `#c4b5fd` al 35% de opacidad, radio 1.2px
- **Reloj (ClockDisplay)**: `text-violet-200`

## Notas Importantes
- Siempre usar `useDarkMode()` para acceder a `isDark`
- Incluir `transition-colors duration-300` en elementos que cambien de color
- Los colores de fondo deben cambiar suavemente
- Los inputs deben tener focus rings claros en modo oscuro
- Los botones deshabilitados deben ser claramente distinguibles
- El NavItem debe usar `useDarkMode()` internamente para aplicar estilos dinámicos
- Los separadores del menú usan `border-violet-700` en modo oscuro


## Actualización de Textos en AdminLayout
- **Títulos principales**: `text-violet-50` (casi blanco, muy claro)
- **Subtítulos**: `text-violet-200` (claro)
- **Etiquetas de sección**: `text-violet-200` (claro)
- **Nombres de items**: `text-violet-50` (casi blanco)
- **Descripciones de items**: `text-violet-200` (claro)


## Comportamiento del Modo Oscuro
- **Por defecto**: La aplicación inicia siempre en modo claro
- **Persistencia**: El estado se guarda en localStorage
- **Al cambiar usuario**: Se resetea automáticamente a modo claro
- **Toggle**: Solo disponible para usuarios con rol SOPORTE
- **Método resetToDark**: Disponible en el contexto para forzar un estado específico
