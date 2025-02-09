import { create } from "zustand/react";

interface SpeakStore {
  language: string;
  isSpeaking: boolean;
  mute: boolean; // New state for muting
  speechSynthesis: SpeechSynthesisUtterance | null;
  setLanguage: (lang: string) => void;
  toggleSpeech: (text: string) => void;
  stopSpeech: () => void;
  toggleMute: () => void; // Action to toggle mute
}

const useSpeakStore = create<SpeakStore>((set) => ({
  language: "en", // Default language is English
  isSpeaking: false,
  mute: false, // Default mute state is false (not muted)
  speechSynthesis: null,

  setLanguage: (lang: string) => set({ language: lang }),

  toggleSpeech: (text: string) => {
    set((state) => {
      if (state.mute) return { isSpeaking: false }; // Don't speak if muted

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = state.language;

      if (state.isSpeaking) {
        window.speechSynthesis.cancel(); // Stop current speech
        return { isSpeaking: false, speechSynthesis: null };
      } else {
        window.speechSynthesis.speak(utterance); // Start speaking
        utterance.onend = () =>
          set({ isSpeaking: false, speechSynthesis: null });
        return { isSpeaking: true, speechSynthesis: utterance };
      }
    });
  },

  stopSpeech: () => {
    window.speechSynthesis.cancel(); // Stop the speech
    set({ isSpeaking: false, speechSynthesis: null });
  },

  toggleMute: () => {
    set((state: { mute: boolean }) => ({ mute: !state.mute }));
  },
}));

export default useSpeakStore;
