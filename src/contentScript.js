let tooltip = null;
let isTranslating = false;

// Cache va rate limiting
const translationCache = new Map();
const MAX_CACHE_SIZE = 100; // Maksimal cache hajmi
const RATE_LIMIT_DELAY = 1000; // 1 soniyada 1 so'rov
let lastRequestTime = 0;

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

async function translateText(text, targetLang) {
  if (isTranslating) return null;

  // Cache'dan tekshirish
  const cacheKey = `${text}_${targetLang}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  // Rate limiting
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    // Agar juda tez so'rov bo'lsa, kutish
    await new Promise((resolve) =>
      setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest)
    );
  }

  isTranslating = true;
  lastRequestTime = Date.now();

  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(
        text
      )}`,
      {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        // Rate limit xatosi
        console.warn("Tarjima limitiga yetildi, biroz kutib turing...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        isTranslating = false;
        return "Tarjima limitiga yetildi, biroz kutib turing...";
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const translated = data?.[0]?.[0]?.[0] || "Tarjima topilmadi";

    // Cache'ga saqlash
    if (translationCache.size >= MAX_CACHE_SIZE) {
      // Eski cache'ni tozalash (FIFO)
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

function speakText(text, lang = "auto") {
  if (!("speechSynthesis" in window)) {
    console.warn("Ovoz orqali o'qish qo'llab-quvvatlanmaydi");
    return;
  }

  // Avval to'xtatish
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  // Til kodini sozlash
  const langMap = {
    uz: "uz-UZ",
    en: "en-US",
    ru: "ru-RU",
    tr: "tr-TR",
    ar: "ar-SA",
    fr: "fr-FR",
    auto: "en-US", // Avtomatik til aniqlash uchun default
  };

  utterance.lang = langMap[lang] || langMap["en"];
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;

  window.speechSynthesis.speak(utterance);
}

// Asl matnning tilini aniqlash funksiyasi
async function detectLanguage(text) {
  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(
        text.slice(0, 100)
      )}`
    );
    const data = await response.json();
    return data[2] || "en"; // Google Translate API til kodini qaytaradi
  } catch {
    return "en"; // Xatolik bo'lsa default ingliz tili
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
  translatedText.style.marginBottom = "4px";

  const originalTextEl = document.createElement("div");
  originalTextEl.textContent = `"${originalText.slice(0, 50)}${
    originalText.length > 50 ? "..." : ""
  }"`;
  originalTextEl.style.fontSize = "12px";
  originalTextEl.style.opacity = "0.7";
  originalTextEl.style.fontStyle = "italic";

  const playOriginalBtn = document.createElement("button");
  playOriginalBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="currentColor"/>
    </svg>
  `;
  playOriginalBtn.title = "Asl matnni ovoz orqali o'qish";
  Object.assign(playOriginalBtn.style, {
    background: "rgba(255,255,255,0.1)",
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

  playOriginalBtn.addEventListener("mouseenter", () => {
    playOriginalBtn.style.background = "rgba(255,255,255,0.2)";
    playOriginalBtn.style.transform = "scale(1.1)";
  });

  playOriginalBtn.addEventListener("mouseleave", () => {
    playOriginalBtn.style.background = "rgba(255,255,255,0.1)";
    playOriginalBtn.style.transform = "scale(1)";
  });

  playOriginalBtn.addEventListener("click", async (e) => {
    e.stopPropagation();
    const detectedLang = await detectLanguage(originalText);
    speakText(originalText, detectedLang);
  });

  const playTranslatedBtn = document.createElement("button");
  playTranslatedBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="currentColor"/>
      <path d="M15.5 12L9.5 8v8l6-4z" fill="currentColor" opacity="0.3"/>
    </svg>
  `;
  playTranslatedBtn.title = "Tarjima qilingan matnni ovoz orqali o'qish";
  Object.assign(playTranslatedBtn.style, {
    background: "rgba(76, 175, 80, 0.3)",
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

  playTranslatedBtn.addEventListener("mouseenter", () => {
    playTranslatedBtn.style.background = "rgba(76, 175, 80, 0.5)";
    playTranslatedBtn.style.transform = "scale(1.1)";
  });

  playTranslatedBtn.addEventListener("mouseleave", () => {
    playTranslatedBtn.style.background = "rgba(76, 175, 80, 0.3)";
    playTranslatedBtn.style.transform = "scale(1)";
  });

  playTranslatedBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const targetLang = localStorage.getItem("targetLang") || "uz";
    speakText(text, targetLang);
  });

  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
    </svg>
  `;
  closeBtn.title = "Yopish";
  Object.assign(closeBtn.style, {
    background: "rgba(255,255,255,0.1)",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    borderRadius: "50%",
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    padding: "0",
  });

  closeBtn.addEventListener("mouseenter", () => {
    closeBtn.style.background = "rgba(244, 67, 54, 0.3)";
    closeBtn.style.transform = "scale(1.1)";
  });

  closeBtn.addEventListener("mouseleave", () => {
    closeBtn.style.background = "rgba(255,255,255,0.1)";
    closeBtn.style.transform = "scale(1)";
  });

  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    window.speechSynthesis.cancel();
    hideTooltip();
  });

  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.flexDirection = "row";
  buttonContainer.style.gap = "8px";
  buttonContainer.style.justifyContent = "center";
  buttonContainer.style.alignItems = "center";
  buttonContainer.style.marginTop = "4px";
  buttonContainer.appendChild(playOriginalBtn);
  buttonContainer.appendChild(playTranslatedBtn);
  buttonContainer.appendChild(closeBtn);

  textContainer.appendChild(translatedText);
  textContainer.appendChild(originalTextEl);
  tooltip.appendChild(textContainer);
  tooltip.appendChild(buttonContainer);
  document.body.appendChild(tooltip);

  // Add style tag once
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

  const targetLang = localStorage.getItem("targetLang") || "uz";
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
); // true => capturing fazada ishlasin

// ✅ Sahifaning boshqa joyiga click qilinsa
document.addEventListener("mousedown", (event) => {
  if (tooltip && !event.target.closest(".translation-tooltip")) {
    setTimeout(() => {
      if (!hasValidSelection()) {
        hideTooltip();
      }
    }, 100);
  }
});

// ✅ Til sozlanmasi birinchi marta ochilganda
document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("targetLang")) {
    localStorage.setItem("targetLang", "uz");
  }
  console.log(
    "Tarjima extension yuklandi! Til:",
    localStorage.getItem("targetLang")
  );
});
