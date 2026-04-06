/** Tarjima API xizmati — popup va content script uchun umumiy */

const API_URL = "https://translate.googleapis.com/translate_a/single";

export async function fetchTranslation(text, targetLang) {
  const response = await fetch(
    `${API_URL}?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
  );

  if (!response.ok) {
    if (response.status === 429) {
      return { translated: "Tarjima limitiga yetildi...", detectedLang: "unknown", rateLimited: true };
    }
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  const translated = data?.[0]?.map((part) => part[0]).join("") || "Tarjima topilmadi";
  const detectedLang = data?.[2] || "en";

  return { translated, detectedLang };
}

export async function fetchBatchTranslation(text, targetLang) {
  const response = await fetch(
    `${API_URL}?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
  );
  const data = await response.json();
  return data[0].map((part) => part[0]).join("");
}
