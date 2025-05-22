import { useCallback, useEffect, useRef } from 'react';

type SoundType = 'happy' | 'sad' | 'good';

interface UseSoundsReturn {
  playSound: (type: SoundType) => void;
  stopSound: () => void;
}

export const useSounds = (): UseSoundsReturn => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    // Initialize AudioContext
    audioContextRef.current = new AudioContext();

    return () => {
      // Cleanup
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const stopSound = useCallback(() => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
    }
  }, []);

  const playSound = useCallback((type: SoundType) => {
    if (!audioContextRef.current) return;

    // Stop any existing sound
    stopSound();

    // Create new oscillator
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    // Configure sound based on type
    switch (type) {
      case 'happy':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioContextRef.current.currentTime); // A5
        gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
        break;
      case 'sad':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContextRef.current.currentTime); // A4
        gainNode.gain.setValueAtTime(0.2, audioContextRef.current.currentTime);
        break;
      case 'good':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(660, audioContextRef.current.currentTime); // E5
        gainNode.gain.setValueAtTime(0.25, audioContextRef.current.currentTime);
        break;
    }

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    // Start and stop the sound
    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + 0.5); // Play for 0.5 seconds

    oscillatorRef.current = oscillator;
  }, [stopSound]);

  return { playSound, stopSound };
};
