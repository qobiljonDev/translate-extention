import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";

// Chrome API mock — chrome.js wrapper uchun
const storageSyncData = { targetLang: "uz" };
const storageLocalData = { history: [], favorites: [] };

globalThis.chrome = {
  storage: {
    sync: {
      get: vi.fn((keys, cb) => {
        if (typeof keys === "string") {
          cb({ [keys]: storageSyncData[keys] });
        } else if (Array.isArray(keys)) {
          const result = {};
          keys.forEach((k) => { result[k] = storageSyncData[k]; });
          cb(result);
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
    onChanged: {
      addListener: vi.fn(),
    },
  },
  runtime: {
    sendMessage: vi.fn(),
    onMessage: { addListener: vi.fn() },
    get lastError() { return null; },
  },
};

// SpeechSynthesis mock
globalThis.speechSynthesis = {
  cancel: vi.fn(),
  speak: vi.fn(),
  getVoices: vi.fn(() => []),
};
globalThis.SpeechSynthesisUtterance = vi.fn();

// Import AFTER mock is set
const { default: Popup } = await import("../src/popup.vue");

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
      const tabTexts = ["Tarjima", "Tarix", "Sevimlilar"];
      for (const t of tabTexts) {
        const found = wrapper.findAll("button").find((b) => b.text().includes(t));
        expect(found, `Tab "${t}" topilmadi`).toBeDefined();
      }
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
      const tarixTab = wrapper.findAll("button").find((b) => b.text().includes("Tarix"));
      await tarixTab.trigger("click");
      expect(wrapper.text()).toContain("Hali tarjimalar yo'q");
    });

    it("Sevimlilar tabga o'tish", async () => {
      const favTab = wrapper.findAll("button").find((b) => b.text().includes("Sevimlilar"));
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
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain("Ingliz");
      expect(wrapper.text()).toContain("Rus");
      expect(wrapper.text()).toContain("Turk");
    });

    it("til tanlaganda storage yangilanadi", async () => {
      const dropdownBtn = wrapper.findAll("button").find((b) =>
        b.text().includes("O'zbek")
      );
      await dropdownBtn.trigger("click");
      await wrapper.vm.$nextTick();

      const enOption = wrapper.findAll("button").find((b) => b.text().includes("Ingliz"));
      await enOption.trigger("click");

      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();
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
      // Storage mock'ni yangilash
      const origGet = chrome.storage.local.get;
      chrome.storage.local.get = vi.fn((key, cb) => {
        cb({
          history: [{
            original: "hello",
            translated: "salom",
            detectedLang: "en",
            targetLang: "uz",
            timestamp: Date.now() - 60000,
          }],
        });
      });

      const w = mount(Popup);
      const tarixTab = w.findAll("button").find((b) => b.text().includes("Tarix"));
      await tarixTab.trigger("click");
      await w.vm.$nextTick();

      expect(w.text()).toContain("1 ta tarjima");

      // Restore
      chrome.storage.local.get = origGet;
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
