let tooltip = null;
let isTranslating = false;

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
  isTranslating = true;

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

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data?.[0]?.[0]?.[0] || "Tarjima topilmadi";
  } catch (error) {
    console.error("Tarjima xatosi:", error);
    return "Tarjima xatosi yuz berdi";
  } finally {
    isTranslating = false;
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
    alignItems: "flex-start",
    justifyContent: "space-between",
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

  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "&times;";
  Object.assign(closeBtn.style, {
    background: "rgba(255,255,255,0.1)",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "18px",
    borderRadius: "50%",
    width: "24px",
    height: "24px",
    lineHeight: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });

  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    hideTooltip();
  });

  textContainer.appendChild(translatedText);
  textContainer.appendChild(originalTextEl);
  tooltip.appendChild(textContainer);
  tooltip.appendChild(closeBtn);
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

// ✅ ESC tugmasi bilan yopish
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    hideTooltip();
  }
});

// ✅ Scroll qilinsa tooltip yopiladi
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
