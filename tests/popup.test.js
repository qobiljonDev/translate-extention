import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import Popup from "../src/popup.vue";

// Chrome API mock
const storageSyncData = { targetLang: "uz" };
const storageLocalData = { history: [], favorites: [] };

globalThis.chrome = {
  storage: {
    sync: {
      get: vi.fn((keys, cb) => {
        if (typeof keys === "string") {
          cb({ [keys]: storageSyncData[keys] });
        } else {
          cb(storageSyncData);
        }
      }),
      set: vi.fn(),
    },
    local: {
      get: vi.fn((key, cb) => {
        if (typeof key === "string") {
          cb({ [key]: storageLocalData[key] });
        } else {
          cb(storageLocalData);
        }
      }),
      set: vi.fn(),
    },
  },
  runtime: {
    sendMessage: vi.fn(),
  },
};

// SpeechSynthesis mock
globalThis.speechSynthesis = {
  cancel: vi.fn(),
  speak: vi.fn(),
  getVoices: vi.fn(() => []),
};
globalThis.SpeechSynthesisUtterance = vi.fn();

// ==========================================
// Popup Component
// ==========================================
describe("Popup", () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = mount(Popup);
  });

  // ------------------------------------------
  // Render
  // ------------------------------------------
  describe("render", () => {
    it("sarlavha ko'rinadi", () => {
      expect(wrapper.text()).toContain("UZ Hover Translator");
    });

    it("3 ta tab mavjud", () => {
      const tabs = wrapper.findAll("button").filter((b) =>
        ["Tarjima", "Tarix", "Sevimlilar"].includes(b.text())
      );
      expect(tabs).toHaveLength(3);
    });

    it("default tab 'Tarjima'", () => {
      expect(wrapper.text()).toContain("Tarjima qilish");
      const input = wrapper.find("input[type='text']");
      expect(input.attributes("placeholder")).toContain("Matn kiriting");
    });
  });

  // ------------------------------------------
  // Tabs
  // ------------------------------------------
  describe("tabs", () => {
    it("Tarix tabga o'tish", async () => {
      const tarixTab = wrapper.findAll("button").find((b) => b.text() === "Tarix");
      await tarixTab.trigger("click");
      expect(wrapper.text()).toContain("Hali tarjimalar yo'q");
    });

    it("Sevimlilar tabga o'tish", async () => {
      const favTab = wrapper.findAll("button").find((b) => b.text() === "Sevimlilar");
      await favTab.trigger("click");
      expect(wrapper.text()).toContain("Sevimli so'zlar yo'q");
    });
  });

  // ------------------------------------------
  // Input
  // ------------------------------------------
  describe("input", () => {
    it("matn kiritish input mavjud", () => {
      const input = wrapper.find("input[type='text']");
      expect(input.exists()).toBe(true);
      expect(input.attributes("placeholder")).toContain("Matn kiriting");
    });

    it("bo'sh inputda tarjima tugmasi disabled", () => {
      const btn = wrapper.findAll("button").find((b) => b.text().includes("Tarjima qilish"));
      expect(btn.attributes("disabled")).toBeDefined();
    });

    it("matn kiritilganda tarjima tugmasi faollashadi", async () => {
      const input = wrapper.find("input[type='text']");
      await input.setValue("hello");
      const btn = wrapper.findAll("button").find((b) => b.text().includes("Tarjima qilish"));
      expect(btn.attributes("disabled")).toBeUndefined();
    });

    it("matn kiritilganda tozalash tugmasi ko'rinadi", async () => {
      const input = wrapper.find("input[type='text']");
      await input.setValue("test");
      // X tugma — svg ichidagi path
      const clearBtns = wrapper.findAll("button").filter((b) => {
        return b.find("svg") && !b.text() && b.element.closest(".relative");
      });
      expect(clearBtns.length).toBeGreaterThan(0);
    });
  });

  // ------------------------------------------
  // Language dropdown
  // ------------------------------------------
  describe("til tanlash", () => {
    it("dropdown tugmasi mavjud", () => {
      const dropdownBtn = wrapper.findAll("button").find((b) =>
        b.text().includes("O'zbek")
      );
      expect(dropdownBtn).toBeDefined();
    });

    it("dropdown bosilganda tillar ro'yxati ochiladi", async () => {
      const dropdownBtn = wrapper.findAll("button").find((b) =>
        b.text().includes("O'zbek")
      );
      await dropdownBtn.trigger("click");

      expect(wrapper.text()).toContain("Ingliz");
      expect(wrapper.text()).toContain("Rus");
      expect(wrapper.text()).toContain("Turk");
    });

    it("til tanlaganda dropdown yopiladi va storage yangilanadi", async () => {
      // Dropdown ochish
      const dropdownBtn = wrapper.findAll("button").find((b) =>
        b.text().includes("O'zbek")
      );
      await dropdownBtn.trigger("click");

      // Ingliz tilini tanlash
      const enOption = wrapper.findAll("button").find((b) => b.text().includes("Ingliz"));
      await enOption.trigger("click");

      expect(chrome.storage.sync.set).toHaveBeenCalledWith({ targetLang: "en" });
    });
  });

  // ------------------------------------------
  // Translation
  // ------------------------------------------
  describe("tarjima", () => {
    it("muvaffaqiyatli tarjima qiladi", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([[["salom"]], null, "en"]),
      });

      const input = wrapper.find("input[type='text']");
      await input.setValue("hello");

      const btn = wrapper.findAll("button").find((b) => b.text().includes("Tarjima qilish"));
      await btn.trigger("click");

      // fetch chaqirildi
      await vi.waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalled();
      });
    });

    it("Enter tugmasi tarjima qiladi", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([[["salom"]], null, "en"]),
      });

      const input = wrapper.find("input[type='text']");
      await input.setValue("hello");
      await input.trigger("keyup.enter");

      await vi.waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalled();
      });
    });
  });

  // ------------------------------------------
  // History tab
  // ------------------------------------------
  describe("tarix", () => {
    it("tarix bor bo'lsa ko'rsatadi", async () => {
      storageLocalData.history = [
        {
          original: "hello",
          translated: "salom",
          detectedLang: "en",
          targetLang: "uz",
          timestamp: Date.now() - 60000,
        },
      ];

      const w = mount(Popup);
      await w.vm.$nextTick();

      const tarixTab = w.findAll("button").find((b) => b.text() === "Tarix");
      await tarixTab.trigger("click");

      expect(w.text()).toContain("1 ta tarjima");

      // Cleanup
      storageLocalData.history = [];
    });
  });

  // ------------------------------------------
  // Page translation
  // ------------------------------------------
  describe("sahifa tarjimasi", () => {
    it("sahifa tarjima tugmasi mavjud", () => {
      const pageBtn = wrapper.findAll("button").find((b) =>
        b.attributes("title")?.includes("Sahifani tarjima")
      );
      expect(pageBtn).toBeDefined();
    });
  });
});
