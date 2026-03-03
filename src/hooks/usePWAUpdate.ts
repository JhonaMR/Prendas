import { useEffect, useState } from 'react';

interface PWAUpdateState {
  updateAvailable: boolean;
  isUpdating: boolean;
  error: Error | null;
}

export const usePWAUpdate = () => {
  const [state, setState] = useState<PWAUpdateState>({
    updateAvailable: false,
    isUpdating: false,
    error: null,
  });

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    let registration: ServiceWorkerRegistration | null = null;

    const handleServiceWorkerUpdate = () => {
      setState(prev => ({
        ...prev,
        updateAvailable: true,
      }));
    };

    const handleControllerChange = () => {
      console.log('✅ Nueva versión de Plow instalada');
      window.location.reload();
    };

    const registerServiceWorker = async () => {
      try {
        registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        // Escuchar actualizaciones
        registration.addEventListener('updatefound', () => {
          const newWorker = registration!.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              handleServiceWorkerUpdate();
            }
          });
        });

        // Escuchar cambios de controlador
        navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

        // Verificar actualizaciones cada hora
        setInterval(() => {
          registration?.update();
        }, 60 * 60 * 1000);
      } catch (error) {
        console.error('Error registrando Service Worker:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error : new Error('Error desconocido'),
        }));
      }
    };

    registerServiceWorker();

    return () => {
      if (registration) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      }
    };
  }, []);

  const updateApp = async () => {
    setState(prev => ({ ...prev, isUpdating: true }));
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        // El controllerchange event se encargará de recargar
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Error actualizando'),
        isUpdating: false,
      }));
    }
  };

  return {
    ...state,
    updateApp,
  };
};
