import { describe, it, expect } from "vitest";
import { useHistory } from "../../src/composables/useHistory.js";

describe("useHistory", () => {
  it("boshlang'ich ro'yxat bo'sh", () => {
    const { items } = useHistory();
    expect(items.value).toEqual([]);
  });

  it("load() storage dan tarixni o'qiydi", () => {
    const history = [
      { orig: "hello", trans: "salom" },
      { orig: "world", trans: "dunyo" },
    ];
    chrome.storage.local._store.set("history", history);
    const { items, load } = useHistory();
    load();
    expect(items.value).toEqual(history);
  });

  it("load() bo'sh storage'da bo'sh ro'yxat", () => {
    const { items, load } = useHistory();
    load();
    expect(items.value).toEqual([]);
  });

  it("clear() tarixni bo'shatadi", () => {
    chrome.storage.local._store.set("history", [{ orig: "x", trans: "y" }]);
    const { items, load, clear } = useHistory();
    load();
    clear();
    expect(items.value).toEqual([]);
    expect(chrome.storage.local.set).toHaveBeenCalledWith({ history: [] });
  });

  it("remove() bitta yozuvni o'chiradi", () => {
    chrome.storage.local._store.set("history", [
      { orig: "a", trans: "A" },
      { orig: "b", trans: "B" },
      { orig: "c", trans: "C" },
    ]);
    const { items, load, remove } = useHistory();
    load();
    remove(1);
    expect(items.value).toHaveLength(2);
    expect(items.value.map((i) => i.orig)).toEqual(["a", "c"]);
  });

  it("remove() storage ga yangilangan ro'yxatni yozadi", () => {
    chrome.storage.local._store.set("history", [{ orig: "a" }, { orig: "b" }]);
    const { load, remove } = useHistory();
    load();
    remove(0);
    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      history: [{ orig: "b" }],
    });
  });
});
