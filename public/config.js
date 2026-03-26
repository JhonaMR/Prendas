/**
 * Configuración dinámica del frontend
 * Usa la variable de entorno VITE_API_URL configurada en tiempo de build
 */

window.API_CONFIG = {
  getApiUrl: function() {
    const port = window.location.port;
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Si estamos accediendo por el nombre del equipo o IP de red, usar ese mismo hostname
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      // Determinar el puerto del backend según el puerto del frontend
      let backendPort = '3000';
      if (port === '5174' || port === '3001') {
        backendPort = '3001';
      }
      return `${protocol}//${hostname}:${backendPort}/api`;
    }
    
    // Para localhost, usar los puertos correspondientes
    if (port === '5173' || port === '3000' || port === '') {
      return 'https://localhost:3000/api';
    } else if (port === '5174' || port === '3001') {
      return 'https://localhost:3001/api';
    } else if (port === '5175' || port === '5000') {
      // Desarrollo local (branch develop)
      return 'http://localhost:5000/api';
    }
    
    return 'https://localhost:3000/api';
  },

  getBrand: function() {
    const port = window.location.port;
    
    if (port === '5173' || port === '3000' || port === '') {
      return 'plow';
    } else if (port === '5174' || port === '3001') {
      return 'melas';
    } else if (port === '5175' || port === '5000') {
      return 'plow';
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
