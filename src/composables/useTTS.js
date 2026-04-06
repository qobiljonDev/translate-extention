/** Text-to-Speech composable */

import { speak, stopSpeaking } from "../services/tts.js";

export function useTTS() {
  function speakText(text, lang) {
    speak(text, lang);
  }

  function stop() {
    stopSpeaking();
  }

  return { speakText, stop };
}
