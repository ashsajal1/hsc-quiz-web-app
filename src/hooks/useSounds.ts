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

  const playNote = useCallback((frequency: number, duration: number, startTime: number, gain: number) => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, startTime);
    
    // Add a slight vibrato effect
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.frequency.linearRampToValueAtTime(frequency * 1.02, startTime + duration * 0.5);
    oscillator.frequency.linearRampToValueAtTime(frequency, startTime + duration);

    // Create a natural envelope
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(gain * 0.7, startTime + duration * 0.7);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);

    return oscillator;
  }, []);

  const playSound = useCallback((type: SoundType) => {
    if (!audioContextRef.current) return;

    // Stop any existing sound
    stopSound();

    const now = audioContextRef.current.currentTime;
    const baseGain = 0.3;

    switch (type) {
      case 'happy': {
        // Play a cheerful major arpeggio
        const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        frequencies.forEach((freq, index) => {
          playNote(freq, 0.15, now + index * 0.1, baseGain * (1 - index * 0.15));
        });
        break;
      }
      case 'sad': {
        // Play a melancholic minor arpeggio
        const frequencies = [440, 523.25, 659.25, 880]; // A4, C5, E5, A5
        frequencies.forEach((freq, index) => {
          playNote(freq, 0.2, now + index * 0.15, baseGain * (1 - index * 0.1));
        });
        break;
      }
      case 'good': {
        // Play a satisfying ascending pattern
        const frequencies = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
        frequencies.forEach((freq, index) => {
          playNote(freq, 0.12, now + index * 0.08, baseGain * (1 - index * 0.1));
        });
        break;
      }
    }
  }, [stopSound, playNote]);

  return { playSound, stopSound };
};
