/** Tema composable — qorong'u/yorug' tema */

import { ref } from "vue";
import { storage } from "../services/chrome.js";

export function useTheme() {
  const theme = ref("dark");

  function load() {
    storage.sync.get("popupTheme", (result) => {
      if (result.popupTheme) theme.value = result.popupTheme;
    });
  }

  function toggle() {
    theme.value = theme.value === "dark" ? "light" : "dark";
    storage.sync.set({ popupTheme: theme.value });
  }

  function set(value) {
    theme.value = value;
    storage.sync.set({ popupTheme: value });
  }

  return { theme, load, toggle, set };
}
