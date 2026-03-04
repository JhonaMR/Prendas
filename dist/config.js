/**
 * Configuración dinámica del frontend
 * Detecta automáticamente cuál marca es según el puerto
 */

window.API_CONFIG = {
  getApiUrl: function() {
    const port = window.location.port;
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    
    // Detectar marca según puerto del frontend o backend
    if (port === '5173' || port === '3000' || port === '') {
      // PLOW - Puerto 5173 (frontend) o 3000 (backend directo)
      if (hostname === '10.10.0.34' || hostname.includes('10.10.0.34')) {
        return 'https://10.10.0.34:3000/api';
      }
      return 'http://localhost:3000/api';
    } else if (port === '5174' || port === '3001') {
      // MELAS - Puerto 5174 (frontend) o 3001 (backend directo)
      if (hostname === '10.10.0.34' || hostname.includes('10.10.0.34')) {
        return 'https://10.10.0.34:3001/api';
      }
      return 'http://localhost:3001/api';
    } else {
      // Fallback: intentar puerto 3000
      if (hostname === '10.10.0.34' || hostname.includes('10.10.0.34')) {
        return 'https://10.10.0.34:3000/api';
      }
      return 'http://localhost:3000/api';
    }
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
