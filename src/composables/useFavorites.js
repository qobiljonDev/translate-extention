/** Sevimlilar composable */

import { ref } from "vue";
import { storage } from "../services/chrome.js";
import { exportData, importData } from "../services/export.js";

export function useFavorites() {
  const items = ref([]);

  function load() {
    storage.local.get("favorites", (result) => {
      items.value = result.favorites || [];
    });
  }

  function clear() {
    storage.local.set({ favorites: [] });
    items.value = [];
  }

  function remove(index) {
    items.value.splice(index, 1);
    storage.local.set({ favorites: [...items.value] });
  }

  function doExport() {
    exportData("favorites", "sevimlilar");
  }

  function doImport() {
    importData("favorites", (data) => {
      if (data) items.value = data;
    });
  }

  return { items, load, clear, remove, doExport, doImport };
}
