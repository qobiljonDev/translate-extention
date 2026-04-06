/**
 * Content Script — entry point
 * Sahifaga inject bo'ladigan asosiy fayl
 */

import { debounce, isValidSelection } from "../utils.js";
import { runtime } from "../chrome.js";
import state, { initSettings } from "./state.js";
import { translateText } from "./translator.js";
import { showTooltip, hideTooltip, forceHideTooltip } from "./tooltip.js";
import { translatePage, restorePage } from "./pageTranslator.js";
import { initVoices } from "./tts.js";

// Sozlamalarni yuklash
initSettings();
initVoices();

// === MESSAGE LISTENER ===
runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "translate-selection") {
    const text = message.text || window.getSelection()?.toString().trim();
    if (text && text.length >= 2) {
      handleTranslateRequest(text);
    }
  }
  if (message.action === "translate-page") {
    translatePage();
    sendResponse({ status: "started" });
  }
  if (message.action === "restore-page") {
    restorePage();
    sendResponse({ status: "restored" });
  }
});

/** Tarjima so'rovi (context menu / shortcut orqali) */
async function handleTranslateRequest(text) {
  const result = await translateText(text, state.targetLang);
  if (result && result.translated !== text) {
    const selection = window.getSelection();
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 3;
    if (selection?.rangeCount > 0) {
      try {
        const rect = selection.getRangeAt(0).getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.bottom;
      } catch {}
    }
    showTooltip(x, y, result.translated, text, result.detectedLang);
  }
}

/** Matn belgilanganda tarjima qilish (debounced) */
const handleSelection = debounce(async (event) => {
  const selection = window.getSelection();
  const selectedText = selection?.toString().trim();

  if (
    !selectedText ||
    !isValidSelection(selectedText) ||
    event.target.closest(".uz-translator-tooltip") ||
    ["INPUT", "TEXTAREA"].includes(event.target.tagName) ||
    event.target.isContentEditable
  ) {
    return;
  }

  const result = await translateText(selectedText, state.targetLang);

  if (result && result.translated !== selectedText) {
    try {
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      showTooltip(
        rect.left + rect.width / 2,
        rect.bottom,
        result.translated,
        selectedText,
        result.detectedLang
      );
    } catch {}
  }
}, 300);

// === EVENT LISTENERS ===

document.addEventListener("mouseup", handleSelection);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    window.speechSynthesis.cancel();
    forceHideTooltip();
  }
});

let scrollTimeout;
document.addEventListener(
  "scroll",
  () => {
    if (state.tooltip && !state.isPinned) {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => forceHideTooltip(), 100);
    }
  },
  true
);

document.addEventListener("mousedown", (event) => {
  if (state.tooltip && !state.isPinned && !event.target.closest(".uz-translator-tooltip")) {
    setTimeout(() => {
      const sel = window.getSelection();
      if (!(sel?.rangeCount > 0 && sel.toString().trim().length > 0)) {
        forceHideTooltip();
      }
    }, 100);
  }
});
