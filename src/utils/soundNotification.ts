/**
 * Sound Notification Utility
 * Genera un tono simple y discreto cuando llega un mensaje
 */

let audioContextSingleton: AudioContext | null = null;

export const playMessageNotificationSound = async () => {
  try {
    // Crear o recuperar el contexto de audio
    if (!audioContextSingleton) {
      audioContextSingleton = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const audioContext = audioContextSingleton;

    // Asegurar que el contexto se reanude (necesario por políticas de navegador)
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    // Crear oscilador para generar el tono
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Conectar oscilador al gain y al destino
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configurar el tono - Un tono muy suave y musical (E5 -> A5)
    oscillator.type = 'sine'; 
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime); // E5
    oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1); // A5
    
    // Configurar volumen (ajustado para ser un poco más fuerte pero suave)
    gainNode.gain.setValueAtTime(0.001, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.12, audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
    
    // Reproducir el tono
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15); // Duración: 150ms (muy corto y leve)
  } catch (error) {
    console.error('Error reproduciendo notificación de sonido:', error);
  }
};
