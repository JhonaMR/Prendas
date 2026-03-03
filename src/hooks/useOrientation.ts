import { useEffect, useState } from 'react';

export type Orientation = 'portrait' | 'landscape';

interface OrientationState {
  orientation: Orientation;
  angle: number;
  isPortrait: boolean;
  isLandscape: boolean;
}

/**
 * Hook para detectar y monitorear cambios de orientación del dispositivo
 * Útil para adaptar la UI en PWA instaladas
 */
export const useOrientation = () => {
  const [state, setState] = useState<OrientationState>(() => {
    const isPortrait = window.innerHeight >= window.innerWidth;
    return {
      orientation: isPortrait ? 'portrait' : 'landscape',
      angle: window.orientation || 0,
      isPortrait,
      isLandscape: !isPortrait,
    };
  });

  useEffect(() => {
    const handleOrientationChange = () => {
      const isPortrait = window.innerHeight >= window.innerWidth;
      const angle = window.orientation || 0;

      setState({
        orientation: isPortrait ? 'portrait' : 'landscape',
        angle,
        isPortrait,
        isLandscape: !isPortrait,
      });

      // Disparar evento personalizado para que otros componentes se enteren
      window.dispatchEvent(
        new CustomEvent('orientationchange', {
          detail: {
            orientation: isPortrait ? 'portrait' : 'landscape',
            angle,
          },
        })
      );
    };

    // Escuchar cambios de orientación
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  return state;
};

/**
 * Hook para bloquear la orientación en un valor específico
 * Nota: Solo funciona en PWA instaladas, no en navegador
 */
export const useLockOrientation = (orientation: 'portrait' | 'landscape' | 'any' = 'any') => {
  useEffect(() => {
    const lockOrientation = async () => {
      try {
        const screenOrientation = screen.orientation as any;
        if (screenOrientation && screenOrientation.lock) {
          await screenOrientation.lock(orientation);
        }
      } catch (error) {
        console.warn('No se pudo bloquear la orientación:', error);
      }
    };

    lockOrientation();

    return () => {
      // Desbloquear orientación al desmontar
      try {
        const screenOrientation = screen.orientation as any;
        if (screenOrientation && screenOrientation.unlock) {
          screenOrientation.unlock();
        }
      } catch (error) {
        console.warn('No se pudo desbloquear la orientación:', error);
      }
    };
  }, [orientation]);
};

/**
 * Hook para obtener información sobre el viewport
 */
export const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setViewport({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
};
