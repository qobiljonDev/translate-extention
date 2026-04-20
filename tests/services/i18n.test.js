import { describe, it, expect } from "vitest";
import { currentUILang, loadUILang, setUILang, t, uiLanguages } from "../../src/services/i18n.js";

describe("i18n", () => {
  it("3 ta UI tili bor (uz, en, ru)", () => {
    const codes = uiLanguages.map((l) => l.code);
    expect(codes).toEqual(["uz", "en", "ru"]);
  });

  it("default til uz", () => {
    expect(currentUILang.value).toBe("uz");
  });

  it("t() mavjud kalitni qaytaradi", () => {
    setUILang("uz");
    expect(t("translateTab")).toBe("Tarjima");
    expect(t("historyTab")).toBe("Tarix");
  });

  it("setUILang tilni almashtiradi", () => {
    setUILang("en");
    expect(currentUILang.value).toBe("en");
    expect(t("translateTab")).toBe("Translate");

    setUILang("ru");
    expect(t("translateTab")).toBe("Перевод");
  });

  it("noma'lum kalit uchun kalitning o'zini qaytaradi", () => {
    setUILang("en");
    expect(t("unknownKey")).toBe("unknownKey");
  });

  it("setUILang storage ga saqlaydi", () => {
    setUILang("en");
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({ uiLang: "en" });
  });

  it("loadUILang storage dan o'qiydi", () => {
    chrome.storage.sync._store.set("uiLang", "ru");
    loadUILang();
    expect(currentUILang.value).toBe("ru");
  });
});
