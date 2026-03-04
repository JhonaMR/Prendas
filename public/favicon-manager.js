/**
 * Favicon Manager - Cambia el favicon según la marca
 * Se ejecuta después de que BRAND_CONFIG esté disponible
 */

(function() {
  console.log('🎨 Favicon Manager: Iniciando...');
  
  // Esperar a que BRAND_CONFIG esté disponible
  let attempts = 0;
  const maxAttempts = 50;
  
  const waitForBrandConfig = setInterval(() => {
    attempts++;
    
    if (window.BRAND_CONFIG) {
      clearInterval(waitForBrandConfig);
      updateFavicons();
    } else if (attempts >= maxAttempts) {
      clearInterval(waitForBrandConfig);
      console.warn('⚠️ BRAND_CONFIG no disponible, usando favicon por defecto');
    }
  }, 100);

  function updateFavicons() {
    const brand = window.BRAND_CONFIG;
    const isMelas = brand.isMelas;
    
    console.log(`🎨 Actualizando favicons para: ${brand.name}`);
    
    // Actualizar favicon principal (ICO)
    // Intenta favicon-melas.ico para Melas, favicon.ico para Plow
    const faviconFile = isMelas ? 'favicon-melas.ico' : 'favicon.ico';
    updateFaviconLink('icon[type="image/x-icon"]', faviconFile);
    
    // Actualizar favicon PNG 192x192 (usa logos)
    const logo192 = isMelas ? 'logos/melas-192x192.png' : 'logos/plow-192x192.png';
    updateFaviconLink('icon[sizes="192x192"]', logo192);
    
    // Actualizar favicon PNG 512x512 (usa logos)
    const logo512 = isMelas ? 'logos/melas-512x512.png' : 'logos/plow-512x512.png';
    updateFaviconLink('icon[sizes="512x512"]', logo512);
    
    // Actualizar Apple touch icon (usa logo 192x192)
    updateFaviconLink('apple-touch-icon', logo192);
    
    console.log(`✅ Favicons actualizados para ${brand.name}`);
  }

  function updateFaviconLink(selector, href) {
    let link = document.querySelector(`link[rel="icon"][${selector.split('[')[1]}`);
    
    if (!link) {
      // Si no existe, crear el link
      link = document.createElement('link');
      link.rel = 'icon';
      
      // Parsear atributos del selector
      if (selector.includes('type="image/x-icon"')) {
        link.type = 'image/x-icon';
      }
      if (selector.includes('sizes="192x192"')) {
        link.sizes = '192x192';
        link.type = 'image/png';
      }
      if (selector.includes('sizes="512x512"')) {
        link.sizes = '512x512';
        link.type = 'image/png';
      }
      if (selector.includes('apple-touch-icon')) {
        link.rel = 'apple-touch-icon';
      }
      
      document.head.appendChild(link);
    }
    
    // Actualizar href con timestamp para evitar cache
    link.href = `/${href}?t=${Date.now()}`;
  }
})();
