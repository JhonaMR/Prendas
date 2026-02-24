import React from 'react';

export const DottedBackground: React.FC = () => {
  // Generar patrón SVG de puntitos muy suaves y tenues, bastantes más
  // El xmlns es solo una declaración de esquema, no una referencia externa real
  const dotPattern = `<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="#9ca3af" opacity="0.3"/></pattern></defs><rect width="100%" height="100%" fill="white"/><rect width="100%" height="100%" fill="url(#dots)"/></svg>`;

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
