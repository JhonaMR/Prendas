# Documentación del Sistema Plow

Bienvenido a la documentación completa del sistema de gestión de inventarios, ventas y producción **Plow**.

---

## 📖 Contenido

Esta carpeta contiene la documentación completa del sistema, organizada en los siguientes archivos:

### 📋 Documentos Principales

1. **[INDICE.md](./INDICE.md)** ⭐ **COMIENZA AQUÍ**
   - Índice completo de toda la documentación
   - Mapa de módulos
   - Guía de inicio rápido
   - Relaciones entre módulos

2. **[ACCESO_RED_LOCAL.md](./ACCESO_RED_LOCAL.md)**
   - Cómo acceder desde otro PC en la red
   - Cómo migrar el proyecto a otro servidor
   - Solución de problemas de conectividad

3. **[ARQUITECTURA_SISTEMA.md](./ARQUITECTURA_SISTEMA.md)**
   - Visión general del sistema
   - Stack tecnológico
   - Estructura de carpetas
   - Patrones de diseño
   - Seguridad y escalabilidad

### 🔐 Módulo de Autenticación

4. **[MODULO_AUTENTICACION.md](./MODULO_AUTENTICACION.md)**
   - Sistema de login y registro
   - Gestión de usuarios y roles
   - Tokens JWT
   - Seguridad

### 👥 Módulos de Gestión de Entidades

5. **[MODULO_CLIENTES.md](./MODULO_CLIENTES.md)**
   - Gestión de clientes
   - CRUD completo
   - Asociación con vendedores

6. **[MODULO_VENDEDORES.md](./MODULO_VENDEDORES.md)**
   - Gestión de vendedores
   - Métricas de desempeño
   - Comisiones

7. **[MODULO_CONFECCIONISTAS.md](./MODULO_CONFECCIONISTAS.md)**
   - Gestión de confeccionistas
   - Asignación de órdenes
   - Seguimiento de producción

8. **[MODULO_REFERENCIAS.md](./MODULO_REFERENCIAS.md)**
   - Catálogo de productos
   - Especificaciones técnicas
   - Precios y costos

### 📦 Módulos de Operaciones

9. **[MODULO_PEDIDOS.md](./MODULO_PEDIDOS.md)**
   - Creación y gestión de pedidos
   - Detalles de líneas
   - Estados y seguimiento

10. **[MODULO_PRODUCCION.md](./MODULO_PRODUCCION.md)**
    - Seguimiento de producción
    - Asignación a confeccionistas
    - Reportes de avance

11. **[MODULO_RECEPCIONES.md](./MODULO_RECEPCIONES.md)**
    - Recepción de materiales
    - Devoluciones
    - Gestión de inventario

12. **[MODULO_DESPACHOS.md](./MODULO_DESPACHOS.md)**
    - Gestión de despachos
    - Asignación a correrias
    - Seguimiento de entregas

13. **[MODULO_CORRERIAS.md](./MODULO_CORRERIAS.md)**
    - Gestión de rutas de entrega
    - Optimización de rutas
    - Asignación de despachos

14. **[MODULO_FECHAS_ENTREGA.md](./MODULO_FECHAS_ENTREGA.md)**
    - Calendario de entregas
    - Planificación
    - Alertas de vencimiento

### 💾 Módulo de Backups

15. **[MODULO_BACKUPS.md](./MODULO_BACKUPS.md)**
    - Backups automáticos y manuales
    - Restauración de datos
    - Recuperación de desastres

---

## 🚀 Cómo Usar Esta Documentación

### Si eres Desarrollador

1. Comienza con [ARQUITECTURA_SISTEMA.md](./ARQUITECTURA_SISTEMA.md)
2. Lee [MODULO_AUTENTICACION.md](./MODULO_AUTENTICACION.md) para entender la seguridad
3. Consulta los módulos específicos que necesites modificar
4. Usa [INDICE.md](./INDICE.md) como referencia rápida

### Si eres Administrador

1. Lee [ACCESO_RED_LOCAL.md](./ACCESO_RED_LOCAL.md) para configurar acceso
2. Lee [MODULO_BACKUPS.md](./MODULO_BACKUPS.md) para gestionar backups
3. Consulta los módulos de operaciones para entender los procesos

### Si eres Usuario

1. Lee [ACCESO_RED_LOCAL.md](./ACCESO_RED_LOCAL.md) para acceder a la aplicación
2. Consulta los módulos específicos de tu rol
3. Usa [INDICE.md](./INDICE.md) para encontrar información rápidamente

