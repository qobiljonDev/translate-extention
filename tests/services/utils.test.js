import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  debounce,
  detectTheme,
  getThemeStyles,
  formatTime,
  isValidSelection,
} from "../../src/services/utils.js";

describe("debounce", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("funksiyani kechiktiradi", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);
    debounced();
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledOnce();
  });

  it("tez-tez chaqirsa faqat oxirgi argumentni bajaradi", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);
    debounced("a");
    debounced("b");
    debounced("c");
    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith("c");
  });

  it("vaqt o'tgandan keyin qayta ishlaydi", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced();
    vi.advanceTimersByTime(100);
    debounced();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe("detectTheme", () => {
  it("qora fon uchun 'dark' qaytaradi", () => {
    expect(detectTheme("rgb(0, 0, 0)")).toBe("dark");
    expect(detectTheme("rgb(30, 30, 30)")).toBe("dark");
  });

  it("oq fon uchun 'light' qaytaradi", () => {
    expect(detectTheme("rgb(255, 255, 255)")).toBe("light");
    expect(detectTheme("rgb(240, 240, 240)")).toBe("light");
  });

  it("rgba formatni qo'llab-quvvatlaydi", () => {
    expect(detectTheme("rgba(255, 255, 255, 1)")).toBe("light");
    expect(detectTheme("rgba(0, 0, 0, 0.9)")).toBe("dark");
  });

  it("noto'g'ri formatda 'dark' qaytaradi", () => {
    expect(detectTheme("invalid")).toBe("dark");
    expect(detectTheme("")).toBe("dark");
  });
});

describe("getThemeStyles", () => {
  const requiredKeys = ["bg", "color", "btnBg", "btnHover", "shadow", "labelColor", "border"];

  it("light tema stillarini qaytaradi", () => {
    const s = getThemeStyles("light");
    expect(s.color).toBe("#1a1a2e");
    expect(s.bg).toContain("#ffffff");
  });

  it("dark tema stillarini qaytaradi", () => {
    const s = getThemeStyles("dark");
    expect(s.color).toBe("#ecf0f1");
    expect(s.border).toBe("none");
  });

  it("noma'lum tema dark sifatida ishlaydi", () => {
    expect(getThemeStyles("unknown").color).toBe("#ecf0f1");
  });

  it("barcha kerakli xususiyatlar mavjud", () => {
    for (const theme of ["light", "dark"]) {
      const s = getThemeStyles(theme);
      for (const key of requiredKeys) expect(s).toHaveProperty(key);
    }
  });
});

describe("formatTime", () => {
  it("1 daqiqadan kam — 'hozirgina'", () => {
    expect(formatTime(Date.now())).toBe("hozirgina");
    expect(formatTime(Date.now() - 30000)).toBe("hozirgina");
  });

  it("daqiqalarni ko'rsatadi", () => {
    expect(formatTime(Date.now() - 5 * 60000)).toBe("5 daqiqa oldin");
    expect(formatTime(Date.now() - 59 * 60000)).toBe("59 daqiqa oldin");
  });

  it("soatlarni ko'rsatadi", () => {
    expect(formatTime(Date.now() - 2 * 3600000)).toBe("2 soat oldin");
    expect(formatTime(Date.now() - 23 * 3600000)).toBe("23 soat oldin");
  });

  it("kunlarni ko'rsatadi", () => {
    expect(formatTime(Date.now() - 3 * 86400000)).toBe("3 kun oldin");
  });
});

describe("isValidSelection", () => {
  it("2-5000 belgi orasidagi matnni qabul qiladi", () => {
    expect(isValidSelection("hi")).toBe(true);
    expect(isValidSelection("hello world")).toBe(true);
    expect(isValidSelection("a".repeat(5000))).toBe(true);
  });

  it("juda qisqa matnni rad etadi", () => {
    expect(isValidSelection("")).toBe(false);
    expect(isValidSelection("a")).toBe(false);
    expect(isValidSelection(" ")).toBe(false);
  });

  it("5000 belgidan ko'pni rad etadi", () => {
    expect(isValidSelection("a".repeat(5001))).toBe(false);
  });

  it("null, undefined, son uchun false qaytaradi", () => {
    expect(isValidSelection(null)).toBe(false);
    expect(isValidSelection(undefined)).toBe(false);
    expect(isValidSelection(123)).toBe(false);
  });

  it("trim qilgandan keyin tekshiradi", () => {
    expect(isValidSelection("  ab  ")).toBe(true);
    expect(isValidSelection("   ")).toBe(false);
  });
});
