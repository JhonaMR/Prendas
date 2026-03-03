import React from 'react';
import { useOrientation, useViewport } from '../hooks/useOrientation';

/**
 * Componente para debuggear la orientación y viewport
 * Útil durante desarrollo para verificar que todo funciona correctamente
 * Remover en producción o envolver en una variable de entorno
 */
export const OrientationDebugger: React.FC = () => {
  const orientation = useOrientation();
  const viewport = useViewport();

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: '#fff',
        padding: '10px 15px',
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 9999,
        maxWidth: '200px',
        lineHeight: '1.4',
      }}
    >
      <div>
        <strong>Orientación:</strong> {orientation.orientation}
      </div>
      <div>
        <strong>Ángulo:</strong> {orientation.angle}°
      </div>
      <div>
        <strong>Viewport:</strong> {viewport.width}x{viewport.height}
      </div>
      <div>
        <strong>Tipo:</strong>{' '}
        {viewport.isMobile ? 'Móvil' : viewport.isTablet ? 'Tablet' : 'Desktop'}
      </div>
    </div>
  );
};

export default OrientationDebugger;
