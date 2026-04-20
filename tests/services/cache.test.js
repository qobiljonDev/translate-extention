import { describe, it, expect, vi } from "vitest";
import {
  LRUCache,
  getOfflineCache,
  saveToOfflineCache,
  clearOfflineCache,
} from "../../src/services/cache.js";

describe("LRUCache", () => {
  it("saqlaydi va qaytaradi", () => {
    const cache = new LRUCache();
    cache.set("hello_uz", { translated: "salom", detectedLang: "en" });
    expect(cache.has("hello_uz")).toBe(true);
    expect(cache.get("hello_uz")).toEqual({ translated: "salom", detectedLang: "en" });
  });

  it("mavjud bo'lmagan kalit uchun undefined", () => {
    const cache = new LRUCache();
    expect(cache.has("x")).toBe(false);
    expect(cache.get("x")).toBeUndefined();
  });

  it("maksimal hajmdan oshsa eng eski yozuvni o'chiradi", () => {
    const cache = new LRUCache(3);
    cache.set("a", 1);
    cache.set("b", 2);
    cache.set("c", 3);
    cache.set("d", 4);
    expect(cache.size).toBe(3);
    expect(cache.has("a")).toBe(false);
    expect(cache.has("d")).toBe(true);
  });

  it("clear() barcha yozuvlarni o'chiradi", () => {
    const cache = new LRUCache();
    cache.set("a", 1);
    cache.set("b", 2);
    cache.clear();
    expect(cache.size).toBe(0);
  });

  it("default max size 100", () => {
    const cache = new LRUCache();
    for (let i = 0; i < 105; i++) cache.set(`k${i}`, i);
    expect(cache.size).toBe(100);
    expect(cache.has("k0")).toBe(false);
    expect(cache.has("k104")).toBe(true);
  });
});

describe("Offline cache (chrome.storage)", () => {
  it("getOfflineCache bo'sh obyekt qaytaradi agar saqlanmagan bo'lsa", () => {
    const cb = vi.fn();
    getOfflineCache(cb);
    expect(cb).toHaveBeenCalledWith({});
  });

  it("saveToOfflineCache yozadi va qayta o'qishda qaytadi", () => {
    saveToOfflineCache("hello_uz", { translated: "salom" });
    const cb = vi.fn();
    getOfflineCache(cb);
    expect(cb).toHaveBeenCalledWith({ hello_uz: { translated: "salom" } });
  });

  it("500 yozuvdan oshganda eng eskisini o'chiradi", () => {
    for (let i = 0; i < 505; i++) {
      saveToOfflineCache(`k${i}`, i);
    }
    const cb = vi.fn();
    getOfflineCache(cb);
    const cache = cb.mock.calls[0][0];
    expect(Object.keys(cache).length).toBeLessThanOrEqual(500);
    expect(cache.k504).toBe(504);
  });

  it("clearOfflineCache bo'shatadi", () => {
    saveToOfflineCache("a", 1);
    clearOfflineCache();
    const cb = vi.fn();
    getOfflineCache(cb);
    expect(cb).toHaveBeenCalledWith({});
  });
});
