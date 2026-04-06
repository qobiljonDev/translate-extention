/** Chrome storage — tarix va sevimlilar */

import state from "./state.js";
import { storage, runtime } from "../chrome.js";

const MAX_HISTORY = 200;
const MAX_FAVORITES = 500;

/** Tarjimani tarixga saqlash */
export function saveToHistory(original, translated, detectedLang) {
  storage.local.get("history", (result) => {
    if (runtime.lastError) return;
    const history = result.history || [];
    // Oxirgi yozuv bilan bir xil bo'lsa, qayta saqlamaslik
    const last = history[0];
    if (last && last.original === original && last.targetLang === state.targetLang) return;
    history.unshift({
      original,
      translated,
      detectedLang,
      targetLang: state.targetLang,
      timestamp: Date.now(),
    });
    if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
    storage.local.set({ history });
  });
}

/** Sevimli qo'shish/o'chirish (toggle) */
export function toggleFavorite(original, translated, detectedLang, btn) {
  storage.local.get("favorites", (result) => {
    if (runtime.lastError) return;
    const favorites = result.favorites || [];
    const idx = favorites.findIndex(
      (f) => f.original === original && f.targetLang === state.targetLang
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
        targetLang: state.targetLang,
        timestamp: Date.now(),
      });
      btn.style.color = "#f1c40f";
      btn.title = "Sevimlilardan olib tashlash";
    }

    storage.local.set({ favorites });
  });
}

/** So'z sevimli ekanligini tekshirish */
export function checkIsFavorite(originalText, callback) {
  storage.local.get("favorites", (result) => {
    if (runtime.lastError) { callback(false); return; }
    const favorites = result.favorites || [];
    const isFav = favorites.some(
      (f) => f.original === originalText && f.targetLang === state.targetLang
    );
    callback(isFav);
  });
}
