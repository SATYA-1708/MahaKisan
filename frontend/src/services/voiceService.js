export const voiceService = {
  speak: (text, lang = 'mr-IN') => {
    if (!('speechSynthesis' in window)) {
      console.warn("Speech synthesis not supported on this browser.");
      return;
    }

    window.speechSynthesis.cancel(); // cancel any previous utterance

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Slightly slower for clarity
    utterance.pitch = 1.0;

    // Pick appropriate language code
    if (lang === 'mr') utterance.lang = 'mr-IN';
    else if (lang === 'hi') utterance.lang = 'hi-IN';
    else utterance.lang = 'en-IN';

    // Attempt to match installed Indian English or Hindi/Marathi voices
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.startsWith(utterance.lang.slice(0, 2)));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    window.speechSynthesis.speak(utterance);
    return utterance;
  },

  stop: () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
};
