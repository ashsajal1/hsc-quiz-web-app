import { useState } from "react";

const useSpeaker = () => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const speak = (text: string): void => {
    if (!window.speechSynthesis) {
      console.warn("Speech Synthesis not supported in this browser.");
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    console.log("Speaking:", text);
  };

  const stop = (): void => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return { speak, stop, isSpeaking };
};

export default useSpeaker;
