/** Chrome storage — tarix va sevimlilar */

import { targetLang } from "./state.js";

const MAX_HISTORY = 200;
const MAX_FAVORITES = 500;

/** Tarjimani tarixga saqlash */
export function saveToHistory(original, translated, detectedLang) {
  try {
    chrome.storage.local.get("history", (result) => {
      const history = result.history || [];
      history.unshift({
        original,
        translated,
        detectedLang,
        targetLang,
        timestamp: Date.now(),
      });
      if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
      chrome.storage.local.set({ history });
    });
  } catch {}
}

/** Sevimli qo'shish/o'chirish (toggle) */
export function toggleFavorite(original, translated, detectedLang, btn) {
  try {
    chrome.storage.local.get("favorites", (result) => {
      const favorites = result.favorites || [];
      const idx = favorites.findIndex(
        (f) => f.original === original && f.targetLang === targetLang
      );

      if (idx >= 0) {
        favorites.splice(idx, 1);
        btn.style.color = "#fff";
        btn.title = "Sevimlilarga qo'shish";
      } else {
        if (favorites.length >= MAX_FAVORITES) favorites.pop();
        favorites.unshift({
          original,
          translated,
          detectedLang,
          targetLang,
          timestamp: Date.now(),
        });
        btn.style.color = "#f1c40f";
        btn.title = "Sevimlilardan olib tashlash";
      }

      chrome.storage.local.set({ favorites });
    });
  } catch {}
}

/** So'z sevimli ekanligini tekshirish */
export function checkIsFavorite(originalText, callback) {
  try {
    chrome.storage.local.get("favorites", (result) => {
      const favorites = result.favorites || [];
      const isFav = favorites.some(
        (f) => f.original === originalText && f.targetLang === targetLang
      );
      callback(isFav);
    });
  } catch {}
}
