/** Tooltip UI moduli */

import { getLangName } from "../services/config.js";
import { detectTheme, getThemeStyles } from "../services/utils.js";
import state from "./state.js";
import { speakText } from "./tts.js";
import { saveToHistory, toggleFavorite, checkIsFavorite } from "./storage.js";

/** Tooltip'ni yopish (pinned bo'lsa yopmaydi) */
export function hideTooltip() {
  if (state.isPinned) return;
  removeTooltip();
}

/** Tooltip'ni majburiy yopish */
export function forceHideTooltip() {
  state.isPinned = false;
  removeTooltip();
}

function removeTooltip() {
  if (state.tooltip) {
    state.tooltip.remove();
    state.tooltip = null;
  }
}

/** Sahifa temasini aniqlash */
function getPageTheme() {
  if (state.tooltipTheme !== "auto") return state.tooltipTheme;
  try {
    const bg = window.getComputedStyle(document.body).backgroundColor;
    return detectTheme(bg);
  } catch {}
  return "dark";
}

/** SVG tugma yaratish */
function createButton(svgHTML, title, bgDefault, bgHover) {
  const btn = document.createElement("button");
  btn.innerHTML = svgHTML;
  btn.title = title;
  btn.setAttribute("aria-label", title);
  Object.assign(btn.style, {
    background: bgDefault,
    border: "none",
    color: "inherit",
    cursor: "pointer",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    padding: "0",
  });
  btn.addEventListener("mouseup", (e) => e.stopPropagation());
  btn.addEventListener("mouseenter", () => {
    btn.style.background = bgHover;
    btn.style.transform = "scale(1.1)";
  });
  btn.addEventListener("mouseleave", () => {
    if (!btn.dataset.active) btn.style.background = bgDefault;
    btn.style.transform = "scale(1)";
  });
  return btn;
}

// SVG iconlar
const ICONS = {
  speaker: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="currentColor"/></svg>`,
  play: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="currentColor"/></svg>`,
  copy: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/></svg>`,
  check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#4CAF50"/></svg>`,
  pin: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M14 4v5c0 1.12.37 2.16 1 3H9c.65-.86 1-1.9 1-3V4h4zm3-2H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3V4h1c.55 0 1-.45 1-1s-.45-1-1-1z" fill="currentColor"/></svg>`,
  star: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor"/></svg>`,
  close: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/></svg>`,
};

/** Tooltip tugmalarini yaratish */
function createTooltipButtons(styles, text, originalText, detectedLang) {
  const playOriginalBtn = createButton(ICONS.speaker, "Asl matnni tinglash", styles.btnBg, styles.btnHover);
  playOriginalBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    speakText(originalText, detectedLang);
  });

  const playTranslatedBtn = createButton(ICONS.play, "Tarjimani tinglash", "rgba(76,175,80,0.3)", "rgba(76,175,80,0.5)");
  playTranslatedBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    speakText(text, state.targetLang);
  });

  const copyBtn = createButton(ICONS.copy, "Nusxalash", styles.btnBg, styles.btnHover);
  copyBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.innerHTML = ICONS.check;
      setTimeout(() => { copyBtn.innerHTML = ICONS.copy; }, 1500);
    }).catch(() => {
      // Fallback: execCommand
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
      copyBtn.innerHTML = ICONS.check;
      setTimeout(() => { copyBtn.innerHTML = ICONS.copy; }, 1500);
    });
  });

  const pinBtn = createButton(ICONS.pin, "Qotirish", styles.btnBg, styles.btnHover);
  pinBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    state.isPinned = !state.isPinned;
    pinBtn.style.color = state.isPinned ? "#3498db" : "";
    pinBtn.style.background = state.isPinned ? "rgba(52,152,219,0.2)" : styles.btnBg;
  });

  const favBtn = createButton(ICONS.star, "Sevimlilarga qo'shish", styles.btnBg, styles.btnHover);
  checkIsFavorite(originalText, (isFav) => {
    if (isFav) {
      favBtn.style.color = "#f1c40f";
      favBtn.title = "Sevimlilardan olib tashlash";
    }
  });
  favBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFavorite(originalText, text, detectedLang, favBtn);
  });

  const closeBtn = createButton(ICONS.close, "Yopish", styles.btnBg, "rgba(244,67,54,0.3)");
  closeBtn.style.width = "28px";
  closeBtn.style.height = "28px";
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    window.speechSynthesis.cancel();
    forceHideTooltip();
  });

  return [playOriginalBtn, playTranslatedBtn, copyBtn, pinBtn, favBtn, closeBtn];
}

/** Tooltip ko'rsatish */
export function showTooltip(x, y, text, originalText, detectedLang) {
  forceHideTooltip();

  const theme = getPageTheme();
  const styles = getThemeStyles(theme);

  const el = document.createElement("div");
  el.className = "uz-translator-tooltip";
  el.setAttribute("role", "tooltip");

  // Ekran chegaralarini hisobga olgan pozitsiya
  const tooltipWidth = 280;
  const tooltipHeight = 150;
  let posX = x + 10;
  let posY = y + 10;

  if (posX + tooltipWidth > window.innerWidth) posX = window.innerWidth - tooltipWidth - 10;
  if (posX < 10) posX = 10;
  if (posY + tooltipHeight > window.innerHeight) posY = y - tooltipHeight - 10;
  if (posY < 10) posY = 10;

  Object.assign(el.style, {
    all: "initial",
    position: "fixed",
    left: `${posX}px`,
    top: `${posY}px`,
    background: styles.bg,
    color: styles.color,
    padding: "12px 16px",
    borderRadius: "10px",
    zIndex: "2147483647",
    fontSize: "14px",
    fontFamily: "system-ui, sans-serif",
    maxWidth: "280px",
    boxShadow: styles.shadow,
    border: styles.border,
    backdropFilter: "blur(10px)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    pointerEvents: "auto",
    cursor: "default",
    lineHeight: "1.4",
    wordWrap: "break-word",
    animation: "uzTranslatorFadeIn 0.2s ease-out",
  });

  // Til labeli
  const fromName = getLangName(detectedLang);
  const toName = getLangName(state.targetLang);
  const langLabel = document.createElement("div");
  langLabel.textContent = `${fromName} → ${toName}`;
  Object.assign(langLabel.style, {
    fontSize: "11px",
    color: styles.labelColor,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  });

  // Tarjima matni
  const translatedText = document.createElement("div");
  translatedText.textContent = text;
  translatedText.style.fontWeight = "500";

  // Tugmalar
  const buttons = createTooltipButtons(styles, text, originalText, detectedLang);
  const buttonContainer = document.createElement("div");
  Object.assign(buttonContainer.style, {
    display: "flex",
    gap: "6px",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "2px",
  });
  buttons.forEach((btn) => buttonContainer.appendChild(btn));

  el.appendChild(langLabel);
  el.appendChild(translatedText);
  el.appendChild(buttonContainer);
  document.body.appendChild(el);

  state.tooltip = el;
  saveToHistory(originalText, text, detectedLang);
  injectTooltipStyles();
}

/** Tooltip CSS animatsiyasi (bir marta inject, unique nom) */
function injectTooltipStyles() {
  if (document.querySelector("#uz-translator-style")) return;

  const style = document.createElement("style");
  style.id = "uz-translator-style";
  style.textContent = `
    @keyframes uzTranslatorFadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .uz-translator-tooltip:hover {
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4) !important;
    }
  `;
  document.head.appendChild(style);
}
