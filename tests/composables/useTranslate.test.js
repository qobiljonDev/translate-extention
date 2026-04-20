import { describe, it, expect, vi, beforeEach } from "vitest";
import { useTranslate } from "../../src/composables/useTranslate.js";

describe("useTranslate", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("boshlang'ich holat bo'sh", () => {
    const { text, translated, detectedLang, loading } = useTranslate();
    expect(text.value).toBe("");
    expect(translated.value).toBe("");
    expect(detectedLang.value).toBe("");
    expect(loading.value).toBe(false);
  });

  it("muvaffaqiyatli tarjima qiladi", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([[["salom", "hello"]], null, "en"]),
    });
    const { text, translated, detectedLang, translate } = useTranslate();
    text.value = "hello";
    await translate("uz");
    expect(translated.value).toBe("salom");
    expect(detectedLang.value).toBe("en");
  });

  it("bo'sh matnda tarjima qilmaydi", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { text, translate } = useTranslate();
    text.value = "   ";
    await translate("uz");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("loading flag to'g'ri ishlaydi", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([[["salom"]], null, "en"]),
    });
    const { text, loading, translate } = useTranslate();
    text.value = "hello";
    const promise = translate("uz");
    expect(loading.value).toBe(true);
    await promise;
    expect(loading.value).toBe(false);
  });

  it("xatolikda offline cache'dan qidiradi", async () => {
    chrome.storage.local._store.set("offlineCache", {
      "hello_uz": { translated: "salom (offline)", detectedLang: "en" },
    });
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("network"));

    const { text, translated, translate } = useTranslate();
    text.value = "hello";
    await translate("uz");
    expect(translated.value).toBe("salom (offline)");
  });

  it("xatolikda offline cache'da yo'q bo'lsa fallback", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("network"));
    const { text, translated, translate } = useTranslate();
    text.value = "nothing";
    await translate("uz");
    expect(translated.value).toBe("Tarjima topilmadi");
  });

  it("clear() holatni tozalaydi", () => {
    const { text, translated, detectedLang, clear } = useTranslate();
    text.value = "hello";
    translated.value = "salom";
    detectedLang.value = "en";
    clear();
    expect(text.value).toBe("");
    expect(translated.value).toBe("");
    expect(detectedLang.value).toBe("");
  });

  it("muvaffaqiyatli tarjimani offline cache'ga saqlaydi", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([[["salom"]], null, "en"]),
    });
    const { text, translate } = useTranslate();
    text.value = "hello";
    await translate("uz");
    expect(chrome.storage.local.set).toHaveBeenCalled();
  });
});
