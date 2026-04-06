/** Text-to-Speech moduli */

import { getTtsLang } from "../config.js";

/** Matnni ovoz bilan o'qish */
export function speakText(text, lang = "en") {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const voiceLang = getTtsLang(lang);

  const voices = window.speechSynthesis.getVoices();
  const matchedVoice =
    voices.find((v) => v.lang === voiceLang && !v.localService) ||
    voices.find((v) => v.lang === voiceLang) ||
    voices.find((v) => v.lang.startsWith(lang));

  if (matchedVoice) utterance.voice = matchedVoice;
  utterance.lang = voiceLang;
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;

  window.speechSynthesis.speak(utterance);
}

/** Ovozlarni oldindan yuklash */
export function initVoices() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }
}
