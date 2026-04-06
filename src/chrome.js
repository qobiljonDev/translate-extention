/**
 * Chrome API wrapper — dev serverda xato chiqmasligi uchun
 * Extension ichida haqiqiy chrome API ishlatadi
 * Localhost/dev da fallback qiymatlar qaytaradi
 */

const isExtension = typeof chrome !== "undefined" && chrome.storage;

export const storage = {
  sync: {
    get(keys, callback) {
      if (isExtension) {
        chrome.storage.sync.get(keys, callback);
      } else {
        callback({});
      }
    },
    set(data) {
      if (isExtension) {
        chrome.storage.sync.set(data);
      }
    },
  },
  local: {
    get(key, callback) {
      if (isExtension) {
        chrome.storage.local.get(key, callback);
      } else {
        callback({});
      }
    },
    set(data) {
      if (isExtension) {
        chrome.storage.local.set(data);
      }
    },
  },
  onChanged: {
    addListener(callback) {
      if (isExtension) {
        chrome.storage.onChanged.addListener(callback);
      }
    },
  },
};

export const runtime = {
  sendMessage(message) {
    if (isExtension) {
      chrome.runtime.sendMessage(message);
    }
  },
  onMessage: {
    addListener(callback) {
      if (isExtension) {
        chrome.runtime.onMessage.addListener(callback);
      }
    },
  },
  get lastError() {
    return isExtension ? chrome.runtime.lastError : null;
  },
};
