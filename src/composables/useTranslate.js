/** Tarjima composable — popup uchun */

import { ref } from "vue";
import { fetchTranslation } from "../services/translate.js";
import { saveToOfflineCache, getOfflineCache } from "../services/cache.js";

export function useTranslate() {
  const text = ref("");
  const translated = ref("");
  const detectedLang = ref("");
  const loading = ref(false);

  async function translate(targetLang) {
    if (!text.value.trim() || loading.value) return;
    loading.value = true;
    detectedLang.value = "";

    const cacheKey = `${text.value.trim()}_${targetLang}`;

    try {
      const result = await fetchTranslation(text.value, targetLang);
      translated.value = result.translated;
      detectedLang.value = result.detectedLang;
      // Offline cache'ga saqlash
      saveToOfflineCache(cacheKey, result);
    } catch {
      // Offline cache'dan qidirish
      getOfflineCache((cache) => {
        if (cache[cacheKey]) {
          translated.value = cache[cacheKey].translated;
          detectedLang.value = cache[cacheKey].detectedLang;
        } else {
          translated.value = "Tarjima topilmadi";
        }
      });
    } finally {
      loading.value = false;
    }
  }

  function clear() {
    text.value = "";
    translated.value = "";
    detectedLang.value = "";
  }

  return { text, translated, detectedLang, loading, translate, clear };
}
