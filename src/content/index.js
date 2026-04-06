/**
 * Content Script — entry point
 * Sahifaga inject bo'ladigan asosiy fayl
 */

import { debounce, isValidSelection } from "../utils.js";
import { initSettings, targetLang, tooltip, isPinned } from "./state.js";
import { translateText } from "./translator.js";
import { showTooltip, hideTooltip, forceHideTooltip } from "./tooltip.js";
import { translatePage, restorePage } from "./pageTranslator.js";
import { initVoices } from "./tts.js";

// Sozlamalarni yuklash
initSettings();
initVoices();

// === MESSAGE LISTENER ===
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
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
  const result = await translateText(text, targetLang);
  if (result && result.translated !== text) {
    const selection = window.getSelection();
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 3;
    if (selection?.rangeCount > 0) {
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.bottom;
    }
    showTooltip(x, y, result.translated, text, result.detectedLang);
  }
}

/** Matn belgilanganda tarjima qilish (debounced) */
const handleSelection = debounce(async (event) => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  if (
    !selectedText ||
    !isValidSelection(selectedText) ||
    event.target.closest(".translation-tooltip") ||
    ["INPUT", "TEXTAREA"].includes(event.target.tagName) ||
    event.target.isContentEditable
  ) {
    return;
  }

  const result = await translateText(selectedText, targetLang);

  if (result && result.translated !== selectedText) {
    const rect = selection.getRangeAt(0).getBoundingClientRect();
    showTooltip(
      rect.left + rect.width / 2,
      rect.bottom,
      result.translated,
      selectedText,
      result.detectedLang
    );
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
    if (tooltip && !isPinned) {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => forceHideTooltip(), 100);
    }
  },
  true
);

document.addEventListener("mousedown", (event) => {
  if (tooltip && !isPinned && !event.target.closest(".translation-tooltip")) {
    setTimeout(() => {
      const sel = window.getSelection();
      if (!(sel.rangeCount > 0 && sel.toString().trim().length > 0)) {
        forceHideTooltip();
      }
    }, 100);
  }
});
