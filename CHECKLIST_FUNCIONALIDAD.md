# ✅ CHECKLIST - PARA QUE FUNCIONE TODO

## 🎯 ESTADO ACTUAL

**Código:** ✅ Compilable sin errores  
**Botones:** ✅ Agregados en HomeView y Sidebar  
**Carga de datos:** ✅ Configurada en App.tsx  
**Vistas:** ✅ Importadas y conectadas  

---

## 📋 LO QUE FALTA (SOLO 3 COSAS)

### 1️⃣ CREAR TABLAS EN BASE DE DATOS (CRÍTICO)

**Archivo:** `Prendas/backend/scripts/create-fichas-tables.sql`

**Opción A: pgAdmin (Recomendado)**
1. Abre pgAdmin en tu navegador
2. Conecta a PostgreSQL
3. Selecciona base de datos `inventory`
4. Abre "Query Tool"
5. Copia todo el contenido de `create-fichas-tables.sql`
6. Pega en Query Tool
7. Presiona F5 o haz clic en "Execute"
8. Verifica que aparezca: "Tablas creadas exitosamente"

**Opción B: Línea de comandos**
```bash
psql -U postgres -d inventory -f Prendas/backend/scripts/create-fichas-tables.sql
```

**Opción C: DBeaver**
1. Abre DBeaver
2. Conecta a PostgreSQL
3. Abre archivo `create-fichas-tables.sql`
4. Presiona Ctrl+Enter

**Verificación:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('disenadoras', 'fichas_diseno', 'fichas_costo', 'fichas_cortes', 'maletas', 'maletas_referencias')
ORDER BY table_name;
```

Deberías ver 6 tablas.

---

### 2️⃣ INSTALAR DEPENDENCIAS DEL BACKEND

```bash
cd Prendas/backend
npm install
```

**Tiempo:** ~2-3 minutos

---

### 3️⃣ INICIAR BACKEND Y FRONTEND

**Terminal 1 - Backend:**
```bash
cd Prendas/backend
npm run dev
```

**Esperado:** 
```
✅ Base de datos inicializada correctamente
🚀 Servidor corriendo en http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd Prendas
npm run dev
```

**Esperado:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

---

## 🎬 VERIFICACIÓN VISUAL

Una vez que todo esté corriendo:

1. Abre `http://localhost:5173` en tu navegador
2. Inicia sesión con un usuario admin o general
3. Deberías ver en **HomeView** (página de inicio):
   - ✅ Botón "Fichas de Diseño" (rosa)
   - ✅ Botón "Fichas de Costo" (azul)
   - ✅ Botón "Maletas" (púrpura)

4. En el **Sidebar** (menú lateral):
   - ✅ Nueva sección "Sistema de Fichas"
   - ✅ Opciones de Fichas de Diseño, Costo y Maletas

5. Haz clic en cualquier botón para entrar a la vista

---

## 🐛 TROUBLESHOOTING

### Error: "Tabla no existe"
**Causa:** No ejecutaste el script SQL  
**Solución:** Ejecuta el script SQL en pgAdmin/DBeaver/CLI

### Error: "Cannot find module 'pg'"
**Causa:** No instalaste dependencias  
**Solución:** Ejecuta `npm install` en `Prendas/backend`

### Error: "Connection refused"
**Causa:** Backend no está corriendo  
**Solución:** Inicia backend con `npm run dev`

### Los botones no aparecen
**Causa:** Frontend no recargó  
**Solución:** Presiona F5 en el navegador

### Error: "No autorizado"
**Causa:** Token expirado  
**Solución:** Cierra sesión y vuelve a iniciar

---

## 📊 RESUMEN DE CAMBIOS

### Archivos Modificados
- ✅ `src/App.tsx` - Imports, estado, carga de datos, renderizado
- ✅ `src/components/HomeView/AdminLayout.tsx` - Botones de fichas

### Archivos Creados
- ✅ `backend/scripts/create-fichas-tables.sql` - Script de BD
- ✅ `SETUP_FICHAS.md` - Documentación
- ✅ `CAMBIOS_REALIZADOS.md` - Resumen de cambios
- ✅ `CHECKLIST_FUNCIONALIDAD.md` - Este archivo

### Vistas Existentes (Sin cambios)
- ✅ `src/views/FichasDisenoMosaico.tsx`
- ✅ `src/views/FichasDisenoDetalle.tsx`
- ✅ `src/views/FichasCostoMosaico.tsx`
- ✅ `src/views/FichasCostoDetalle.tsx`
- ✅ `src/views/FichasCorteDetalle.tsx`
- ✅ `src/views/MaletasListado.tsx`
- ✅ `src/views/MaletasAsignar.tsx`

---

## ✨ FUNCIONALIDADES DISPONIBLES

Una vez que todo esté corriendo, podrás:

### Fichas de Diseño
- ✅ Ver listado de fichas
- ✅ Crear nueva ficha
- ✅ Editar ficha
- ✅ Subir fotos
- ✅ Agregar conceptos (materia prima, mano de obra, etc.)
- ✅ Ver costo total calculado

### Fichas de Costo
- ✅ Importar desde fichas de diseño
- ✅ Editar precios y rentabilidad
- ✅ Ver descuentos simulados
- ✅ Crear cortes (hasta 4 por ficha)
- ✅ Analizar utilidad/pérdida

### Maletas
- ✅ Crear maletas
- ✅ Asignar referencias
- ✅ Editar maletas
- ✅ Eliminar maletas

---

## 🚀 PRÓXIMO PASO

**Ejecuta el script SQL en tu base de datos PostgreSQL**

Luego inicia backend y frontend para ver todo en acción.

¡Listo! 🎉
