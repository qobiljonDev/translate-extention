/** Content script uchun umumiy holat (state) */

export let targetLang = "uz";
export let tooltipTheme = "auto";
export let tooltip = null;
export let isPinned = false;

export function setTargetLang(lang) {
  targetLang = lang;
}

export function setTooltipTheme(theme) {
  tooltipTheme = theme;
}

export function setTooltip(el) {
  tooltip = el;
}

export function setIsPinned(val) {
  isPinned = val;
}

/** Chrome storage'dan sozlamalarni yuklash */
export function initSettings() {
  try {
    chrome.storage.sync.get(["targetLang", "tooltipTheme"], (result) => {
      if (result.targetLang) targetLang = result.targetLang;
      if (result.tooltipTheme) tooltipTheme = result.tooltipTheme;
    });
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.targetLang) targetLang = changes.targetLang.newValue;
      if (changes.tooltipTheme) tooltipTheme = changes.tooltipTheme.newValue;
    });
  } catch {}
}
