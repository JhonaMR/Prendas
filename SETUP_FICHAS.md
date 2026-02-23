# 🚀 SETUP - SISTEMA DE FICHAS

## Paso 1: Crear las Tablas en la Base de Datos

### Opción A: Usando pgAdmin (Recomendado)

1. Abre pgAdmin en tu navegador
2. Conecta a tu servidor PostgreSQL
3. Selecciona la base de datos `inventory`
4. Abre la herramienta "Query Tool"
5. Copia y pega el contenido del archivo: `backend/scripts/create-fichas-tables.sql`
6. Haz clic en "Execute" (o presiona F5)
7. Verifica que aparezca el mensaje "Tablas creadas exitosamente"

### Opción B: Usando línea de comandos

```bash
psql -U postgres -d inventory -f Prendas/backend/scripts/create-fichas-tables.sql
```

### Opción C: Usando DBeaver

1. Abre DBeaver
2. Conecta a tu base de datos PostgreSQL
3. Abre el archivo `backend/scripts/create-fichas-tables.sql`
4. Ejecuta el script (Ctrl+Enter)

---

## Paso 2: Verificar que las Tablas se Crearon

Ejecuta esta query en tu BD:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('disenadoras', 'fichas_diseno', 'fichas_costo', 'fichas_cortes', 'maletas', 'maletas_referencias')
ORDER BY table_name;
```

**Esperado:** Deberías ver 6 tablas listadas

---

## Paso 3: Iniciar el Backend

```bash
cd Prendas/backend
npm install  # Si no lo has hecho
npm run dev
```

**Esperado:** El servidor debe iniciar en `http://localhost:3000`

---

## Paso 4: Iniciar el Frontend

En otra terminal:

```bash
cd Prendas
npm install  # Si no lo has hecho
npm run dev
```

**Esperado:** El frontend debe iniciar en `http://localhost:5173`

---

## Paso 5: Acceder a las Fichas

1. Abre `http://localhost:5173` en tu navegador
2. Inicia sesión con un usuario admin o general
3. En el **HomeView** (página de inicio), verás 3 botones nuevos:
   - **Fichas de Diseño** (rosa)
   - **Fichas de Costo** (azul)
   - **Maletas** (púrpura)
4. También aparecen en el **Sidebar** bajo la sección "Sistema de Fichas"

---

## 🎯 Botones Agregados

### En HomeView (Dashboard)
- ✅ Fichas de Diseño (primero en la fila)
- ✅ Fichas de Costo (segundo)
- ✅ Maletas (tercero)

### En Sidebar (Menú lateral)
- ✅ Sistema de Fichas (nueva sección)
  - Fichas de Diseño
  - Fichas de Costo
  - Maletas (solo para admin/general)

---

## 📋 Vistas Disponibles

### Fichas de Diseño
- **Mosaico:** Grid de fichas con búsqueda
- **Detalle:** Editor completo de ficha
- **Componentes:** SubidaFotos, SeccionConceptos

### Fichas de Costo
- **Mosaico:** Grid con importación desde diseño
- **Detalle:** Editor con precios y rentabilidad
- **Cortes:** Gestión de cortes (hasta 4 por ficha)

### Maletas
- **Listado:** CRUD de maletas
- **Asignar:** Asignación de referencias a maletas

---

## ✅ Checklist

- [ ] Tablas creadas en BD
- [ ] Backend iniciado
- [ ] Frontend iniciado
- [ ] Puedo ver los botones en HomeView
- [ ] Puedo ver las opciones en Sidebar
- [ ] Puedo navegar a Fichas de Diseño
- [ ] Puedo navegar a Fichas de Costo
- [ ] Puedo navegar a Maletas

---

## 🐛 Troubleshooting

### Error: "Tabla no existe"
**Solución:** Ejecuta el script SQL nuevamente

### Error: "No autorizado"
**Solución:** Asegúrate de estar logueado como admin o general

### Los botones no aparecen
**Solución:** Recarga la página (F5)

### Error de conexión al backend
**Solución:** Verifica que el backend esté corriendo en puerto 3000

---

## 📞 Notas

- Las vistas están completamente funcionales
- No hay datos de prueba aún (empezarás desde cero)
- Puedes crear diseñadoras, fichas, cortes y maletas
- Los cálculos se hacen automáticamente
- Las fotos se suben al servidor

¡Listo para explorar! 🎉
