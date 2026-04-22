/**
 * Obtiene la fecha y hora actual en la zona horaria de Bogotá (America/Bogota)
 * Formato: YYYY-MM-DD THH:MM
 * 
 * Usa process.env.TZ para respetar la zona horaria del sistema
 */
const getBogotaDateTime = () => {
  // Guardar la zona horaria actual
  const originalTZ = process.env.TZ;
  
  try {
    // Establecer la zona horaria a Bogotá
    process.env.TZ = 'America/Bogota';
    
    const now = new Date();
    
    // Crear un formatter con la zona horaria de Bogotá
    const formatter = new Intl.DateTimeFormat('es-CO', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const parts = formatter.formatToParts(now);
    const year = parts.find(p => p.type === 'year')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    const hour = parts.find(p => p.type === 'hour')?.value;
    const minute = parts.find(p => p.type === 'minute')?.value;
    
    return `${year}-${month}-${day} T${hour}:${minute}`;
  } finally {
    // Restaurar la zona horaria original
    if (originalTZ) {
      process.env.TZ = originalTZ;
    } else {
      delete process.env.TZ;
    }
  }
};

module.exports = {
  getBogotaDateTime
};
