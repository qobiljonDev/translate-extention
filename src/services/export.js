/** Export/Import xizmati — tarix va sevimlilarni JSON formatida */

import { storage } from "./chrome.js";

export function exportData(key, filename) {
  storage.local.get(key, (result) => {
    const data = result[key] || [];
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

export function importData(key, callback) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!Array.isArray(data)) throw new Error("Invalid format");
        storage.local.get(key, (result) => {
          const existing = result[key] || [];
          const merged = [...data, ...existing];
          const unique = merged.filter((item, idx, arr) =>
            arr.findIndex((i) => i.original === item.original && i.targetLang === item.targetLang) === idx
          );
          storage.local.set({ [key]: unique });
          callback(unique);
        });
      } catch {
        callback(null, "Fayl formati noto'g'ri");
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

export function exportAll() {
  storage.local.get(["history", "favorites"], (result) => {
    const data = {
      history: result.history || [],
      favorites: result.favorites || [],
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uz-translator-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
}
