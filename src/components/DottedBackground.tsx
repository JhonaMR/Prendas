import React from 'react';
import { useDarkMode } from '../context/DarkModeContext';

export const DottedBackground: React.FC = () => {
  const { isDark } = useDarkMode();

  // Generar patrón SVG de puntitos
  // En modo oscuro: puntos más claros y visibles pero sutiles
  // En modo claro: puntos grises muy tenues
  const dotPattern = isDark
    ? `<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1.2" fill="#c4b5fd" opacity="0.35"/></pattern></defs><rect width="100%" height="100%" fill="#3d2d52"/><rect width="100%" height="100%" fill="url(#dots)"/></svg>`
    : `<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="#9ca3af" opacity="0.3"/></pattern></defs><rect width="100%" height="100%" fill="white"/><rect width="100%" height="100%" fill="url(#dots)"/></svg>`;

  const svgDataUrl = `data:image/svg+xml;base64,${btoa(dotPattern)}`;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url('${svgDataUrl}')`,
        backgroundRepeat: 'repeat',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
};
