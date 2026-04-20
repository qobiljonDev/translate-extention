import { describe, it, expect } from "vitest";
import { useTheme } from "../../src/composables/useTheme.js";

describe("useTheme", () => {
  it("default tema 'dark'", () => {
    const { theme } = useTheme();
    expect(theme.value).toBe("dark");
  });

  it("load() storage dan temani o'qiydi", () => {
    chrome.storage.sync._store.set("popupTheme", "light");
    const { theme, load } = useTheme();
    load();
    expect(theme.value).toBe("light");
  });

  it("load() storage da tema yo'q bo'lsa default qoladi", () => {
    const { theme, load } = useTheme();
    load();
    expect(theme.value).toBe("dark");
  });

  it("set() temani almashtiradi va saqlaydi", () => {
    const { theme, set } = useTheme();
    set("light");
    expect(theme.value).toBe("light");
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({ popupTheme: "light" });
  });

  it("toggle() dark va light orasida almashtiradi", () => {
    const { theme, toggle } = useTheme();
    expect(theme.value).toBe("dark");
    toggle();
    expect(theme.value).toBe("light");
    toggle();
    expect(theme.value).toBe("dark");
  });

  it("set() documentElement ga tegishli class qo'shadi", () => {
    const { set } = useTheme();
    set("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    set("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("light")).toBe(false);
  });
});
