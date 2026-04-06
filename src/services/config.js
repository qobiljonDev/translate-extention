/** Til konfiguratsiyasi — barcha til ma'lumotlari bitta joyda */

export const languages = {
  uz: { label: "O'zbek", name: "O'zbek", flag: "uz", tts: "uz-UZ" },
  en: { label: "Ingliz", name: "English", flag: "us", tts: "en-US" },
  ru: { label: "Rus", name: "Русский", flag: "ru", tts: "ru-RU" },
  tr: { label: "Turk", name: "Türkçe", flag: "tr", tts: "tr-TR" },
  ar: { label: "Arab", name: "العربية", flag: "sa", tts: "ar-SA" },
  fr: { label: "Fransuz", name: "Français", flag: "fr", tts: "fr-FR" },
};

export const extraLangNames = {
  de: "Deutsch",
  es: "Español",
  it: "Italiano",
  ja: "日本語",
  ko: "한국어",
  zh: "中文",
  pt: "Português",
};

export function getLangName(code) {
  return languages[code]?.name || extraLangNames[code] || code;
}

export function getTtsLang(code) {
  return languages[code]?.tts || "en-US";
}

export function getFlag(code) {
  const countryCode = languages[code]?.flag || code;
  return `https://flagcdn.com/w40/${countryCode}.png`;
}
