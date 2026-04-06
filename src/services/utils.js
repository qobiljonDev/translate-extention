/**
 * Umumiy utility funksiyalar
 * API va Cache services/ papkasiga ko'chirilgan
 */

// Re-export (backward compatibility)
export { getLangName, getTtsLang, languages } from "./config.js";
export { LRUCache as TranslationCache } from "./cache.js";
export { fetchTranslation } from "./translate.js";

// Debounce
export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Theme detection (content script tooltip uchun)
export function detectTheme(bgColor) {
  const match = bgColor.match(/\d+/g);
  if (match) {
    const [r, g, b] = match.map(Number);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5 ? "dark" : "light";
  }
  return "dark";
}

// Theme styles (content script tooltip uchun)
export function getThemeStyles(theme) {
  if (theme === "light") {
    return {
      bg: "linear-gradient(135deg, #ffffff, #f0f2f5)",
      color: "#1a1a2e",
      btnBg: "rgba(0,0,0,0.06)",
      btnHover: "rgba(0,0,0,0.12)",
      shadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
      labelColor: "rgba(0,0,0,0.5)",
      border: "1px solid rgba(0,0,0,0.08)",
    };
  }
  return {
    bg: "linear-gradient(135deg, #2c3e50, #34495e)",
    color: "#ecf0f1",
    btnBg: "rgba(255,255,255,0.1)",
    btnHover: "rgba(255,255,255,0.2)",
    shadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
    labelColor: "rgba(255,255,255,0.5)",
    border: "none",
  };
}

// Format relative time
export function formatTime(ts) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "hozirgina";
  if (min < 60) return `${min} daqiqa oldin`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} soat oldin`;
  const days = Math.floor(hr / 24);
  return `${days} kun oldin`;
}

// Validate selection text
export function isValidSelection(text) {
  if (!text || typeof text !== "string") return false;
  const trimmed = text.trim();
  return trimmed.length >= 2 && trimmed.length <= 5000;
}
