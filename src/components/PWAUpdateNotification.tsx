import React, { useState } from 'react';
import { usePWAUpdate } from '../hooks/usePWAUpdate';

export const PWAUpdateNotification: React.FC = () => {
  const { updateAvailable, isUpdating, updateApp } = usePWAUpdate();
  const [dismissed, setDismissed] = useState(false);

  if (!updateAvailable || dismissed) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-green-600 text-white rounded-lg shadow-lg p-4 max-w-sm z-50 animate-slide-down">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">Actualización disponible</h3>
          <p className="text-sm text-green-100">
            Una nueva versión de Plow está disponible
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-green-200 hover:text-white flex-shrink-0"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>
      
      <div className="flex gap-2 mt-4">
        <button
          onClick={updateApp}
          disabled={isUpdating}
          className="flex-1 bg-white text-green-600 font-semibold py-2 px-4 rounded hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? 'Actualizando...' : 'Actualizar ahora'}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="flex-1 bg-green-700 text-white font-semibold py-2 px-4 rounded hover:bg-green-800 transition-colors"
        >
          Más tarde
        </button>
      </div>
    </div>
  );
};

export default PWAUpdateNotification;
