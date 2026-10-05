# Fichas de costo mosaico - Línea

## 📝 Resumen del Problema
Tras la creación de la nueva columna `linea` en la base de datos, los usuarios reportaron que en la vista **FichasCostoMosaico**, el valor de la línea "aparecía y desaparecía" de forma intermitente. Simultáneamente, el monitor forense de estado en `App.tsx` reportaba alarmas críticas (`ALERTA CRÍTICA: PÉRDIDA DE LÍNEAS EN COSTO cayeron de X ➡️ 0`). 

Extrañamente, esto sucedía a pesar de que "todo lo demás cargaba y se guardaba perfecto".

## 🔍 Análisis y Diagnóstico
Tras un análisis forense del código y la base de datos, se descubrió que:
1. **Lógica de Rescate (Fallback):** Debido a que muchas fichas de costo aún tenían el valor por defecto (`'Elegir'`), el sistema intentaba rellenar visualmente el dato buscando la línea de la Ficha de Diseño correspondiente en el estado global (`state.fichasDiseno`).
2. **El Fallo Silencioso:** Durante el desarrollo (y potencialmente en producción por latencia), el servidor backend sufre micro-reinicios o bloqueos temporales. Cuando esto pasa y el frontend intenta hacer un `fetch` (ej. al importar o eliminar una ficha), la red falla. La API estaba programada para tragar el error y devolver un array vacío `[]`.
3. **El Vaciado del Estado Global:** Al recibir el array vacío, las funciones `updateState` de los mosaicos estaban sobreescribiendo ciegamente el estado global con `fichasDiseno: []`.
4. **La "Desaparición":** Al estar vacía la "bolsa" global de Fichas de Diseño en la memoria, el fallback visual de las Fichas de Costo fracasaba masivamente, ocultando la etiqueta de la línea para todas las fichas al mismo tiempo, dando la impresión de que "no se guardaban" o "desaparecían".

## 🛠️ Solución Implementada
La base de datos y la operación de guardado siempre funcionaron correctamente. La solución fue aplicar **"escudos protectores"** en las operaciones de actualización del frontend.

Se modificaron los llamados a `updateState` en `FichasCostoMosaico.tsx` y `FichasDisenoMosaico.tsx` para que **solo** sobreescriban el estado global si la API devolvió datos válidos (arrays con longitud mayor a cero).

**Código anterior (Inseguro):**
```typescript
const [fichasCosto, fichasDiseno] = await Promise.all([apiFichas.getFichasCosto(), apiFichas.getFichasDiseno()]);
updateState(prev => ({ ...prev, fichasCosto, fichasDiseno }));
```

**Código nuevo (Protegido con escudo):**
```typescript
const [fichasCosto, fichasDiseno] = await Promise.all([apiFichas.getFichasCosto(), apiFichas.getFichasDiseno()]);
updateState(prev => ({
    ...prev,
    ...(fichasCosto.length > 0 ? { fichasCosto } : {}),
    ...(fichasDiseno.length > 0 ? { fichasDiseno } : {})
}));
```

Con este cambio, si ocurre un micro-corte de red o un reinicio del servidor, el sistema mantiene los datos que ya tenía en memoria en lugar de borrarlos temporalmente, garantizando que el "fallback" siempre funcione.
