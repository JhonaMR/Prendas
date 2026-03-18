# Sistema de Cierre Automático de Sesiones

## Descripción General

El sistema cierra automáticamente todas las sesiones activas a las 8:00 PM (20:00) todos los días. Esto aplica tanto a Plow como a Melas.

## Cómo Funciona

### Backend

1. **Job Programado** (`sessionCloseJob.js`):
   - Se ejecuta a las 20:00 (8:00 PM) todos los días
   - Usa cron: `"0 20 * * *"`
   - Emite un evento Socket.io a todos los clientes conectados

2. **Evento Socket.io**:
   - Evento: `SESSION_CLOSE_NOTIFICATION`
   - Desconecta todos los clientes después de 2 segundos
   - Registra la acción en los logs

3. **Ruta Manual** (para testing):
   - `POST /api/sessions/close-all` (solo admin)
   - Cierra sesiones manualmente sin esperar a las 8:00 PM

### Frontend

1. **Hook `useSessionClose`**:
   - Escucha el evento `SESSION_CLOSE_NOTIFICATION`
   - Muestra una alerta al usuario
   - Limpia el localStorage (token, usuario)
   - Redirige a la página de login
   - Recarga la página

2. **Integración**:
   - Se usa en `App.tsx`
   - Se ejecuta automáticamente cuando el usuario está logueado
   - Funciona en ambas instancias (Plow y Melas)

## Flujo de Cierre

```
20:00 (8:00 PM)
    ↓
Job se ejecuta en el backend
    ↓
Emite evento SESSION_CLOSE_NOTIFICATION a todos los clientes
    ↓
Frontend recibe el evento
    ↓
Muestra alerta: "Tu sesión ha sido cerrada automáticamente"
    ↓
Limpia localStorage
    ↓
Redirige a /login
    ↓
Recarga la página
```

## Archivos Involucrados

### Backend
- `src/jobs/sessionCloseJob.js` - Job de cierre de sesiones
- `src/routes/sessionRoutes.js` - Rutas de sesiones
- `src/server.js` - Inicializa el job

### Frontend
- `src/hooks/useSessionClose.ts` - Hook para escuchar cierre
- `src/App.tsx` - Usa el hook
- `src/services/socketService.ts` - Comunicación Socket.io

## Testing

### Cerrar Sesiones Manualmente

```bash
curl -X POST http://localhost:3000/api/sessions/close-all \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Verificar en Logs

```bash
# Plow
pm2 logs plow-backend

# Melas
pm2 logs melas-backend
```

Busca mensajes como:
```
🔐 Iniciando cierre de todas las sesiones...
✅ Notificación de cierre de sesión enviada a todos los clientes
✅ Todas las conexiones han sido desconectadas
```

## Configuración

### Cambiar la Hora de Cierre

Edita `src/jobs/sessionCloseJob.js`:

```javascript
// Cambiar de "0 20 * * *" (8:00 PM) a otra hora
// Ejemplos:
// "0 18 * * *" = 6:00 PM
// "0 22 * * *" = 10:00 PM
// "30 17 * * *" = 5:30 PM

const job = cron.schedule('0 20 * * *', () => {
  closeAllSessions();
});
```

### Deshabilitar el Sistema

Comenta la línea en `src/server.js`:

```javascript
// startSessionCloseJob(); // Comentar para deshabilitar
```

## Notas Importantes

1. **Ambas Instancias**: El cierre se aplica a Plow y Melas simultáneamente
2. **Zona Horaria**: Usa la zona horaria del servidor
3. **Socket.io**: Requiere que Socket.io esté conectado
4. **Logs**: Se registra en `logs/plow-out.log` y `logs/melas-out.log`
5. **Reconexión**: Los usuarios pueden volver a iniciar sesión inmediatamente

## Troubleshooting

### Las sesiones no se cierran a las 8:00 PM

1. Verifica que el job esté iniciado:
   ```bash
   pm2 logs plow-backend | grep "Job de cierre"
   ```

2. Verifica la zona horaria del servidor:
   ```bash
   date
   ```

3. Verifica que Socket.io esté funcionando:
   - Abre la consola del navegador
   - Busca mensajes de conexión Socket.io

### El usuario no ve la alerta

1. Verifica que Socket.io esté conectado
2. Verifica que el hook `useSessionClose` esté en App.tsx
3. Revisa la consola del navegador para errores

### Error: "Socket.io no está disponible"

- Asegúrate de que el servidor esté corriendo
- Verifica que Socket.io esté inicializado en `src/config/socketio.js`
- Recarga la página

## Eventos Socket.io

### SESSION_CLOSE_NOTIFICATION

```javascript
{
  type: 'SESSION_CLOSE',
  message: 'Tu sesión ha sido cerrada automáticamente por cierre de jornada.',
  timestamp: '2026-03-04T20:00:00.000Z',
  reason: 'DAILY_CLOSE_TIME'
}
```

## Logs Esperados

```
✅ Job de cierre de sesiones iniciado (8:00 PM diariamente)
🔐 [20:00:00] Iniciando cierre de todas las sesiones...
✅ [20:00:00] Notificación de cierre de sesión enviada a todos los clientes
✅ [20:00:02] Todas las conexiones han sido desconectadas
```
