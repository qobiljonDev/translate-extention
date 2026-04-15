/** Tema composable — qorong'u/yorug' tema (holat boshqaruvi) */

import { ref } from "vue";
import { storage } from "../services/chrome.js";

function applyThemeClass(value) {
  const el = document.documentElement;
  el.classList.toggle("dark", value === "dark");
  el.classList.toggle("light", value === "light");
}

export function useTheme() {
  const theme = ref("dark");

  function load() {
    storage.sync.get("popupTheme", (result) => {
      if (result.popupTheme) theme.value = result.popupTheme;
      applyThemeClass(theme.value);
    });
  }

  function set(value) {
    theme.value = value;
    applyThemeClass(value);
    storage.sync.set({ popupTheme: value });
  }

  function toggle() {
    set(theme.value === "dark" ? "light" : "dark");
  }

  return { theme, load, toggle, set };
}
