// Configuración de API - Se carga en tiempo de ejecución
window.API_CONFIG = {
  getApiUrl: function() {
    const hostname = window.location.hostname;
    const port = 3000;
    // Backend usa HTTP en desarrollo
    const url = `http://${hostname}:${port}/api`;
    console.log('🔗 API URL (desde config.js):', url);
    return url;
  }
};
