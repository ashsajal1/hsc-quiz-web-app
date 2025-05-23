import { create } from "zustand";

interface SpeakerState {
  isSpeaking: boolean;
  speak: (text: string) => Promise<void>;
  stop: () => void;
}

export const useSpeakerStore = create<SpeakerState>((set) => ({
  isSpeaking: false,

  speak: (text: string) => {
    return new Promise((resolve) => {
      const synth = window.speechSynthesis;
      if (!synth) {
        console.warn("Speech Synthesis not supported in this browser.");
        resolve();
        return;
      }

      synth.cancel(); // Stop any existing speech

      const voices = synth.getVoices();
      const bengaliVoice = voices.find((v) => v.lang === "bn-BD");

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = bengaliVoice || voices[0]; // Use default if no Bengali voice found
      utterance.lang = "bn-BD";

      utterance.onstart = () => set({ isSpeaking: true });
      utterance.onend = () => {
        set({ isSpeaking: false });
        resolve();
      };

      synth.speak(utterance);
    });
  },

  stop: () => {
    const synth = window.speechSynthesis;
    if (synth) {
      synth.cancel();
      set({ isSpeaking: false });
    }
  },
}));
