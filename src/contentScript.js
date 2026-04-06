let tooltip = null;
let isTranslating = false;

// Cache va rate limiting
const translationCache = new Map();
const MAX_CACHE_SIZE = 100;
const RATE_LIMIT_DELAY = 1000;
let lastRequestTime = 0;

// Tilni chrome.storage'dan olish
let targetLang = "uz";
try {
  chrome.storage.sync.get("targetLang", (result) => {
    if (result.targetLang) targetLang = result.targetLang;
  });
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.targetLang) targetLang = changes.targetLang.newValue;
  });
} catch {
  // fallback
}

function hideTooltip() {
  if (tooltip) {
    tooltip.remove();
    tooltip = null;
  }
}

function hasValidSelection() {
  const selection = window.getSelection();
  return selection.rangeCount > 0 && selection.toString().trim().length > 0;
}

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

async function translateText(text, lang) {
  if (isTranslating) return null;

  const cacheKey = `${text}_${lang}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise((resolve) =>
      setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest)
    );
  }

  isTranslating = true;
  lastRequestTime = Date.now();

  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`
    );

    if (!response.ok) {
      if (response.status === 429) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        isTranslating = false;
        return "Tarjima limitiga yetildi, biroz kutib turing...";
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const translated = data?.[0]?.[0]?.[0] || "Tarjima topilmadi";

    if (translationCache.size >= MAX_CACHE_SIZE) {
      const firstKey = translationCache.keys().next().value;
      translationCache.delete(firstKey);
    }
    translationCache.set(cacheKey, translated);

    return translated;
  } catch (error) {
    console.error("Tarjima xatosi:", error);
    return "Tarjima xatosi yuz berdi";
  } finally {
    isTranslating = false;
  }
}

// Yaxshilangan TTS funksiyasi
function speakText(text, lang = "en") {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const langMap = {
    uz: "uz-UZ",
    en: "en-US",
    ru: "ru-RU",
    tr: "tr-TR",
    ar: "ar-SA",
    fr: "fr-FR",
  };

  const utterance = new SpeechSynthesisUtterance(text);
  const targetVoiceLang = langMap[lang] || "en-US";

  // Eng mos ovozni topish
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice =
    voices.find((v) => v.lang === targetVoiceLang && !v.localService) ||
    voices.find((v) => v.lang === targetVoiceLang) ||
    voices.find((v) => v.lang.startsWith(lang));

  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.lang = targetVoiceLang;
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;

  window.speechSynthesis.speak(utterance);
}

// Voices yuklangandan keyin tayyor bo'lishi uchun
if ("speechSynthesis" in window) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

async function detectLanguage(text) {
  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text.slice(0, 100))}`
    );
    const data = await response.json();
    return data[2] || "en";
  } catch {
    return "en";
  }
}

function showTooltip(x, y, text, originalText) {
  hideTooltip();

  tooltip = document.createElement("div");
  tooltip.className = "translation-tooltip";

  Object.assign(tooltip.style, {
    position: "fixed",
    left: `${Math.min(x + 10, window.innerWidth - 270)}px`,
    top: `${Math.min(y + 10, window.innerHeight - 100)}px`,
    background: "linear-gradient(135deg, #2c3e50, #34495e)",
    color: "#ecf0f1",
    padding: "12px 16px",
    borderRadius: "10px",
    zIndex: "2147483647",
    fontSize: "14px",
    fontFamily: "system-ui, sans-serif",
    maxWidth: "250px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
    backdropFilter: "blur(10px)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    pointerEvents: "auto",
    cursor: "default",
    lineHeight: "1.4",
    wordWrap: "break-word",
    animation: "fadeIn 0.2s ease-out",
  });

  const textContainer = document.createElement("div");
  textContainer.style.flex = "1";

  const translatedText = document.createElement("div");
  translatedText.textContent = text;
  translatedText.style.fontWeight = "500";

  const playOriginalBtn = createButton(
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="currentColor"/></svg>`,
    "Asl matnni tinglash",
    "rgba(255,255,255,0.1)",
    "rgba(255,255,255,0.2)"
  );
  playOriginalBtn.addEventListener("click", async (e) => {
    e.stopPropagation();
    const detectedLang = await detectLanguage(originalText);
    speakText(originalText, detectedLang);
  });

  const playTranslatedBtn = createButton(
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="currentColor"/></svg>`,
    "Tarjimani tinglash",
    "rgba(76, 175, 80, 0.3)",
    "rgba(76, 175, 80, 0.5)"
  );
  playTranslatedBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    speakText(text, targetLang);
  });

  const closeBtn = createButton(
    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/></svg>`,
    "Yopish",
    "rgba(255,255,255,0.1)",
    "rgba(244, 67, 54, 0.3)"
  );
  closeBtn.style.width = "28px";
  closeBtn.style.height = "28px";
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    window.speechSynthesis.cancel();
    hideTooltip();
  });

  const buttonContainer = document.createElement("div");
  Object.assign(buttonContainer.style, {
    display: "flex",
    flexDirection: "row",
    gap: "8px",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "4px",
  });
  buttonContainer.appendChild(playOriginalBtn);
  buttonContainer.appendChild(playTranslatedBtn);
  buttonContainer.appendChild(closeBtn);

  textContainer.appendChild(translatedText);
  tooltip.appendChild(textContainer);
  tooltip.appendChild(buttonContainer);
  document.body.appendChild(tooltip);

  if (!document.querySelector("#tooltip-style")) {
    const style = document.createElement("style");
    style.id = "tooltip-style";
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .translation-tooltip:hover {
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
        transition: all 0.2s ease;
      }
    `;
    document.head.appendChild(style);
  }
}

function createButton(svgHTML, title, bgDefault, bgHover) {
  const btn = document.createElement("button");
  btn.innerHTML = svgHTML;
  btn.title = title;
  Object.assign(btn.style, {
    background: bgDefault,
    border: "none",
    color: "#fff",
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
  btn.addEventListener("mouseenter", () => {
    btn.style.background = bgHover;
    btn.style.transform = "scale(1.1)";
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.background = bgDefault;
    btn.style.transform = "scale(1)";
  });
  return btn;
}

const handleSelection = debounce(async (event) => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  if (
    !selectedText ||
    event.target.closest(".translation-tooltip") ||
    ["INPUT", "TEXTAREA"].includes(event.target.tagName) ||
    event.target.isContentEditable ||
    selectedText.length < 2 ||
    selectedText.length > 500
  ) {
    return;
  }

  const translatedText = await translateText(selectedText, targetLang);

  if (translatedText && translatedText !== selectedText) {
    const rect = selection.getRangeAt(0).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.bottom;
    showTooltip(x, y, translatedText, selectedText);
  }
}, 300);

document.addEventListener("mouseup", handleSelection);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    window.speechSynthesis.cancel();
    hideTooltip();
  }
});

let scrollTimeout;
document.addEventListener(
  "scroll",
  () => {
    if (tooltip) {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(hideTooltip, 100);
    }
  },
  true
);

document.addEventListener("mousedown", (event) => {
  if (tooltip && !event.target.closest(".translation-tooltip")) {
    setTimeout(() => {
      if (!hasValidSelection()) {
        hideTooltip();
      }
    }, 100);
  }
});
