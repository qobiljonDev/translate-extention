/** Text-to-Speech xizmati */

import { getTtsLang } from "./config.js";

export function speak(text, lang) {
  if (!("speechSynthesis" in window) || !text) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voiceLang = getTtsLang(lang);
  const voices = window.speechSynthesis.getVoices();

  const matched =
    voices.find((v) => v.lang === voiceLang && !v.localService) ||
    voices.find((v) => v.lang === voiceLang) ||
    voices.find((v) => v.lang.startsWith(lang));

  if (matched) utterance.voice = matched;
  utterance.lang = voiceLang;
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function initVoices() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }
}
