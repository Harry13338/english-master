import { AccentLocale } from '../types';

export function speakText(
  text: string,
  accent: AccentLocale = 'en-US',
  onStart?: () => void,
  onEnd?: () => void
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    alert('Web Speech API is not supported in this browser.');
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = accent;
  utterance.rate = 0.92; // Slightly slower for clear language learning pronunciation
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  // Prefer high-quality matching locale voice
  const preferredVoice =
    voices.find(
      (v) =>
        v.lang.replace('_', '-') === accent &&
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Microsoft'))
    ) ||
    voices.find((v) => v.lang.replace('_', '-') === accent) ||
    voices.find((v) => v.lang.startsWith(accent.split('-')[0]));

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  if (onStart) utterance.onstart = onStart;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}
