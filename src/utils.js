// Re-export config'dan (backward compatibility)
export { getLangName, getTtsLang, languages } from "./config.js";

// Debounce
export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Theme detection
export function detectTheme(bgColor) {
  const match = bgColor.match(/\d+/g);
  if (match) {
    const [r, g, b] = match.map(Number);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5 ? "dark" : "light";
  }
  return "dark";
}

// Theme styles
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

// Translation API call
export async function fetchTranslation(text, lang) {
  const response = await fetch(
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`
  );

  if (!response.ok) {
    if (response.status === 429) {
      return { translated: "Tarjima limitiga yetildi...", detectedLang: "unknown", rateLimited: true };
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  const translated = data?.[0]?.map((part) => part[0]).join("") || "Tarjima topilmadi";
  const detectedLang = data?.[2] || "en";

  return { translated, detectedLang };
}

// Cache with max size (LRU-like)
export class TranslationCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    return this.cache.get(key);
  }

  has(key) {
    return this.cache.has(key);
  }

  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  get size() {
    return this.cache.size;
  }

  clear() {
    this.cache.clear();
  }
}

// Format relative time (Uzbek)
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
