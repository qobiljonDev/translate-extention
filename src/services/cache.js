/** Cache xizmati — xotiradagi va doimiy (offline) cache */

import { storage } from "./chrome.js";

// LRU Cache (in-memory)
export class LRUCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    return this.cache.get(key);
  }
  has(key) {
    return this.cache.has(key);
  }

  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  get size() {
    return this.cache.size;
  }
  clear() {
    this.cache.clear();
  }
}

// Persistent offline cache (chrome.storage)
const OFFLINE_CACHE_KEY = "offlineCache";
const MAX_OFFLINE = 500;

export function getOfflineCache(callback) {
  storage.local.get(OFFLINE_CACHE_KEY, (result) => {
    callback(result[OFFLINE_CACHE_KEY] || {});
  });
}

export function saveToOfflineCache(key, value) {
  storage.local.get(OFFLINE_CACHE_KEY, (result) => {
    const cache = result[OFFLINE_CACHE_KEY] || {};
    const keys = Object.keys(cache);
    if (keys.length >= MAX_OFFLINE) {
      delete cache[keys[0]];
    }
    cache[key] = value;
    storage.local.set({ [OFFLINE_CACHE_KEY]: cache });
  });
}

export function clearOfflineCache() {
  storage.local.set({ [OFFLINE_CACHE_KEY]: {} });
}
