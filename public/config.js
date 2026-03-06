/**
 * Configuración dinámica del frontend
 * Usa la variable de entorno VITE_API_URL configurada en tiempo de build
 */

window.API_CONFIG = {
  getApiUrl: function() {
    const port = window.location.port;
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Si estamos en un dominio externo (ngrok, producción, etc), usar el mismo host
    if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.match(/^10\.10\./)) {
      return `${protocol}//${hostname}/api`;
    }
    
    if (port === '5173' || port === '3000' || port === '') {
      // Usar localhost con HTTPS para conexiones locales
      return 'https://localhost:3000/api';
    } else if (port === '5174' || port === '3001') {
      // Usar localhost con HTTPS para conexiones locales
      return 'https://localhost:3001/api';
    }
    
    return 'https://localhost:3000/api';
  },

  getBrand: function() {
    const port = window.location.port;
    
    if (port === '5173' || port === '3000' || port === '') {
      return 'plow';
    } else if (port === '5174' || port === '3001') {
      return 'melas';
    } else {
      return 'plow';
    }
  },

  getBrandName: function() {
    const brand = this.getBrand();
    return brand === 'plow' ? 'Plow' : 'Melas';
  }
};

// Log para debugging
console.log(`[Config] Marca detectada: ${window.API_CONFIG.getBrandName()}`);
console.log(`[Config] API URL: ${window.API_CONFIG.getApiUrl()}`);
