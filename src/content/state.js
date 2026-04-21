/**
 * Content script uchun umumiy holat (state)
 * Object ichida saqlash — boshqa modullar doim yangi qiymatni ko'radi
 */

import { storage } from "../services/chrome.js";

const state = {
  targetLang: "uz",
  theme: "dark",
  tooltip: null,
  isPinned: false,
  disabledSites: [],
};

export default state;

export function isSiteDisabled() {
  return state.disabledSites.includes(location.hostname);
}

/** Chrome storage'dan sozlamalarni yuklash */
export function initSettings() {
  storage.sync.get(["targetLang", "popupTheme", "disabledSites"], (result) => {
    if (result.targetLang) state.targetLang = result.targetLang;
    if (result.popupTheme) state.theme = result.popupTheme;
    if (Array.isArray(result.disabledSites)) state.disabledSites = result.disabledSites;
  });
  storage.onChanged.addListener((changes) => {
    if (changes.targetLang) state.targetLang = changes.targetLang.newValue;
    if (changes.popupTheme) state.theme = changes.popupTheme.newValue;
    if (changes.disabledSites) state.disabledSites = changes.disabledSites.newValue || [];
  });
}
