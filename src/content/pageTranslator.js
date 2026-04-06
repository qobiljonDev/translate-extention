/** Butun sahifani tarjima qilish moduli */

import state from "./state.js";
import { translateBatch } from "./translator.js";

const SKIP_TAGS = ["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA"];
const BATCH_SIZE = 10;
const BATCH_DELAY = 300;

let isPageTranslated = false;
let isTranslatingPage = false;
let originalTexts = [];

/** Sahifadagi barcha text node'larni topish */
function collectTextNodes() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (SKIP_TAGS.includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (node.textContent.trim().length < 2) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}

/** Progress indikator yaratish */
function createProgressUI() {
  // Eski progress bo'lsa o'chirish
  document.getElementById("uz-translate-progress")?.remove();

  const el = document.createElement("div");
  el.id = "uz-translate-progress";
  Object.assign(el.style, {
    all: "initial",
    position: "fixed",
    top: "20px",
    right: "20px",
    background: "linear-gradient(135deg, #2c3e50, #34495e)",
    color: "#ecf0f1",
    padding: "12px 20px",
    borderRadius: "10px",
    zIndex: "2147483647",
    fontSize: "14px",
    fontFamily: "system-ui, sans-serif",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  });
  el.innerHTML = `<span>Sahifa tarjima qilinmoqda... 0%</span>`;
  document.body.appendChild(el);
  return el;
}

/** "Asl holatga qaytarish" tugmasi */
function createRestoreButton() {
  const btn = document.createElement("div");
  btn.id = "uz-restore-page-btn";
  Object.assign(btn.style, {
    all: "initial",
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: "linear-gradient(135deg, #e74c3c, #c0392b)",
    color: "#fff",
    padding: "10px 18px",
    borderRadius: "25px",
    zIndex: "2147483647",
    fontSize: "13px",
    fontFamily: "system-ui, sans-serif",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(231, 76, 60, 0.4)",
    transition: "all 0.2s ease",
    userSelect: "none",
  });
  btn.textContent = "Asl holatga qaytarish";
  btn.addEventListener("mouseenter", () => { btn.style.transform = "scale(1.05)"; });
  btn.addEventListener("mouseleave", () => { btn.style.transform = "scale(1)"; });
  btn.addEventListener("click", restorePage);
  document.body.appendChild(btn);
}

/** Sahifani tarjima qilish */
export async function translatePage() {
  if (isPageTranslated) { restorePage(); return; }
  if (isTranslatingPage) return; // Takroriy chaqiruvlarni bloklash

  const textNodes = collectTextNodes();
  if (textNodes.length === 0) return;

  isTranslatingPage = true;
  const progress = createProgressUI();
  originalTexts = [];
  let translated = 0;
  let retryDelay = BATCH_DELAY;

  for (let i = 0; i < textNodes.length; i += BATCH_SIZE) {
    const batch = textNodes.slice(i, i + BATCH_SIZE);
    const combined = batch.map((n) => n.textContent.trim()).join("\n");

    try {
      const translatedText = await translateBatch(combined, state.targetLang);
      const splitResults = translatedText.split("\n");

      batch.forEach((node, idx) => {
        originalTexts.push({ node, original: node.textContent });
        if (splitResults[idx]) node.textContent = splitResults[idx];
      });
      retryDelay = BATCH_DELAY; // Muvaffaqiyatli — delay'ni qaytarish
    } catch (e) {
      // Rate limit bo'lsa kutish vaqtini oshirish
      if (e?.message?.includes("429")) {
        retryDelay = Math.min(retryDelay * 2, 5000);
      }
      console.warn("Batch tarjima xatosi:", e);
    }

    translated += batch.length;
    const percent = Math.round((translated / textNodes.length) * 100);
    const span = progress.querySelector("span");
    if (span) span.textContent = `Sahifa tarjima qilinmoqda... ${percent}%`;
    await new Promise((r) => setTimeout(r, retryDelay));
  }

  progress.remove();
  isPageTranslated = true;
  isTranslatingPage = false;
  createRestoreButton();
}

/** Sahifani asl holatga qaytarish */
export function restorePage() {
  originalTexts.forEach(({ node, original }) => { node.textContent = original; });
  originalTexts = [];
  isPageTranslated = false;
  isTranslatingPage = false;
  document.getElementById("uz-translate-progress")?.remove();
  document.getElementById("uz-restore-page-btn")?.remove();
}
