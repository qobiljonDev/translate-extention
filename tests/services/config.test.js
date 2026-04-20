import { describe, it, expect } from "vitest";
import { languages, getLangName, getTtsLang, getFlag } from "../../src/services/config.js";

describe("languages", () => {
  it("6 ta asosiy tilni o'z ichiga oladi", () => {
    expect(Object.keys(languages)).toEqual(
      expect.arrayContaining(["uz", "en", "ru", "tr", "ar", "fr"])
    );
  });

  it("har bir tilda label, name, flag, tts bor", () => {
    for (const lang of Object.values(languages)) {
      expect(lang).toHaveProperty("label");
      expect(lang).toHaveProperty("name");
      expect(lang).toHaveProperty("flag");
      expect(lang).toHaveProperty("tts");
    }
  });
});

describe("getLangName", () => {
  it("asosiy tillarni qaytaradi", () => {
    expect(getLangName("en")).toBe("English");
    expect(getLangName("uz")).toBe("O'zbek");
    expect(getLangName("ru")).toBe("Русский");
    expect(getLangName("fr")).toBe("Français");
  });

  it("qo'shimcha tillarni qaytaradi", () => {
    expect(getLangName("de")).toBe("Deutsch");
    expect(getLangName("ja")).toBe("日本語");
    expect(getLangName("zh")).toBe("中文");
  });

  it("noma'lum til uchun kodni qaytaradi", () => {
    expect(getLangName("xx")).toBe("xx");
    expect(getLangName("")).toBe("");
  });
});

describe("getTtsLang", () => {
  it("IETF formatni qaytaradi", () => {
    expect(getTtsLang("uz")).toBe("uz-UZ");
    expect(getTtsLang("en")).toBe("en-US");
    expect(getTtsLang("ru")).toBe("ru-RU");
  });

  it("barcha asosiy tillar uchun to'g'ri format", () => {
    for (const code of Object.keys(languages)) {
      expect(getTtsLang(code)).toMatch(/^[a-z]{2}-[A-Z]{2}$/);
    }
  });

  it("noma'lum til uchun en-US qaytaradi", () => {
    expect(getTtsLang("xx")).toBe("en-US");
    expect(getTtsLang("de")).toBe("en-US");
  });
});

describe("getFlag", () => {
  it("flagcdn URL qaytaradi", () => {
    expect(getFlag("uz")).toBe("https://flagcdn.com/w40/uz.png");
    expect(getFlag("en")).toBe("https://flagcdn.com/w40/us.png");
  });

  it("noma'lum til uchun kodni ishlatadi", () => {
    expect(getFlag("xx")).toBe("https://flagcdn.com/w40/xx.png");
  });
});
