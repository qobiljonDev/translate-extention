/** Tarix composable — tarix bilan ishlash */

import { ref } from "vue";
import { storage } from "../services/chrome.js";
import { exportData, importData } from "../services/export.js";

export function useHistory() {
  const items = ref([]);

  function load() {
    storage.local.get("history", (result) => {
      items.value = result.history || [];
    });
  }

  function clear() {
    storage.local.set({ history: [] });
    items.value = [];
  }

  function remove(index) {
    items.value.splice(index, 1);
    storage.local.set({ history: [...items.value] });
  }

  function doExport() {
    exportData("history", "tarjima-tarix");
  }

  function doImport() {
    importData("history", (data) => {
      if (data) items.value = data;
    });
  }

  return { items, load, clear, remove, doExport, doImport };
}
