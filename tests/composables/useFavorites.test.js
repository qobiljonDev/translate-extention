import { describe, it, expect } from "vitest";
import { useFavorites } from "../../src/composables/useFavorites.js";

describe("useFavorites", () => {
  it("boshlang'ich ro'yxat bo'sh", () => {
    const { items } = useFavorites();
    expect(items.value).toEqual([]);
  });

  it("load() storage dan sevimlilarni o'qiydi", () => {
    const favs = [{ orig: "hi", trans: "salom" }];
    chrome.storage.local._store.set("favorites", favs);
    const { items, load } = useFavorites();
    load();
    expect(items.value).toEqual(favs);
  });

  it("clear() sevimlilarni bo'shatadi", () => {
    chrome.storage.local._store.set("favorites", [{ orig: "x" }]);
    const { items, load, clear } = useFavorites();
    load();
    clear();
    expect(items.value).toEqual([]);
    expect(chrome.storage.local.set).toHaveBeenCalledWith({ favorites: [] });
  });

  it("remove() bitta yozuvni o'chiradi", () => {
    chrome.storage.local._store.set("favorites", [
      { orig: "a" },
      { orig: "b" },
      { orig: "c" },
    ]);
    const { items, load, remove } = useFavorites();
    load();
    remove(2);
    expect(items.value.map((i) => i.orig)).toEqual(["a", "b"]);
  });
});
