/**
 * Content script uchun umumiy holat (state)
 * Object ichida saqlash — boshqa modullar doim yangi qiymatni ko'radi
 */

import { storage } from "../chrome.js";

const state = {
  targetLang: "uz",
  tooltipTheme: "auto",
  tooltip: null,
  isPinned: false,
};

export default state;

/** Chrome storage'dan sozlamalarni yuklash */
export function initSettings() {
  storage.sync.get(["targetLang", "tooltipTheme"], (result) => {
    if (result.targetLang) state.targetLang = result.targetLang;
    if (result.tooltipTheme) state.tooltipTheme = result.tooltipTheme;
  });
  storage.onChanged.addListener((changes) => {
    if (changes.targetLang) state.targetLang = changes.targetLang.newValue;
    if (changes.tooltipTheme) state.tooltipTheme = changes.tooltipTheme.newValue;
  });
}
