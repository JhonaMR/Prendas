/**
 * Sound Notification Utility
 * Genera un tono simple y discreto cuando llega un mensaje
 */

export const playMessageNotificationSound = () => {
  try {
    // Crear contexto de audio
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Crear oscilador para generar el tono
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Conectar oscilador al gain y al destino
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configurar el tono
    oscillator.frequency.value = 800; // Frecuencia en Hz (tono discreto)
    oscillator.type = 'sine'; // Onda sinusoidal (suave)
    
    // Configurar volumen (bajo para ser discreto)
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    // Reproducir el tono
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3); // Duración: 300ms
  } catch (error) {
    console.error('Error reproduciendo notificación de sonido:', error);
  }
};
