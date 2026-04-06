import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  debounce,
  detectTheme,
  getThemeStyles,
  TranslationCache,
  formatTime,
  isValidSelection,
  fetchTranslation,
} from "../src/utils.js";
import {
  languages,
  getLangName,
  getTtsLang,
} from "../src/config.js";

// ==========================================
// config — languages, getLangName, getTtsLang
// ==========================================
describe("languages config", () => {
  it("barcha asosiy tillar mavjud", () => {
    expect(getLangName("en")).toBe("English");
    expect(getLangName("uz")).toBe("O'zbek");
    expect(getLangName("ru")).toBe("Русский");
    expect(getLangName("fr")).toBe("Français");
  });

  it("kamida 6 ta til bor", () => {
    expect(Object.keys(languages).length).toBeGreaterThanOrEqual(6);
  });

  it("noma'lum til uchun kodni qaytaradi", () => {
    expect(getLangName("xx")).toBe("xx");
  });

  it("qo'shimcha tillarni ham taniyi", () => {
    expect(getLangName("de")).toBe("Deutsch");
    expect(getLangName("ja")).toBe("日本語");
  });
});

describe("getTtsLang", () => {
  it("til kodlarini IETF formatga moslashtiradi", () => {
    expect(getTtsLang("uz")).toBe("uz-UZ");
    expect(getTtsLang("en")).toBe("en-US");
    expect(getTtsLang("ru")).toBe("ru-RU");
  });

  it("har bir til uchun to'g'ri format", () => {
    for (const code of Object.keys(languages)) {
      expect(getTtsLang(code)).toMatch(/^[a-z]{2}-[A-Z]{2}$/);
    }
  });

  it("noma'lum til uchun en-US qaytaradi", () => {
    expect(getTtsLang("xx")).toBe("en-US");
  });
});

// ==========================================
// debounce
// ==========================================
describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("funksiyani kechiktiradi", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledOnce();
  });

  it("tez-tez chaqirganda faqat oxirgisini bajaradi", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced("a");
    debounced("b");
    debounced("c");

    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith("c");
  });

  it("vaqt o'tgandan keyin qayta chaqirsa ishlaydi", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);

    debounced();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  vi.useRealTimers;
});

// ==========================================
// detectTheme
// ==========================================
describe("detectTheme", () => {
  it("qora fon uchun 'dark' qaytaradi", () => {
    expect(detectTheme("rgb(0, 0, 0)")).toBe("dark");
    expect(detectTheme("rgb(30, 30, 30)")).toBe("dark");
  });

  it("oq fon uchun 'light' qaytaradi", () => {
    expect(detectTheme("rgb(255, 255, 255)")).toBe("light");
    expect(detectTheme("rgb(240, 240, 240)")).toBe("light");
  });

  it("o'rtacha ranglar uchun to'g'ri ishlaydi", () => {
    // luminance = (0.299*128 + 0.587*128 + 0.114*128) / 255 = 0.502
    expect(detectTheme("rgb(128, 128, 128)")).toBe("light");
  });

  it("noto'g'ri formatda 'dark' qaytaradi", () => {
    expect(detectTheme("invalid")).toBe("dark");
    expect(detectTheme("")).toBe("dark");
  });

  it("rgba formatni ham qo'llab-quvvatlaydi", () => {
    expect(detectTheme("rgba(255, 255, 255, 1)")).toBe("light");
    expect(detectTheme("rgba(0, 0, 0, 0.9)")).toBe("dark");
  });
});

// ==========================================
// getThemeStyles
// ==========================================
describe("getThemeStyles", () => {
  it("light tema uchun oq fonli stillar qaytaradi", () => {
    const styles = getThemeStyles("light");
    expect(styles.color).toBe("#1a1a2e");
    expect(styles.bg).toContain("#ffffff");
    expect(styles.border).toContain("solid");
  });

  it("dark tema uchun qora fonli stillar qaytaradi", () => {
    const styles = getThemeStyles("dark");
    expect(styles.color).toBe("#ecf0f1");
    expect(styles.bg).toContain("#2c3e50");
    expect(styles.border).toBe("none");
  });

  it("noma'lum tema dark sifatida ishlaydi", () => {
    const styles = getThemeStyles("unknown");
    expect(styles.color).toBe("#ecf0f1");
  });

  it("barcha kerakli stil xususiyatlari mavjud", () => {
    const requiredKeys = ["bg", "color", "btnBg", "btnHover", "shadow", "labelColor", "border"];
    for (const theme of ["light", "dark"]) {
      const styles = getThemeStyles(theme);
      for (const key of requiredKeys) {
        expect(styles).toHaveProperty(key);
      }
    }
  });
});

