/** Tarjima moduli — API chaqirish, cache, rate limiting */

import { TranslationCache } from "../utils.js";

const cache = new TranslationCache(100);
const RATE_LIMIT_DELAY = 1000;
let lastRequestTime = 0;
let isTranslating = false;

/**
 * Matnni tarjima qilish
 * @returns {{ translated: string, detectedLang: string } | null}
 */
export async function translateText(text, lang) {
  if (isTranslating) return null;

  const cacheKey = `${text}_${lang}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise((r) => setTimeout(r, RATE_LIMIT_DELAY - timeSinceLastRequest));
  }

  isTranslating = true;
  lastRequestTime = Date.now();

  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`
    );

    if (!response.ok) {
      if (response.status === 429) {
        await new Promise((r) => setTimeout(r, 2000));
        isTranslating = false;
        return { translated: "Tarjima limitiga yetildi...", detectedLang: "unknown" };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // Uzun matnda API bir nechta qismlarga bo'lib qaytaradi — hammasini birlashtirish
    const translated = data?.[0]?.map((part) => part[0]).join("") || "Tarjima topilmadi";
    const detectedLang = data?.[2] || "en";

    const result = { translated, detectedLang };
    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Tarjima xatosi:", error);
    return { translated: "Tarjima xatosi yuz berdi", detectedLang: "unknown" };
  } finally {
    isTranslating = false;
  }
}

/** Batch tarjima (sahifa tarjima uchun) */
export async function translateBatch(text, lang) {
  const response = await fetch(
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`
  );
  const data = await response.json();
  return data[0].map((part) => part[0]).join("");
}
