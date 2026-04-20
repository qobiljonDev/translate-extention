import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchTranslation, fetchBatchTranslation } from "../../src/services/translate.js";

describe("fetchTranslation", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("muvaffaqiyatli tarjimani qaytaradi", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([[["salom", "hello"]], null, "en"]),
    });
    const result = await fetchTranslation("hello", "uz");
    expect(result.translated).toBe("salom");
    expect(result.detectedLang).toBe("en");
  });

  it("bir nechta bo'laklarni qo'shib qaytaradi", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve([[["salom ", "hello "], ["dunyo", "world"]], null, "en"]),
    });
    const result = await fetchTranslation("hello world", "uz");
    expect(result.translated).toBe("salom dunyo");
  });

  it("429 xatosida rate limit xabari", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({ ok: false, status: 429 });
    const result = await fetchTranslation("hello", "uz");
    expect(result.rateLimited).toBe(true);
    expect(result.translated).toContain("limitiga");
  });

  it("boshqa HTTP xatosida throw qiladi", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(fetchTranslation("hello", "uz")).rejects.toThrow("HTTP");
  });

  it("bo'sh javobda fallback qaytaradi", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([null, null, null]),
    });
    const result = await fetchTranslation("hello", "uz");
    expect(result.translated).toBe("Tarjima topilmadi");
    expect(result.detectedLang).toBe("en");
  });

  it("to'g'ri URL ishlatadi", async () => {
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([[["x"]], null, "en"]),
    });
    await fetchTranslation("hello world", "uz");
    const url = spy.mock.calls[0][0];
    expect(url).toContain("tl=uz");
    expect(url).toContain("q=hello%20world");
    expect(url).toContain("sl=auto");
  });
});

describe("fetchBatchTranslation", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("faqat matnni qaytaradi (obyekt emas)", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([[["salom", "hello"]], null, "en"]),
    });
    const result = await fetchBatchTranslation("hello", "uz");
    expect(result).toBe("salom");
  });
});