---

## 📊 Estructura del Sistema

El sistema está organizado en **15 módulos** que trabajan juntos:

```
AUTENTICACIÓN
    ↓
GESTIÓN DE ENTIDADES (Clientes, Vendedores, Confeccionistas, Referencias)
    ↓
OPERACIONES (Pedidos, Producción, Recepciones, Despachos, Correrias, Fechas)
    ↓
BACKUPS (Respaldo y recuperación)
```

---

## 🔍 Búsqueda Rápida

### Por Rol

- **Vendedor:** [MODULO_CLIENTES.md](./MODULO_CLIENTES.md), [MODULO_PEDIDOS.md](./MODULO_PEDIDOS.md)
- **Confeccionista:** [MODULO_PRODUCCION.md](./MODULO_PRODUCCION.md)
- **Administrador:** [MODULO_BACKUPS.md](./MODULO_BACKUPS.md), [ACCESO_RED_LOCAL.md](./ACCESO_RED_LOCAL.md)
- **Desarrollador:** [ARQUITECTURA_SISTEMA.md](./ARQUITECTURA_SISTEMA.md)

### Por Tarea

- **Crear cliente:** [MODULO_CLIENTES.md](./MODULO_CLIENTES.md)
- **Crear pedido:** [MODULO_PEDIDOS.md](./MODULO_PEDIDOS.md)
- **Seguir producción:** [MODULO_PRODUCCION.md](./MODULO_PRODUCCION.md)
- **Hacer backup:** [MODULO_BACKUPS.md](./MODULO_BACKUPS.md)
- **Acceder desde otro PC:** [ACCESO_RED_LOCAL.md](./ACCESO_RED_LOCAL.md)

---

## 📚 Cada Módulo Incluye

Cada documento de módulo contiene:

- ✅ Descripción del módulo
- ✅ Características principales
- ✅ Estructura de datos
- ✅ Endpoints API
- ✅ Validación de datos
- ✅ Ejemplos de uso
- ✅ Relaciones con otros módulos
- ✅ Reportes disponibles
- ✅ Troubleshooting
- ✅ Próximos pasos

---

## 🔐 Seguridad

El sistema implementa múltiples capas de seguridad:

- **Autenticación:** JWT tokens con expiración de 24 horas
- **Encriptación:** HTTPS/SSL para todas las comunicaciones
- **Autorización:** Roles y permisos específicos
- **Validación:** Validación en frontend y backend
- **Backups:** Copias de seguridad automáticas diarias

Ver [MODULO_AUTENTICACION.md](./MODULO_AUTENTICACION.md) para más detalles.

---

## 🌐 Acceso a la Aplicación

### Desde el mismo PC

```
http://localhost:5173
```

### Desde otro PC en la red

```
https://10.10.0.34:5173
```

Ver [ACCESO_RED_LOCAL.md](./ACCESO_RED_LOCAL.md) para instrucciones detalladas.

---

## 💾 Backups

- **Automáticos:** Diariamente a las 7 AM
- **Manuales:** Bajo demanda desde la interfaz
- **Retención:** Últimos 30 días
- **Restauración:** Disponible desde la interfaz

Ver [MODULO_BACKUPS.md](./MODULO_BACKUPS.md) para más detalles.

---

## 🆘 Soporte

### Problemas Comunes

- **No puedo acceder:** Ver [ACCESO_RED_LOCAL.md](./ACCESO_RED_LOCAL.md)
- **Error de login:** Ver [MODULO_AUTENTICACION.md](./MODULO_AUTENTICACION.md)
- **Datos perdidos:** Ver [MODULO_BACKUPS.md](./MODULO_BACKUPS.md)

### Troubleshooting

Cada módulo incluye una sección de troubleshooting con soluciones a problemas comunes.

---

## 📞 Contacto

Para preguntas o sugerencias sobre la documentación, contacta al equipo de desarrollo.

---

## 📝 Versión

- **Versión del Sistema:** 1.0.0
- **Versión de la Documentación:** 1.0.0
- **Última Actualización:** Febrero 2026

---

## 🎯 Próximos Pasos

1. Lee [INDICE.md](./INDICE.md) para una visión general
2. Consulta el módulo específico que necesites
3. Usa los ejemplos de código como referencia
4. Contacta al equipo si tienes preguntas

---

**¡Bienvenido a Plow! Esperamos que esta documentación te sea útil.**
