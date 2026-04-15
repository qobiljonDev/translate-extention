/** Ko'p tilli interfeys xizmati */

import { ref } from "vue";
import { storage } from "./chrome.js";

const translations = {
  uz: {
    translateTab: "Tarjima",
    historyTab: "Tarix",
    favoritesTab: "Sevimlilar",
    settingsTab: "Sozlamalar",
    translateLang: "Tarjima tili",
    inputPlaceholder: "Matn kiriting...",
    translateBtn: "Tarjima qilish",
    translating: "Tarjima...",
    translatePage: "Sahifani tarjima",
    restorePage: "Qaytarish",
    result: "Tarjima",
    copy: "Nusxalash",
    copied: "Nusxalandi!",
    listen: "Tinglash",
    clear: "Tozalash",
    noHistory: "Hali tarjimalar yo'q",
    noFavorites: "Sevimli so'zlar yo'q",
    translations: "ta tarjima",
    favorites: "ta sevimli",
    exportBtn: "Eksport",
    importBtn: "Import",
    exportAll: "Hammasini eksport",
    theme: "Mavzu",
    dark: "Qorong'u",
    light: "Yorug'",
    language: "Interfeys tili",
    detectedLang: "Aniqlangan til",
    shortcutHint: "Matn belgilang",
    rightClick: "O'ng tugma",
    offlineCache: "Offline cache",
    clearCache: "Cache tozalash",
    cacheCleared: "Cache tozalandi",
    siteControl: "Ushbu sayt",
    disableOnSite: "Bu saytda o'chirish",
    enableOnSite: "Bu saytda yoqish",
    siteDisabled: "Tarjima o'chirilgan",
    siteEnabled: "Tarjima yoqilgan",
  },
  en: {
    translateTab: "Translate",
    historyTab: "History",
    favoritesTab: "Favorites",
    settingsTab: "Settings",
    translateLang: "Target language",
    inputPlaceholder: "Enter text...",
    translateBtn: "Translate",
    translating: "Translating...",
    translatePage: "Translate page",
    restorePage: "Restore",
    result: "Translation",
    copy: "Copy",
    copied: "Copied!",
    listen: "Listen",
    clear: "Clear",
    noHistory: "No translations yet",
    noFavorites: "No favorites yet",
    translations: "translations",
    favorites: "favorites",
    exportBtn: "Export",
    importBtn: "Import",
    exportAll: "Export all",
    theme: "Theme",
    dark: "Dark",
    light: "Light",
    language: "Interface language",
    detectedLang: "Detected language",
    shortcutHint: "Select text",
    rightClick: "Right-click",
    offlineCache: "Offline cache",
    clearCache: "Clear cache",
    cacheCleared: "Cache cleared",
    siteControl: "This site",
    disableOnSite: "Disable on this site",
    enableOnSite: "Enable on this site",
    siteDisabled: "Translation disabled",
    siteEnabled: "Translation enabled",
  },
  ru: {
    translateTab: "Перевод",
    historyTab: "История",
    favoritesTab: "Избранное",
    settingsTab: "Настройки",
    translateLang: "Язык перевода",
    inputPlaceholder: "Введите текст...",
    translateBtn: "Перевести",
    translating: "Перевод...",
    translatePage: "Перевести страницу",
    restorePage: "Восстановить",
    result: "Перевод",
    copy: "Копировать",
    copied: "Скопировано!",
    listen: "Слушать",
    clear: "Очистить",
    noHistory: "Переводов пока нет",
    noFavorites: "Избранных нет",
    translations: "переводов",
    favorites: "избранных",
    exportBtn: "Экспорт",
    importBtn: "Импорт",
    exportAll: "Экспорт всего",
    theme: "Тема",
    dark: "Тёмная",
    light: "Светлая",
    language: "Язык интерфейса",
    detectedLang: "Определён язык",
    shortcutHint: "Выделите текст",
    rightClick: "Правый клик",
    offlineCache: "Офлайн кэш",
    clearCache: "Очистить кэш",
    cacheCleared: "Кэш очищен",
    siteControl: "Этот сайт",
    disableOnSite: "Отключить на этом сайте",
    enableOnSite: "Включить на этом сайте",
    siteDisabled: "Перевод отключён",
    siteEnabled: "Перевод включён",
  },
};

export const currentUILang = ref("uz");

export function loadUILang() {
  storage.sync.get("uiLang", (result) => {
    if (result.uiLang) currentUILang.value = result.uiLang;
  });
}

export function setUILang(lang) {
  currentUILang.value = lang;
  storage.sync.set({ uiLang: lang });
}

export function t(key) {
  return translations[currentUILang.value]?.[key] || translations.uz[key] || key;
}

export const uiLanguages = [
  { code: "uz", label: "O'zbekcha" },
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
];
