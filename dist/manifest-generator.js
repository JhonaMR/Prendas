/**
 * Selector dinámico de manifest.json para PWA
 * El manifest correcto ya fue cargado en index.html (early detection)
 * Este script solo se encarga de forzar actualizaciones del Service Worker
 */

(function() {
  console.log('🔧 Manifest-generator: Verificando manifest...');
  
  // Verificar que BRAND_CONFIG existe
  if (!window.BRAND_CONFIG) {
    console.warn('⚠️ BRAND_CONFIG no disponible');
    return;
  }
  
  const brand = window.BRAND_CONFIG;
  const manifestFile = brand.isMelas ? 'manifest-melas.json' : 'manifest.json';
  
  console.log(`✅ Manifest activo: ${manifestFile} para ${brand.name}`);
  
  // Forzar actualización del Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.update();
        console.log('🔄 Service Worker actualizado');
      });
    }).catch(err => {
      console.warn('⚠️ Error actualizando Service Worker:', err);
    });
  }
})();
