# 🗄️ CREAR TABLAS EN BASE DE DATOS

**IMPORTANTE:** Este es el último paso antes de poder usar el sistema.

---

## 📋 OPCIÓN 1: Línea de Comandos (Recomendado)

### En PowerShell o CMD:

```bash
psql -U postgres -d inventory -f Prendas/backend/scripts/create-fichas-tables.sql
```

**Esperado:**
```
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE INDEX
 resultado
─────────────────────────────────
 Tablas creadas exitosamente
(1 row)
```

---

## 📋 OPCIÓN 2: pgAdmin (Interfaz Gráfica)

### Pasos:

1. **Abre pgAdmin** en tu navegador
   - URL: http://localhost:5050 (o donde esté instalado)

2. **Conecta a PostgreSQL**
   - Servidor: localhost
   - Puerto: 5433
   - Usuario: postgres
   - Contraseña: Contrasena14.

3. **Selecciona la base de datos `inventory`**
   - En el árbol de la izquierda: Servers → PostgreSQL → Databases → inventory

4. **Abre Query Tool**
   - Haz clic derecho en `inventory`
   - Selecciona "Query Tool"

5. **Copia el script SQL**
   - Abre el archivo: `Prendas/backend/scripts/create-fichas-tables.sql`
   - Copia TODO el contenido

6. **Pega en Query Tool**
   - Pega el contenido en la ventana de Query Tool

7. **Ejecuta**
   - Presiona F5 o haz clic en el botón "Execute"

8. **Verifica**
   - Deberías ver: "Tablas creadas exitosamente"

---

## 📋 OPCIÓN 3: DBeaver

### Pasos:

1. **Abre DBeaver**

2. **Conecta a PostgreSQL**
   - Host: localhost
   - Port: 5433
   - Database: inventory
   - User: postgres
   - Password: Contrasena14.

3. **Abre el archivo SQL**
   - File → Open File
   - Selecciona: `Prendas/backend/scripts/create-fichas-tables.sql`

4. **Ejecuta**
   - Presiona Ctrl+Enter o haz clic en "Execute"

5. **Verifica**
   - Deberías ver: "Tablas creadas exitosamente"

---

## 📋 OPCIÓN 4: SQL Server Management Studio (SSMS)

### Pasos:

1. **Abre SSMS**

2. **Conecta a PostgreSQL**
   - Server: localhost,5433
   - Authentication: SQL Server Authentication
   - Login: postgres
   - Password: Contrasena14.

3. **Abre el archivo SQL**
   - File → Open → File
   - Selecciona: `Prendas/backend/scripts/create-fichas-tables.sql`

4. **Ejecuta**
   - Presiona F5

5. **Verifica**
   - Deberías ver: "Tablas creadas exitosamente"

---

## ✅ VERIFICACIÓN

Después de ejecutar el script, verifica que las tablas existan:

### En pgAdmin:
1. Expande: Servers → PostgreSQL → Databases → inventory → Schemas → public → Tables
2. Deberías ver:
   - disenadoras
   - fichas_diseno
   - fichas_costo
   - fichas_cortes
   - maletas
   - maletas_referencias

### En línea de comandos:
```bash
psql -U postgres -d inventory -c "\dt"
```

**Esperado:**
```
              List of relations
 Schema |        Name         | Type  | Owner
────────┼─────────────────────┼───────┼────────
 public | disenadoras         | table | postgres
 public | fichas_costo        | table | postgres
 public | fichas_cortes       | table | postgres
 public | fichas_diseno       | table | postgres
 public | maletas             | table | postgres
 public | maletas_referencias | table | postgres
(6 rows)
```

---

## 🎯 CONTENIDO DEL SCRIPT

El script crea 6 tablas:

### 1. disenadoras
- Información de diseñadoras
- Campos: id, nombre, cedula, telefono, activa, timestamps

### 2. fichas_diseno
- Fichas de diseño de prendas
- Campos: referencia, descripción, fotos, conceptos (JSONB), costos, timestamps

### 3. fichas_costo
- Fichas de costo y precios
- Campos: referencia, descripción, precios, rentabilidad, descuentos, timestamps

### 4. fichas_cortes
- Cortes de fichas de costo (hasta 4 por ficha)
- Campos: numero_corte, cantidad_cortada, costos, rentabilidad, timestamps

### 5. maletas
- Maletas para agrupar referencias
- Campos: id, nombre, correria_id, timestamps

### 6. maletas_referencias
- Referencias asignadas a maletas
- Campos: maleta_id, referencia, orden, timestamps

---

## 🔗 RELACIONES

```
disenadoras (1) ──→ (N) fichas_diseno
fichas_diseno (1) ──→ (N) fichas_costo
fichas_costo (1) ──→ (N) fichas_cortes
maletas (1) ──→ (N) maletas_referencias
```

---

## 🚀 PRÓXIMO PASO

Una vez creadas las tablas:

1. Abre http://localhost:5173
2. Inicia sesión
3. Haz clic en "Fichas de Diseño"
4. ¡Comienza a usar el sistema!

---

## 📞 SOPORTE

Si encuentras errores:

1. **Error: "psql: command not found"**
   - PostgreSQL no está en el PATH
   - Solución: Usa pgAdmin o DBeaver

2. **Error: "FATAL: Ident authentication failed"**
   - Problema de autenticación
   - Solución: Verifica usuario/contraseña

3. **Error: "Database 'inventory' does not exist"**
   - La BD no existe
   - Solución: Crea la BD primero en pgAdmin

4. **Error: "relation already exists"**
   - Las tablas ya existen
   - Solución: Ejecuta el script de todas formas (usa IF NOT EXISTS)

---

## ✨ ¡LISTO!

Después de ejecutar el script, el sistema estará completamente funcional.

¡Adelante! 🎉

