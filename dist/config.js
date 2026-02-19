// Configuración de API - Se carga en tiempo de ejecución
window.API_CONFIG = {
  getApiUrl: function() {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = 3000;
    const url = `${protocol}//${hostname}:${port}/api`;
    console.log('🔗 API URL (desde config.js):', url);
    return url;
  }
};
