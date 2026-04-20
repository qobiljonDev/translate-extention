import { vi, beforeEach } from "vitest";

function createStorageArea() {
  const store = new Map();
  return {
    _store: store,
    get: vi.fn((keys, cb) => {
      const result = {};
      if (typeof keys === "string") {
        if (store.has(keys)) result[keys] = store.get(keys);
      } else if (Array.isArray(keys)) {
        for (const k of keys) if (store.has(k)) result[k] = store.get(k);
      } else if (keys && typeof keys === "object") {
        for (const k of Object.keys(keys)) {
          result[k] = store.has(k) ? store.get(k) : keys[k];
        }
      }
      cb(result);
    }),
    set: vi.fn((data) => {
      for (const [k, v] of Object.entries(data)) store.set(k, v);
    }),
    clear: vi.fn(() => store.clear()),
  };
}

function createChromeMock() {
  return {
    runtime: {
      id: "test-extension-id",
      lastError: null,
      sendMessage: vi.fn(),
      onMessage: { addListener: vi.fn() },
    },
    storage: {
      sync: createStorageArea(),
      local: createStorageArea(),
      onChanged: { addListener: vi.fn() },
    },
    tabs: {
      query: vi.fn((_q, cb) => cb([{ id: 1, url: "https://example.com" }])),
    },
  };
}

globalThis.chrome = createChromeMock();

globalThis.speechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  getVoices: vi.fn(() => []),
};

beforeEach(() => {
  globalThis.chrome = createChromeMock();
  vi.clearAllMocks();
});
