/** Tarjima moduli — API chaqirish, cache, rate limiting */

import { LRUCache, saveToOfflineCache } from "../services/cache.js";
import { fetchTranslation, fetchBatchTranslation } from "../services/translate.js";

const cache = new LRUCache(100);
const RATE_LIMIT_DELAY = 1000;
let lastRequestTime = 0;
let isTranslating = false;

/**
 * Matnni tarjima qilish (cache + rate limiting)
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
    const result = await fetchTranslation(text, lang);
    cache.set(cacheKey, result);
    saveToOfflineCache(cacheKey, result);
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
  return fetchBatchTranslation(text, lang);
}