// ==========================================
// TranslationCache
// ==========================================
describe("TranslationCache", () => {
  it("qiymatni saqlaydi va qaytaradi", () => {
    const cache = new TranslationCache();
    cache.set("hello_uz", { translated: "salom", detectedLang: "en" });

    expect(cache.has("hello_uz")).toBe(true);
    expect(cache.get("hello_uz")).toEqual({ translated: "salom", detectedLang: "en" });
  });

  it("mavjud bo'lmagan kalit uchun undefined qaytaradi", () => {
    const cache = new TranslationCache();
    expect(cache.has("nonexistent")).toBe(false);
    expect(cache.get("nonexistent")).toBeUndefined();
  });

  it("maksimal hajmni oshirganda eski yozuvni o'chiradi", () => {
    const cache = new TranslationCache(3);

    cache.set("a", 1);
    cache.set("b", 2);
    cache.set("c", 3);
    expect(cache.size).toBe(3);

    cache.set("d", 4);
    expect(cache.size).toBe(3);
    expect(cache.has("a")).toBe(false); // birinchi kiritilgan o'chirildi
    expect(cache.has("d")).toBe(true);
  });

  it("clear() barcha yozuvlarni o'chiradi", () => {
    const cache = new TranslationCache();
    cache.set("a", 1);
    cache.set("b", 2);
    cache.clear();
    expect(cache.size).toBe(0);
  });

  it("default max size 100", () => {
    const cache = new TranslationCache();
    for (let i = 0; i < 105; i++) {
      cache.set(`key_${i}`, i);
    }
    expect(cache.size).toBe(100);
    expect(cache.has("key_0")).toBe(false);
    expect(cache.has("key_104")).toBe(true);
  });
});

// ==========================================
// formatTime
// ==========================================
describe("formatTime", () => {
  it("hozirgina uchun to'g'ri matn qaytaradi", () => {
    expect(formatTime(Date.now())).toBe("hozirgina");
    expect(formatTime(Date.now() - 30000)).toBe("hozirgina"); // 30 soniya
  });

  it("daqiqalarni to'g'ri ko'rsatadi", () => {
    expect(formatTime(Date.now() - 5 * 60000)).toBe("5 daqiqa oldin");
    expect(formatTime(Date.now() - 30 * 60000)).toBe("30 daqiqa oldin");
  });

  it("soatlarni to'g'ri ko'rsatadi", () => {
    expect(formatTime(Date.now() - 2 * 3600000)).toBe("2 soat oldin");
    expect(formatTime(Date.now() - 12 * 3600000)).toBe("12 soat oldin");
  });

  it("kunlarni to'g'ri ko'rsatadi", () => {
    expect(formatTime(Date.now() - 3 * 86400000)).toBe("3 kun oldin");
  });
});

// ==========================================
// isValidSelection
// ==========================================
describe("isValidSelection", () => {
  it("2-500 belgi orasidagi matnni qabul qiladi", () => {
    expect(isValidSelection("hi")).toBe(true);
    expect(isValidSelection("hello world")).toBe(true);
    expect(isValidSelection("a".repeat(3000))).toBe(true);
  });

  it("juda qisqa matnni rad etadi", () => {
    expect(isValidSelection("")).toBe(false);
    expect(isValidSelection("a")).toBe(false);
    expect(isValidSelection(" ")).toBe(false);
  });

  it("juda uzun matnni rad etadi", () => {
    expect(isValidSelection("a".repeat(5001))).toBe(false);
  });

  it("5000 belgigacha qabul qiladi", () => {
    expect(isValidSelection("a".repeat(5000))).toBe(true);
  });

  it("null va undefined uchun false qaytaradi", () => {
    expect(isValidSelection(null)).toBe(false);
    expect(isValidSelection(undefined)).toBe(false);
    expect(isValidSelection(123)).toBe(false);
  });

  it("bo'sh joylarni trim qilgandan keyin tekshiradi", () => {
    expect(isValidSelection("  ab  ")).toBe(true);
    expect(isValidSelection("   ")).toBe(false);
  });
});

// ==========================================
// fetchTranslation
// ==========================================
describe("fetchTranslation", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("muvaffaqiyatli tarjimani qaytaradi", async () => {
    const mockResponse = [[["salom", "hello"]], null, "en"];
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await fetchTranslation("hello", "uz");
    expect(result.translated).toBe("salom");
    expect(result.detectedLang).toBe("en");
  });

  it("429 xatosida rate limit xabarini qaytaradi", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 429,
    });

    const result = await fetchTranslation("hello", "uz");
    expect(result.rateLimited).toBe(true);
    expect(result.translated).toContain("limitiga");
  });

  it("boshqa HTTP xatosida throw qiladi", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(fetchTranslation("hello", "uz")).rejects.toThrow("HTTP error");
  });

  it("API javobida tarjima bo'lmasa fallback qaytaradi", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([null, null, null]),
    });

    const result = await fetchTranslation("hello", "uz");
    expect(result.translated).toBe("Tarjima topilmadi");
    expect(result.detectedLang).toBe("en");
  });

  it("to'g'ri URL bilan fetch chaqiradi", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([[["test"]], null, "en"]),
    });

    await fetchTranslation("hello world", "uz");

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("tl=uz")
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("q=hello%20world")
    );
  });
});
